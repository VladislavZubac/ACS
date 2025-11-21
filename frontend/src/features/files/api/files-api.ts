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

export type FileBinaryPayload = {
  blob: Blob;
  contentType: string;
};

export async function fetchFileBinary(
  fileId: string,
  variant: "download" | "preview" = "download",
  signal?: AbortSignal,
): Promise<FileBinaryPayload> {
  const endpoint =
    variant === "preview" ? `/api/files/${fileId}/preview` : `/api/files/${fileId}/download`;

  const response = await apiClient.get<Blob>(endpoint, {
    responseType: "blob",
    signal,
  });

  return {
    blob: response.data,
    contentType: (response.headers["content-type"] as string | undefined) ?? "application/octet-stream",
  };
}

