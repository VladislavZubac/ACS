const DEFAULT_API_BASE_URL = "http://localhost:8080";

export const appConfig = {
  apiBaseUrl:
    process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL?.replace(/\/$/, "") ??
    DEFAULT_API_BASE_URL,
  adminTokenStorageKey: "acs_admin_token",
  themeStorageKey: "acs_admin_theme",
};


