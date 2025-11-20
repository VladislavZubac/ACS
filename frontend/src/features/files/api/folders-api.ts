import { apiClient } from "@/src/shared/api/client";
import type {
  CreateFolderPayload,
  FolderContentDto,
  FolderDto,
} from "@/src/features/files/types";

export async function listFolders(parentFolderId?: string | null) {
  const { data } = await apiClient.get<FolderDto[]>("/api/folders", {
    params: parentFolderId ? { parentId: parentFolderId } : undefined,
  });

  return data;
}

export async function getFolderContent(folderId: string) {
  const { data } = await apiClient.get<FolderContentDto>(`/api/folders/${folderId}`);
  return data;
}

export async function createFolder(payload: CreateFolderPayload) {
  const { data } = await apiClient.post<FolderDto>("/api/folders", payload);
  return data;
}

export async function deleteFolder(folderId: string) {
  await apiClient.delete(`/api/folders/${folderId}`);
}

