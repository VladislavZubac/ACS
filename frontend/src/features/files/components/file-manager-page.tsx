"use client";

import {
  Fragment,
  useCallback,
  useMemo,
  useState,
  type ComponentType,
  type MouseEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  CalendarClock,
  ChevronRight,
  Download,
  FileArchive,
  FileText,
  Image as ImageIcon,
  Loader2,
  Music3,
  Plus,
  Share2,
  Star,
  Trash2,
  Upload,
  Video,
} from "lucide-react";
import { UploadZone } from "@/src/features/files/components/upload-zone";
import { deleteFile, fetchFileBinary, uploadFile } from "@/src/features/files/api/files-api";
import { createFolder, deleteFolder } from "@/src/features/files/api/folders-api";
import { FilePreviewModal } from "@/src/features/files/components/file-preview-modal";
import { useFolderContent } from "@/src/features/files/hooks/use-folder-content";
import type { FileDto, FolderDto } from "@/src/features/files/types";
import { resolveFileKind, type FileKind } from "@/src/features/files/utils/file-type";
import { getApiErrorMessage } from "@/src/shared/api/client";
import { downloadBlob, formatBytes } from "@/src/shared/lib/utils";
import { Button } from "@/src/shared/ui/button";
import {
  ShareModal,
  type ShareModalTarget,
} from "@/src/features/share/components/share-modal";
import { useErrorNotifications } from "@/src/shared/providers/error/error-provider";

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "short",
});

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

const fileTypeIconMap: Record<FileKind, ComponentType<{ className?: string }>> = {
  image: ImageIcon,
  video: Video,
  document: FileText,
  archive: FileArchive,
  audio: Music3,
  text: FileText,
  other: FileText,
};

type FileSortField = "name" | "size" | "updatedAt";
type SortDirection = "asc" | "desc";

const fileSortOptions: Array<{ value: FileSortField; label: string }> = [
  { value: "name", label: "По имени" },
  { value: "size", label: "По размеру" },
  { value: "updatedAt", label: "По дате" },
];

const fileSortComparators: Record<FileSortField, (a: FileDto, b: FileDto) => number> = {
  name: (a, b) => a.originalName.localeCompare(b.originalName, "ru"),
  size: (a, b) => a.sizeBytes - b.sizeBytes,
  updatedAt: (a, b) =>
    new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
};

type IconButtonProps = {
  label: string;
  icon: ComponentType<{ className?: string }>;
  active?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
};

function IconButton({ label, icon: Icon, active, onClick, disabled }: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex h-9 w-9 items-center justify-center rounded-2xl border border-border/70 text-muted-foreground transition hover:border-primary/60 hover:text-primary ${
        active ? "border-primary/60 bg-primary/10 text-primary" : ""
      } ${disabled ? "opacity-60" : ""}`}
      aria-label={label}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

type FolderCardProps = {
  folder: FolderDto;
  onOpen: (folder: FolderDto) => void;
  onDelete: (folder: FolderDto) => void;
  onShare: (folder: FolderDto) => void;
  isDeleting?: boolean;
};

function FolderCard({ folder, onOpen, onDelete, onShare, isDeleting }: FolderCardProps) {
  const handleOpen = () => {
    onOpen(folder);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleOpen();
        }
      }}
      className="group flex flex-col rounded-3xl border border-border/70 bg-card/80 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Star className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-foreground">{folder.name}</p>
          <p className="text-xs text-muted-foreground">Обновлено {formatDate(folder.updatedAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <IconButton label="Открыть" icon={ChevronRight} onClick={handleOpen} />
          <IconButton
            label="Поделиться"
            icon={Share2}
            onClick={(event: MouseEvent<HTMLButtonElement>) => {
              event.stopPropagation();
              event.preventDefault();
              onShare(folder);
            }}
          />
          <IconButton
            label="Удалить"
            icon={Trash2}
            onClick={(event: MouseEvent<HTMLButtonElement>) => {
              event.stopPropagation();
              event.preventDefault();
              onDelete(folder);
            }}
            disabled={isDeleting}
          />
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
        <span>Элементов внутри</span>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px]">Папка</span>
      </div>
    </div>
  );
}

type FileCardProps = {
  file: FileDto;
  onDownload: (file: FileDto) => Promise<void> | void;
  onDelete: (file: FileDto) => void;
  onPreview: (file: FileDto) => void;
  onShare: (file: FileDto) => void;
  isDeleting?: boolean;
};

function FileCard({
  file,
  onDownload,
  onDelete,
  onPreview,
  onShare,
  isDeleting,
}: FileCardProps) {
  const type = resolveFileKind(file.mimeType);
  const Icon = fileTypeIconMap[type];

  return (
    <div
      className="group flex flex-col rounded-3xl border border-border/60 bg-card/70 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
      role="button"
      tabIndex={0}
      onClick={() => onPreview(file)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onPreview(file);
        }
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="line-clamp-2 font-medium text-foreground">{file.originalName}</p>
            <p className="text-xs text-muted-foreground">{formatBytes(file.sizeBytes)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 opacity-0 transition group-hover:opacity-100">
          <IconButton
            label="Скачать"
            icon={Download}
            onClick={() => {
              void onDownload(file);
            }}
          />
          <IconButton
            label="Поделиться"
            icon={Share2}
            onClick={(event: MouseEvent<HTMLButtonElement>) => {
              event.stopPropagation();
              onShare(file);
            }}
          />
          <IconButton
            label="Удалить"
            icon={Trash2}
            onClick={(event: MouseEvent<HTMLButtonElement>) => {
              event.stopPropagation();
              onDelete(file);
            }}
            disabled={isDeleting}
          />
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
        <span>Обновлено {formatDate(file.updatedAt)}</span>
      </div>
    </div>
  );
}

type FileManagerPageProps = {
  folderId?: string;
};

const quickStatsLabels = [
  {
    label: "Файлов в папке",
    hint: "Текущая выборка",
  },
  {
    label: "Подпапки",
    hint: "Сразу внутри",
  },
  {
    label: "Последнее обновление",
    hint: "По данным папки",
  },
];

export function FileManagerPage({ folderId }: FileManagerPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const [deletingFolderId, setDeletingFolderId] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<FileDto | null>(null);
  const [shareTarget, setShareTarget] = useState<ShareModalTarget | null>(null);
  const [sortField, setSortField] = useState<FileSortField>("updatedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const currentFolderKey = folderId ?? "root";
  const syncQuota = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["quota"] });
  }, [queryClient]);

  const invalidateFolderQuery = useCallback(() => {
    return queryClient.invalidateQueries({
      queryKey: ["folder-content", currentFolderKey],
    });
  }, [queryClient, currentFolderKey]);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useFolderContent(folderId);

  const sortedFiles = useMemo(() => {
    if (!data) {
      return [];
    }
    const items = [...data.files];
    items.sort((a, b) => {
      const compare = fileSortComparators[sortField](a, b);
      return sortDirection === "asc" ? compare : -compare;
    });
    return items;
  }, [data, sortField, sortDirection]);

  const visibleFiles = sortedFiles;

  const { notifyError } = useErrorNotifications();

  const handleMutationError = useCallback(
    (err: unknown) => {
      notifyError(getApiErrorMessage(err));
    },
    [notifyError],
  );

  const toggleSortDirection = useCallback(() => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  }, []);

  const createFolderMutation = useMutation({
    mutationFn: (name: string) =>
      createFolder({
        name,
        parentFolderId: folderId ?? null,
      }),
    onSuccess: () => {
      void invalidateFolderQuery();
    },
    onError: handleMutationError,
  });

  const uploadFilesMutation = useMutation({
    mutationFn: async (files: File[]) => {
      for (const file of files) {
        setUploadStatus(file.name);
        await uploadFile({
          file,
          folderId: folderId ?? null,
        });
      }
    },
    onSuccess: () => {
      setUploadStatus(null);
      void invalidateFolderQuery();
      syncQuota();
    },
    onError: (err) => {
      setUploadStatus(null);
      handleMutationError(err);
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: (fileId: string) => deleteFile(fileId),
    onSuccess: () => {
      setDeletingFileId(null);
      void invalidateFolderQuery();
      syncQuota();
    },
    onError: (err) => {
      setDeletingFileId(null);
      handleMutationError(err);
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: (folderToDeleteId: string) => deleteFolder(folderToDeleteId),
    onSuccess: () => {
      setDeletingFolderId(null);
      void invalidateFolderQuery();
      syncQuota();
    },
    onError: (err) => {
      setDeletingFolderId(null);
      handleMutationError(err);
    },
  });

  const handleFilesSelected = useCallback(
    (fileList: FileList) => {
      if (!fileList.length) {
        return;
      }
      const files = Array.from(fileList);
      uploadFilesMutation.mutate(files);
    },
    [uploadFilesMutation],
  );

  const handleCreateFolder = useCallback(() => {
    const name = window.prompt("Введите название папки");
    if (!name) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    createFolderMutation.mutate(trimmed);
  }, [createFolderMutation]);

  const handleDownloadFile = useCallback(
    async (file: FileDto) => {
      try {
        const { blob } = await fetchFileBinary(file.id, "download");
        downloadBlob(blob, file.originalName);
      } catch (err) {
        handleMutationError(err);
      }
    },
    [handleMutationError],
  );

  const handleDeleteFile = useCallback(
    (file: FileDto) => {
      if (!window.confirm(`Удалить файл «${file.originalName}»?`)) {
        return;
      }
      setDeletingFileId(file.id);
      deleteFileMutation.mutate(file.id);
    },
    [deleteFileMutation],
  );

  const handleOpenFolder = useCallback(
    (targetFolder: FolderDto) => {
      router.push(`/files/${targetFolder.id}`);
    },
    [router],
  );

  const handleDeleteFolder = useCallback(
    (targetFolder: FolderDto) => {
      if (!window.confirm(`Удалить папку «${targetFolder.name}» и всё содержимое?`)) {
        return;
      }
      setDeletingFolderId(targetFolder.id);
      deleteFolderMutation.mutate(targetFolder.id);
    },
    [deleteFolderMutation],
  );

  const handlePreviewFile = useCallback((file: FileDto) => {
    setPreviewFile(file);
  }, []);

  const closePreview = useCallback(() => setPreviewFile(null), []);

  const openShareForFile = useCallback((file: FileDto) => {
    setShareTarget({
      type: "file",
      id: file.id,
      name: file.originalName,
    });
  }, []);

  const openShareForFolder = useCallback((folder: FolderDto) => {
    setShareTarget({
      type: "folder",
      id: folder.id,
      name: folder.name,
    });
  }, []);

  const closeShareModal = useCallback(() => setShareTarget(null), []);

  const breadcrumbs = useMemo(() => {
    const base = [{ label: "Мои файлы", href: "/files" }];

    if (folderId && data?.folder) {
      base.push({
        label: data.folder.name,
        href: `/files/${folderId}`,
      });
    }

    return base;
  }, [folderId, data]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card/70 px-5 py-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Загружаем содержимое папки...
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">Не удалось загрузить данные</h2>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Попробуйте обновить страницу."}
          </p>
        </div>
        <Button onClick={() => refetch()} loading={isRefetching} className="rounded-2xl px-6">
          Повторить попытку
        </Button>
      </div>
    );
  }

  const { folder, children, files } = data;

  const quickStats = [
    {
      ...quickStatsLabels[0],
      value: files.length.toString(),
    },
    {
      ...quickStatsLabels[1],
      value: children.length.toString(),
    },
    {
      ...quickStatsLabels[2],
      value: formatDate(folder.updatedAt),
    },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-6 rounded-3xl border border-border/60 bg-card/80 p-6 shadow-card lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {breadcrumbs.map((crumb, index) => (
              <Fragment key={crumb.href}>
                {index > 0 ? <ChevronRight className="h-3 w-3 text-border" /> : null}
                <Link href={crumb.href} className="font-medium text-foreground hover:text-primary">
                  {crumb.label}
                </Link>
              </Fragment>
            ))}
          </nav>
          <div>
            <p className="text-sm uppercase tracking-[0.15em] text-primary/70">
              Рабочее пространство
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              {folder.name}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="gap-2 rounded-2xl px-5"
            onClick={handleCreateFolder}
            loading={createFolderMutation.isPending}
          >
            <Plus className="h-4 w-4" />
            Новая папка
          </Button>
          <Button
            className="gap-2 rounded-2xl px-5"
            onClick={() => {
              const input = document.querySelector<HTMLInputElement>(
                "#upload-zone input[type='file']",
              );
              input?.click();
            }}
            disabled={uploadFilesMutation.isPending}
          >
            <Upload className="h-4 w-4" />
            Загрузить
          </Button>
        </div>
      </header>

      <section>
        <UploadZone
          id="upload-zone"
          onFilesSelected={handleFilesSelected}
          isUploading={uploadFilesMutation.isPending}
          statusMessage={uploadStatus ? `Загружаем ${uploadStatus}` : null}
        />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {quickStats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-3xl border border-border/70 bg-card/80 p-4 shadow-inner"
          >
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.hint}</p>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Папки</h2>
            <p className="text-sm text-muted-foreground">
              {children.length > 0
                ? "Выберите папку, чтобы открыть вложения"
                : "Здесь пока нет подпапок"}
            </p>
          </div>
          <Button variant="ghost" className="gap-2 rounded-2xl px-4 text-sm">
            <CalendarClock className="h-4 w-4" />
            Недавние
          </Button>
        </div>

        {children.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {children.map((folderItem) => (
              <FolderCard
                key={folderItem.id}
                folder={folderItem}
                onOpen={handleOpenFolder}
                onDelete={handleDeleteFolder}
                onShare={openShareForFolder}
                isDeleting={deletingFolderId === folderItem.id && deleteFolderMutation.isPending}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-border/70 bg-card/60 p-6 text-sm text-muted-foreground">
            Добавьте первую папку, чтобы упорядочить файлы.
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Файлы</h2>
            <p className="text-sm text-muted-foreground">
              {files.length > 0
                ? "Полный список файлов в текущей папке"
                : "Здесь пока нет файлов"}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-card/60 px-3 py-2 text-sm text-muted-foreground">
            <label htmlFor="file-sort-field" className="sr-only">
              Поле сортировки
            </label>
            <select
              id="file-sort-field"
              value={sortField}
              onChange={(event) => setSortField(event.target.value as FileSortField)}
              className="bg-transparent text-foreground focus:outline-none"
            >
              {fileSortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-transparent text-foreground transition hover:border-border"
              onClick={toggleSortDirection}
              aria-label={sortDirection === "asc" ? "По возрастанию" : "По убыванию"}
            >
              {sortDirection === "asc" ? (
                <ArrowUpAZ className="h-4 w-4" />
              ) : (
                <ArrowDownAZ className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {visibleFiles.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleFiles.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                onDownload={handleDownloadFile}
                onDelete={handleDeleteFile}
                onPreview={handlePreviewFile}
                onShare={openShareForFile}
                isDeleting={deletingFileId === file.id && deleteFileMutation.isPending}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-border/70 bg-card/60 p-6 text-sm text-muted-foreground">
            Загрузите файлы с компьютера или перетащите их в область выше.
          </div>
        )}
      </section>

      <FilePreviewModal
        file={previewFile}
        open={Boolean(previewFile)}
        onClose={closePreview}
        onDownload={handleDownloadFile}
      />
      <ShareModal open={Boolean(shareTarget)} target={shareTarget} onClose={closeShareModal} />
    </div>
  );
}

