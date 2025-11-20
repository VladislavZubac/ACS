"use client";

export type FileKind =
  | "image"
  | "video"
  | "audio"
  | "text"
  | "document"
  | "archive"
  | "other";

const TEXT_MIME_HINTS = ["text", "json", "xml", "csv", "html", "plain"];

export function resolveFileKind(mimeType: string | null | undefined): FileKind {
  if (!mimeType) {
    return "other";
  }

  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";

  if (TEXT_MIME_HINTS.some((hint) => mimeType.includes(hint))) {
    return "text";
  }

  if (
    mimeType.includes("pdf") ||
    mimeType.includes("word") ||
    mimeType.includes("sheet") ||
    mimeType.includes("presentation")
  ) {
    return "document";
  }

  if (
    mimeType.includes("zip") ||
    mimeType.includes("rar") ||
    mimeType.includes("tar") ||
    mimeType.includes("7z")
  ) {
    return "archive";
  }

  return "other";
}

