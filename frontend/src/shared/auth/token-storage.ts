import { appConfig } from "@/src/shared/config/env";

export function getStoredToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(appConfig.authTokenStorageKey);
}

export function saveToken(token: string) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(appConfig.authTokenStorageKey, token);
}

export function clearToken() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(appConfig.authTokenStorageKey);
}

