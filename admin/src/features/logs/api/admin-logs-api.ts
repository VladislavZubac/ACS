import { apiClient } from "@/src/shared/api/client";

export type AdminLogsResponse = {
  lines?: string[];
  content?: string;
};

export type AdminLogsQueryParams = {
  tail?: number;
};

function normalizeLogsPayload(payload: AdminLogsResponse | string) {
  if (typeof payload === "string") {
    return payload;
  }

  if (Array.isArray(payload.lines)) {
    return payload.lines.join("\n");
  }

  if (typeof payload.content === "string") {
    return payload.content;
  }

  return "";
}

export async function getAdminLogs(params?: AdminLogsQueryParams) {
  const response = await apiClient.get<string>("/api/admin/logs", {
    params,
    responseType: "text",
    transformResponse: (value) => value,
  });

  const rawPayload = response.data ?? "";

  try {
    const parsed = JSON.parse(rawPayload) as AdminLogsResponse;
    return normalizeLogsPayload(parsed);
  } catch {
    return normalizeLogsPayload(rawPayload);
  }
}


