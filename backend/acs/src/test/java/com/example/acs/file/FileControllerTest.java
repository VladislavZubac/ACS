package com.example.acs.file;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.acs.security.AppUserDetails;
import com.example.acs.user.UserEntity;
import com.example.acs.user.UserRole;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class FileControllerTest {

  @Autowired private MockMvc mockMvc;

  @Test
  void getFileShouldReturnNotFoundForUnknownId() throws Exception {
    AppUserDetails userDetails = new AppUserDetails(createUser());
    mockMvc
        .perform(get("/api/files/{id}", UUID.randomUUID()).with(user(userDetails)))
        .andExpect(status().isNotFound());
  }

  private UserEntity createUser() {
    return UserEntity.builder()
        .id(UUID.randomUUID())
        .username("tester")
        .passwordHash("pwd")
        .role(UserRole.USER)
        .assignedSpaceBytes(1024)
        .usedSpaceBytes(0)
        .build();
  }
}

