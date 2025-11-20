import type { Metadata } from "next";
import { FileManagerPage } from "@/src/features/files/components/file-manager-page";

export const metadata: Metadata = {
  title: "Файлы",
};

type PageProps = {
  params: {
    path?: string[];
  };
};

export default function NestedFilesPage({ params }: PageProps) {
  const folderId = params.path?.[params.path.length - 1];

  return <FileManagerPage folderId={folderId} />;
}

