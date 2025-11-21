"use client";

import { useCallback, useEffect, useEffectEvent, useMemo, useState } from "react";
import axios from "axios";
import { Download, Loader2, X } from "lucide-react";
import type { FileDto } from "@/src/features/files/types";
import { fetchFileBinary } from "@/src/features/files/api/files-api";
import { resolveFileKind } from "@/src/features/files/utils/file-type";
import { Button } from "@/src/shared/ui/button";
import { formatBytes } from "@/src/shared/lib/utils";
import { getApiErrorMessage } from "@/src/shared/api/client";

type Props = {
  file: FileDto | null;
  open: boolean;
  onClose: () => void;
  onDownload?: (file: FileDto) => Promise<void> | void;
};

const TEXT_PREVIEW_LIMIT = 200_000; // ~200 KB
const MEDIA_MAX_WIDTH = 960;
const MEDIA_MAX_HEIGHT = 540;

export function FilePreviewModal({ file, open, onClose, onDownload }: Props) {
  const [textPreview, setTextPreview] = useState<string | null>(null);
  const [isTextLoading, setIsTextLoading] = useState(false);
  const [textError, setTextError] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [isMediaLoading, setIsMediaLoading] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const kind = useMemo(() => resolveFileKind(file?.mimeType), [file?.mimeType]);

  const resetTextState = useEffectEvent(() => {
    setTextPreview(null);
    setIsTextLoading(false);
    setTextError(null);
  });

  const resetMediaState = useEffectEvent(() => {
    setMediaUrl((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return null;
    });
    setIsMediaLoading(false);
    setMediaError(null);
  });

  const loadTextPreview = useEffectEvent(async (targetFile: FileDto, signal: AbortSignal) => {
    setIsTextLoading(true);
    setTextError(null);
    setTextPreview(null);

    try {
      const { blob } = await fetchFileBinary(targetFile.id, "download", signal);
      const slice = blob.slice(0, TEXT_PREVIEW_LIMIT);
      const text = await slice.text();
      if (!signal.aborted) {
        setTextPreview(text);
      }
    } catch (error) {
      if (signal.aborted) {
        return;
      }
      setTextError(getApiErrorMessage(error));
    } finally {
      if (!signal.aborted) {
        setIsTextLoading(false);
      }
    }
  });

  const loadMediaPreview = useEffectEvent(
    async (
      targetFile: FileDto,
      options: { preferPreview?: boolean },
      signal: AbortSignal,
    ) => {
      setIsMediaLoading(true);
      setMediaError(null);
      setMediaUrl((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }
        return null;
      });

      const assignBlobUrl = (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        setMediaUrl(url);
      };

      try {
        if (options.preferPreview) {
          try {
            const { blob } = await fetchFileBinary(targetFile.id, "preview", signal);
            if (!signal.aborted) {
              assignBlobUrl(blob);
              return;
            }
          } catch (error) {
            const isNotFound =
              axios.isAxiosError(error) && error.response?.status === 404;
            if (!isNotFound) {
              throw error;
            }
          }
        }

        const { blob } = await fetchFileBinary(targetFile.id, "download", signal);
        if (!signal.aborted) {
          assignBlobUrl(blob);
        }
      } catch (error) {
        if (!signal.aborted) {
          setMediaError(getApiErrorMessage(error));
        }
      } finally {
        if (!signal.aborted) {
          setIsMediaLoading(false);
        }
      }
    },
  );

  const handleDownloadClick = useCallback(async () => {
    if (!file || !onDownload) {
      return;
    }

    setIsDownloading(true);
    try {
      await onDownload(file);
    } finally {
      setIsDownloading(false);
    }
  }, [file, onDownload]);

  useEffect(() => {
    if (!open || !file || kind !== "text") {
      resetTextState();
      return;
    }

    const controller = new AbortController();
    loadTextPreview(file, controller.signal);

    return () => controller.abort();
  }, [file, file?.id, kind, open]);

  useEffect(() => {
    if (!open || !file) {
      resetMediaState();
      return;
    }

    if (kind === "image" || kind === "video" || kind === "audio") {
      const controller = new AbortController();
      loadMediaPreview(file, { preferPreview: kind === "image" }, controller.signal);
      return () => controller.abort();
    }

    resetMediaState();
  }, [file, file?.id, kind, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open || !file) {
    return null;
  }

  const renderMediaLoader = () => (
    <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-border/60 bg-muted/40">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );

  const renderFallbackMessage = (message = "Предпросмотр для этого файла недоступен. Скачайте файл, чтобы открыть его локально.") => (
    <div className="rounded-2xl border border-dashed border-border/60 bg-muted/30 p-6 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );

  const renderError = (message: string) => (
    <div className="rounded-2xl border border-destructive/40 bg-destructive/5 px-4 py-6 text-center text-sm text-destructive">
      {message}
    </div>
  );

  const renderContent = () => {
    if (kind === "image") {
      if (isMediaLoading) return renderMediaLoader();
      if (mediaError) return renderError(mediaError);
      if (!mediaUrl) return renderFallbackMessage("Не удалось загрузить изображение для предпросмотра.");

      return (
        <div
          className="flex w-full items-center justify-center overflow-hidden rounded-2xl bg-muted p-4"
          style={{
            width: "100%",
            maxWidth: `${MEDIA_MAX_WIDTH}px`,
            maxHeight: `${MEDIA_MAX_HEIGHT}px`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mediaUrl}
            alt={file.originalName}
            className="h-auto max-h-full w-auto max-w-full object-contain"
            style={{
              maxWidth: `${MEDIA_MAX_WIDTH}px`,
              maxHeight: `${MEDIA_MAX_HEIGHT}px`,
            }}
          />
        </div>
      );
    }

    if (kind === "video") {
      if (isMediaLoading) return renderMediaLoader();
      if (mediaError) return renderError(mediaError);
      if (!mediaUrl) return renderFallbackMessage("Видео-превью недоступно. Скачайте файл для просмотра.");

      return (
        <div className="flex w-full justify-center">
          <video
            controls
            className="w-auto max-w-full rounded-2xl bg-black"
            src={mediaUrl}
            preload="metadata"
            style={{
              maxWidth: `${MEDIA_MAX_WIDTH}px`,
              maxHeight: `${MEDIA_MAX_HEIGHT}px`,
            }}
          />
        </div>
      );
    }

    if (kind === "audio") {
      if (isMediaLoading) return renderMediaLoader();
      if (mediaError) return renderError(mediaError);
      if (!mediaUrl) return renderFallbackMessage("Аудио-превью недоступно. Скачайте файл для прослушивания.");

      return (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border/60 bg-muted/40 p-6">
          <p className="text-sm text-muted-foreground">Аудио-превью</p>
          <audio controls className="w-full">
            <source src={mediaUrl} />
            Ваш браузер не поддерживает аудио-плеер.
          </audio>
        </div>
      );
    }

    if (kind === "text") {
      if (isTextLoading) {
        return renderMediaLoader();
      }

      if (textError) {
        return renderError(textError);
      }

       if (!textPreview) {
         return renderFallbackMessage("Не удалось отобразить текстовый файл. Скачайте его для просмотра.");
       }

      return (
        <pre className="max-h-[65vh] overflow-auto rounded-2xl border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
          <code>{textPreview}</code>
        </pre>
      );
    }

    return renderFallbackMessage();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-8">
      <div className="relative flex w-full max-w-4xl flex-col gap-5 rounded-3xl border border-border/70 bg-card p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-transparent bg-muted/70 p-2 text-muted-foreground transition hover:border-border hover:text-foreground"
          aria-label="Закрыть"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="space-y-1 pr-8">
          <p className="text-xs uppercase tracking-[0.2em] text-primary/70">Просмотр файла</p>
          <h2 className="text-xl font-semibold text-foreground">{file.originalName}</h2>
          <p className="text-xs text-muted-foreground">
            {formatBytes(file.sizeBytes)} • {file.mimeType || "Неизвестный формат"}
          </p>
        </div>

        <div className="rounded-3xl border border-border/60 bg-background p-4">{renderContent()}</div>

        <div className="flex flex-wrap justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            {kind === "text" && textPreview && textPreview.length >= TEXT_PREVIEW_LIMIT
              ? "Показаны первые 200 КБ файла"
              : "Для полного содержимого скачайте файл"}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="gap-2 rounded-2xl"
              onClick={() => void handleDownloadClick()}
              loading={isDownloading}
              disabled={!onDownload}
            >
              <Download className="h-4 w-4" />
              Скачать
            </Button>
            <Button variant="primary" className="rounded-2xl" onClick={onClose}>
              Закрыть
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

