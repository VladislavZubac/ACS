import { apiClient } from "@/src/shared/api/client";
import type {
  AuthResponse,
  LoginPayload,
  AdminUser,
} from "@/src/features/admin-auth/types";

export async function login(payload: LoginPayload) {
  const { data } = await apiClient.post<AuthResponse>(
    "/api/auth/login",
    payload,
  );
  return data;
}

export async function fetchCurrentAdmin() {
  const { data } = await apiClient.get<AdminUser>("/api/auth/me");
  return data;
}


