"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useEffect,
  useEffectEvent,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  fetchCurrentAdmin,
  login as loginRequest,
} from "@/src/features/admin-auth/api/admin-auth-api";
import type {
  AdminUser,
  AuthResponse,
  LoginPayload,
} from "@/src/features/admin-auth/types";
import {
  clearToken,
  getStoredToken,
  saveToken,
} from "@/src/shared/auth/token-storage";
import { onUnauthorized } from "@/src/shared/api/client";

export type AdminAuthStatus =
  | "idle"
  | "checking"
  | "authenticated"
  | "unauthenticated";

type AdminAuthContextValue = {
  status: AdminAuthStatus;
  user: AdminUser | null;
  token: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
};

export const AdminAuthContext =
  createContext<AdminAuthContextValue | null>(null);

type Props = {
  children: ReactNode;
};

export function AdminAuthProvider({ children }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<AdminAuthStatus>("idle");
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const handleAuthSuccess = useCallback((response: AuthResponse) => {
    if (response.user.role !== "ADMIN") {
      throw new Error("У пользователя нет прав администратора");
    }
    saveToken(response.token);
    setToken(response.token);
    setUser(response.user);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setToken(null);
    setUser(null);
    setStatus("unauthenticated");
    router.replace("/admin/login");
  }, [router]);

  const initialize = useEffectEvent(async () => {
    const storedToken = getStoredToken();

    if (!storedToken) {
      setStatus("unauthenticated");
      return;
    }

    setToken(storedToken);
    setStatus("checking");

    try {
      const admin = await fetchCurrentAdmin();
      if (admin.role !== "ADMIN") {
        throw new Error("Недостаточно прав");
      }
      setUser(admin);
      setStatus("authenticated");
    } catch (error) {
      console.error("[admin-auth] failed to restore session", error);
      logout();
    }
  });

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    const unsubscribe = onUnauthorized(() => {
      logout();
    });
    return unsubscribe;
  }, [logout]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const response = await loginRequest(payload);
      handleAuthSuccess(response);
      router.replace("/admin");
    },
    [handleAuthSuccess, router],
  );

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      status,
      user,
      token,
      login,
      logout,
    }),
    [status, user, token, login, logout],
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}


