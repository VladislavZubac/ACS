import { apiClient } from "@/src/shared/api/client";
import type {
  CreateShareInput,
  ShareDto,
  SharePublicDto,
} from "@/src/features/share/types";

export async function createShareLink({
  targetId,
  targetType,
  ttl,
}: CreateShareInput) {
  const payload =
    targetType === "file"
      ? { fileId: targetId, ttl }
      : { folderId: targetId, ttl };

  const { data } = await apiClient.post<ShareDto>("/api/share", payload);
  return data;
}

export async function getPublicShare(token: string) {
  const { data } = await apiClient.get<SharePublicDto>(
    `/api/public/share/${token}`,
  );
  return data;
}

export function getPublicShareDownloadUrl(token: string) {
  return `${apiClient.defaults.baseURL}/api/public/share/${token}/download`;
}

