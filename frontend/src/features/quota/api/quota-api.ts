import { apiClient } from "@/src/shared/api/client";

export type QuotaInfo = {
  assignedSpaceBytes: number;
  usedSpaceBytes: number;
};

export async function getQuota() {
  const { data } = await apiClient.get<QuotaInfo>("/api/quota");
  return data;
}

