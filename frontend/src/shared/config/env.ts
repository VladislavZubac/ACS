const DEFAULT_API_BASE_URL = "http://localhost:8080";

export const appConfig = {
  apiBaseUrl:
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
    DEFAULT_API_BASE_URL,
  themeStorageKey: "acs_theme",
  authTokenStorageKey: "acs_access_token",
};

