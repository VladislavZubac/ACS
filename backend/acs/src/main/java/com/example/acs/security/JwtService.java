package com.example.acs.security;

import com.example.acs.config.JwtProperties;
import com.example.acs.user.UserEntity;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;
import javax.crypto.SecretKey;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class JwtService {

  private final JwtProperties properties;

  public String extractUsername(String token) {
    return extractClaim(token, Claims::getSubject);
  }

  public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
    Claims claims =
        Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();
    return claimsResolver.apply(claims);
  }

  public String generateToken(UserEntity user) {
    return buildToken(
        Map.of(
            "uid", user.getId().toString(),
            "role", user.getRole().name()),
        user.getUsername());
  }

  private String buildToken(Map<String, Object> extraClaims, String subject) {
    Instant now = Instant.now();
    Date issuedAt = Date.from(now);
    Date expiration = Date.from(now.plusSeconds(properties.expirationSeconds()));
    return Jwts.builder()
        .claims(extraClaims)
        .subject(subject)
        .issuedAt(issuedAt)
        .expiration(expiration)
        .signWith(getSigningKey(), SignatureAlgorithm.HS256)
        .compact();
  }

  public boolean isTokenValid(String token, String username) {
    String tokenUsername = extractUsername(token);
    return tokenUsername.equals(username) && !isTokenExpired(token);
  }

  private boolean isTokenExpired(String token) {
    return extractExpiration(token).before(new Date());
  }

  private Date extractExpiration(String token) {
    return extractClaim(token, Claims::getExpiration);
  }

  private SecretKey getSigningKey() {
    String secret = properties.secret();
    byte[] keyBytes;
    try {
      // Приводим секрет к 256-битному ключу вне зависимости от его длины.
      MessageDigest digest = MessageDigest.getInstance("SHA-256");
      keyBytes = digest.digest(secret.getBytes(StandardCharsets.UTF_8));
    } catch (NoSuchAlgorithmException e) {
      throw new IllegalStateException("SHA-256 algorithm not available", e);
    }
    return Keys.hmacShaKeyFor(keyBytes);
  }
}

