import { apiClient } from "@/src/shared/api/client";

export type AdminUserDto = {
  id: string;
  username: string;
  role: "USER" | "ADMIN";
  assignedSpaceBytes: number;
  usedSpaceBytes: number;
};

export type UpdateQuotaPayload = {
  assignedSpaceBytes: number;
};

export async function getAdminUsers() {
  const { data } = await apiClient.get<AdminUserDto[]>(
    "/api/admin/stats/users",
  );
  return data;
}

export async function updateUserQuota(
  userId: string,
  payload: UpdateQuotaPayload,
) {
  const { data } = await apiClient.patch<AdminUserDto>(
    `/api/admin/users/${userId}/quota`,
    payload,
  );
  return data;
}


