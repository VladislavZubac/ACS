import axios, { type AxiosError } from "axios";
import { appConfig } from "@/src/shared/config/env";
import {
  clearToken,
  getStoredToken,
} from "@/src/shared/auth/token-storage";

type UnauthorizedHandler = () => void;

const unauthorizedHandlers = new Set<UnauthorizedHandler>();

export const apiClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
  withCredentials: false,
});

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
      unauthorizedHandlers.forEach((handler) => handler());
    }

    return Promise.reject(error);
  },
);

export function onUnauthorized(handler: UnauthorizedHandler) {
  unauthorizedHandlers.add(handler);

  return () => {
    unauthorizedHandlers.delete(handler);
  };
}

export type ApiErrorPayload = {
  message?: string;
  error?: string;
  [key: string]: unknown;
};

export type ApiError = AxiosError<ApiErrorPayload>;

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Неизвестная ошибка"
    );
  }

  return "Неизвестная ошибка";
}

