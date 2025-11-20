"use client";

import { useState, useCallback } from "react";
import type { FileDto } from "@/src/features/files/types";

export function useFilePreview() {
  const [previewFile, setPreviewFile] = useState<FileDto | null>(null);

  const openPreview = useCallback((file: FileDto) => {
    setPreviewFile(file);
  }, []);

  const closePreview = useCallback(() => {
    setPreviewFile(null);
  }, []);

  return {
    previewFile,
    openPreview,
    closePreview,
    isOpen: previewFile !== null,
  };
}

