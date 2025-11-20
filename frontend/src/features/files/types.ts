export type FolderDto = {
  id: string;
  name: string;
  path: string;
  parentFolderId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FileDto = {
  id: string;
  originalName: string;
  folderId: string | null;
  sizeBytes: number;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
};

export type FolderContentDto = {
  folder: FolderDto;
  children: FolderDto[];
  files: FileDto[];
};

export type CreateFolderPayload = {
  name: string;
  parentFolderId?: string | null;
};

