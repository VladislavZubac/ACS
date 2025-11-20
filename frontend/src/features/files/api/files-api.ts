import { apiClient } from "@/src/shared/api/client";
import type { FileDto } from "@/src/features/files/types";

export async function listFiles(folderId?: string | null) {
  const { data } = await apiClient.get<FileDto[]>("/api/files", {
    params: folderId ? { folderId } : undefined,
  });

  return data;
}

export async function uploadFile({
  file,
  folderId,
}: {
  file: File;
  folderId?: string | null;
}) {
  const formData = new FormData();
  formData.append("file", file);
  if (folderId) {
    formData.append("folderId", folderId);
  }

  const { data } = await apiClient.post<FileDto>("/api/files", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
}

export async function deleteFile(fileId: string) {
  await apiClient.delete(`/api/files/${fileId}`);
}

export function getFileDownloadUrl(fileId: string) {
  return `${apiClient.defaults.baseURL}/api/files/${fileId}/download`;
}

export function getFilePreviewUrl(fileId: string) {
  return `${apiClient.defaults.baseURL}/api/files/${fileId}/preview`;
}

