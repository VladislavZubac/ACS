"use client";

import {
  type ChangeEvent,
  type DragEvent,
  useRef,
  useState,
} from "react";
import { Loader2, UploadCloud } from "lucide-react";
import { cn } from "@/src/shared/lib/utils";
import { Button } from "@/src/shared/ui/button";

type Props = {
  id?: string;
  className?: string;
  onFilesSelected?: (files: FileList) => void;
  isUploading?: boolean;
  statusMessage?: string | null;
};

export function UploadZone({
  id,
  className,
  onFilesSelected,
  isUploading = false,
  statusMessage,
}: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files.length && !isUploading) {
      onFilesSelected?.(event.dataTransfer.files);
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      onFilesSelected?.(event.target.files);
      event.target.value = "";
    }
  };

  const openFileDialog = () => {
    if (isUploading) return;
    inputRef.current?.click();
  };

  const disabled = isUploading;

  return (
    <div
      id={id}
      className={cn(
        "group flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border/80 bg-card/70 px-6 py-8 text-center transition hover:border-primary/60 hover:bg-card/90",
        isDragging && !disabled && "border-primary bg-primary/5",
        disabled && "cursor-not-allowed opacity-80",
        className,
      )}
      role="button"
      tabIndex={0}
      aria-disabled={disabled}
      aria-busy={disabled}
      onClick={openFileDialog}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openFileDialog();
        }
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isUploading ? (
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      ) : (
        <UploadCloud className="h-10 w-10 text-primary" />
      )}
      <div className="space-y-1 text-sm">
        <p className="font-medium text-foreground">
          {isUploading ? "Загрузка файлов..." : "Перетащите файлы сюда или выберите их вручную"}
        </p>
        <p className="text-muted-foreground">
          {isUploading
            ? statusMessage || "Подождите, пока завершится текущая загрузка"
            : "Поддерживаются изображения, видео, документы и архивы до 2 ГБ"}
        </p>
      </div>
      <div>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="sr-only"
          onChange={handleInputChange}
          disabled={disabled}
        />
        <Button type="button" variant="outline" size="sm" disabled={disabled}>
          {isUploading ? "Загрузка..." : "Выбрать файлы"}
        </Button>
      </div>
    </div>
  );
}

