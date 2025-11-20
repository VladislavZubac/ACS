package com.example.acs.security;

import com.example.acs.config.CacheNames;
import com.example.acs.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppUserDetailsService implements UserDetailsService {

  private final UserRepository userRepository;

  @Override
  @Cacheable(
      cacheNames = CacheNames.USER_DETAILS,
      key = "#username == null ? null : #username.trim().toLowerCase()")
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    String normalized = normalize(username);
    return userRepository
        .findByUsername(normalized)
        .map(AppUserDetails::new)
        .orElseThrow(() -> new UsernameNotFoundException("User not found: " + normalized));
  }

  private String normalize(String username) {
    if (username == null) {
      throw new UsernameNotFoundException("Username is required");
    }
    return username.trim().toLowerCase();
  }
}

