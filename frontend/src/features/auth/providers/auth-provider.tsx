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
import { onUnauthorized } from "@/src/shared/api/client";
import {
  clearToken,
  getStoredToken,
  saveToken,
} from "@/src/shared/auth/token-storage";
import {
  fetchCurrentUser,
  login as loginRequest,
  signup as signupRequest,
} from "@/src/features/auth/api/auth-api";
import type {
  AuthResponse,
  AuthUser,
  LoginPayload,
  SignupPayload,
} from "@/src/features/auth/types";

export type AuthStatus = "idle" | "checking" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  token: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

type Props = {
  children: ReactNode;
};

export function AuthProvider({ children }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const handleAuthSuccess = useCallback((response: AuthResponse) => {
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
    router.replace("/login");
  }, [router]);

  const initialize = useEffectEvent(async () => {
    const storedToken = getStoredToken();

    if (!storedToken) {
      setStatus("unauthenticated");
      return;
    }

    setStatus("checking");
    setToken(storedToken);

    try {
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
      setStatus("authenticated");
    } catch (error) {
      console.error("[auth] failed to fetch current user", error);
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
      router.replace("/files");
    },
    [handleAuthSuccess, router],
  );

  const signup = useCallback(
    async (payload: SignupPayload) => {
      const response = await signupRequest(payload);
      handleAuthSuccess(response);
      router.replace("/files");
    },
    [handleAuthSuccess, router],
  );

  const refreshUser = useCallback(async () => {
    try {
      const nextUser = await fetchCurrentUser();
      setUser(nextUser);
      setStatus("authenticated");
    } catch (error) {
      console.error("[auth] refresh failed", error);
      logout();
    }
  }, [logout]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      token,
      login,
      signup,
      logout,
      refreshUser,
    }),
    [status, user, token, login, signup, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

