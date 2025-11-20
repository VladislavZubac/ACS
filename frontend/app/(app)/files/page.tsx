import type { Metadata } from "next";
import { FileManagerPage } from "@/src/features/files/components/file-manager-page";

export const metadata: Metadata = {
  title: "Мои файлы",
};

export default function FilesPage() {
  return <FileManagerPage />;
}

