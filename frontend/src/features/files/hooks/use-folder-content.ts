"use client";

import { useQuery } from "@tanstack/react-query";
import { listFiles } from "@/src/features/files/api/files-api";
import {
  getFolderContent,
  listFolders,
} from "@/src/features/files/api/folders-api";
import type { FolderContentDto } from "@/src/features/files/types";

type FolderData = FolderContentDto;

export function useFolderContent(folderId?: string | null) {
  return useQuery<FolderData>({
    queryKey: ["folder-content", folderId ?? "root"],
    queryFn: async () => {
      if (!folderId || folderId === "root") {
        const [children, files] = await Promise.all([listFolders(), listFiles()]);
        const fakeTimestamp = new Date().toISOString();
        return {
          folder: {
            id: "root",
            name: "Мои файлы",
            path: "/",
            parentFolderId: null,
            createdAt: fakeTimestamp,
            updatedAt: fakeTimestamp,
          },
          children,
          files,
        };
      }

      return getFolderContent(folderId);
    },
    staleTime: 30_000,
  });
}

