import { apiClient } from "@/src/shared/api/client";
import type {
  AuthResponse,
  AuthUser,
  LoginPayload,
  SignupPayload,
} from "@/src/features/auth/types";

export async function login(payload: LoginPayload) {
  const { data } = await apiClient.post<AuthResponse>("/api/auth/login", payload);
  return data;
}

export async function signup(payload: SignupPayload) {
  const { data } = await apiClient.post<AuthResponse>("/api/auth/signup", payload);
  return data;
}

export async function fetchCurrentUser() {
  const { data } = await apiClient.get<AuthUser>("/api/auth/me");
  return data;
}

