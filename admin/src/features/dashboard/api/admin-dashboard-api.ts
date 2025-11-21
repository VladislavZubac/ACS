import { apiClient } from "@/src/shared/api/client";

export type AdminSummary = {
  totalUsers: number;
  totalFiles: number;
  totalAssignedBytes: number;
  totalUsedBytes: number;
};

export async function getAdminSummary() {
  const { data } = await apiClient.get<AdminSummary>(
    "/api/admin/stats/summary",
  );
  return data;
}


