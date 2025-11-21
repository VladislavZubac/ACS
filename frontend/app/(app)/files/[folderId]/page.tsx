import type { Metadata } from "next";
import { FileManagerPage } from "@/src/features/files/components/file-manager-page";

export const metadata: Metadata = {
  title: "Файлы",
};

type PageProps = {
  params: {
    folderId: string;
  };
};

export default function FolderFilesPage({ params }: PageProps) {
  return <FileManagerPage folderId={params.folderId} />;
}


