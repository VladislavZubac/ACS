import type { FileDto, FolderDto } from "@/src/features/files/types";

export type ShareTtlOption = "H1" | "H24" | "D7" | "D30";

export type ShareTargetType = "FILE" | "FOLDER";

export type ShareDto = {
  id: string;
  token: string;
  targetType: ShareTargetType;
  targetId: string | null;
  targetName: string;
  expiresAt: string;
  revoked: boolean;
  createdAt: string;
};

export type SharePublicDto = {
  share: ShareDto;
  file: FileDto | null;
  folder: FolderDto | null;
  folderFiles: FileDto[];
};

export type CreateShareInput = {
  targetId: string;
  targetType: "file" | "folder";
  ttl: ShareTtlOption;
};

