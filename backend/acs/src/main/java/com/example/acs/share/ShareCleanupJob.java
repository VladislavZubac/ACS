package com.example.acs.share;

import com.example.acs.config.CacheNames;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ShareCleanupJob {

  private final ShareLinkRepository shareLinkRepository;

  @Scheduled(fixedDelayString = "${app.share.cleanup-fixed-delay:PT1H}")
  @org.springframework.cache.annotation.CacheEvict(cacheNames = CacheNames.SHARE_LINKS, allEntries = true)
  public void removeExpiredShares() {
    Instant now = Instant.now();
    List<ShareLinkEntity> expired = shareLinkRepository.findByExpiresAtBefore(now);
    if (expired.isEmpty()) {
      return;
    }
    shareLinkRepository.deleteAll(expired);
    log.info("Removed {} expired share links", expired.size());
  }
}

