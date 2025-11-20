"use client";

import Image from "next/image";
import { useEffect, useEffectEvent, useMemo, useState } from "react";
import { Download, Loader2, X } from "lucide-react";
import type { FileDto } from "@/src/features/files/types";
import { getFileDownloadUrl, getFilePreviewUrl } from "@/src/features/files/api/files-api";
import { resolveFileKind } from "@/src/features/files/utils/file-type";
import { Button } from "@/src/shared/ui/button";
import { formatBytes } from "@/src/shared/lib/utils";

type Props = {
  file: FileDto | null;
  open: boolean;
  onClose: () => void;
};

const TEXT_PREVIEW_LIMIT = 200_000; // ~200 KB

export function FilePreviewModal({ file, open, onClose }: Props) {
  const [textPreview, setTextPreview] = useState<string | null>(null);
  const [isTextLoading, setIsTextLoading] = useState(false);
  const [textError, setTextError] = useState<string | null>(null);

  const kind = useMemo(() => resolveFileKind(file?.mimeType), [file?.mimeType]);
  const previewUrl = file ? getFilePreviewUrl(file.id) : null;
  const downloadUrl = file ? getFileDownloadUrl(file.id) : null;

  const resetTextState = useEffectEvent(() => {
    setTextPreview(null);
    setIsTextLoading(false);
    setTextError(null);
  });

  const loadTextPreview = useEffectEvent(async (url: string, signal: AbortSignal) => {
    setIsTextLoading(true);
    setTextError(null);
    setTextPreview(null);

    try {
      const response = await fetch(url, { signal });
      if (!response.ok) {
        throw new Error("Не удалось загрузить текстовое превью");
      }

      const contentLength = response.headers.get("content-length");
      if (contentLength && Number(contentLength) > TEXT_PREVIEW_LIMIT) {
        throw new Error("Файл слишком большой для текстового предпросмотра");
      }

      const text = await response.text();
      if (!signal.aborted) {
        setTextPreview(text.slice(0, TEXT_PREVIEW_LIMIT));
      }
    } catch (error) {
      if (signal.aborted) {
        return;
      }
      setTextError(error instanceof Error ? error.message : "Ошибка предпросмотра");
    } finally {
      if (!signal.aborted) {
        setIsTextLoading(false);
      }
    }
  });

  useEffect(() => {
    if (!open || !file || kind !== "text" || !previewUrl) {
      resetTextState();
      return;
    }

    const controller = new AbortController();
    loadTextPreview(previewUrl, controller.signal);

    return () => controller.abort();
  }, [file, file?.id, kind, open, previewUrl]);

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

  const renderContent = () => {
    if (kind === "image") {
      return (
        <div className="flex max-h-[65vh] w-full items-center justify-center overflow-hidden rounded-2xl bg-muted">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt={file.originalName}
              width={1600}
              height={900}
              unoptimized
              className="h-auto w-full object-contain"
            />
          ) : null}
        </div>
      );
    }

    if (kind === "video") {
      return (
        <video
          controls
          className="w-full rounded-2xl bg-black"
          src={previewUrl ?? ""}
          preload="metadata"
        />
      );
    }

    if (kind === "audio") {
      return (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border/60 bg-muted/40 p-6">
          <p className="text-sm text-muted-foreground">Аудио-превью</p>
          <audio controls className="w-full">
            <source src={previewUrl ?? ""} />
            Ваш браузер не поддерживает аудио-плеер.
          </audio>
        </div>
      );
    }

    if (kind === "text") {
      if (isTextLoading) {
        return (
          <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-border/60 bg-muted/40">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        );
      }

      if (textError) {
        return (
          <div className="rounded-2xl border border-destructive/40 bg-destructive/5 px-4 py-6 text-center text-sm text-destructive">
            {textError}
          </div>
        );
      }

      return (
        <pre className="max-h-[65vh] overflow-auto rounded-2xl border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
          <code>{textPreview}</code>
        </pre>
      );
    }

    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        Предпросмотр для этого типа файла недоступен. Вы можете скачать файл, чтобы открыть его
        локально.
      </div>
    );
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
              onClick={() => downloadUrl && window.open(downloadUrl, "_blank", "noopener,noreferrer")}
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

