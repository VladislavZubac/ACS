import type { Metadata } from "next";
import { PublicSharePage } from "@/src/features/share/components/public-share-page";

type PageProps = {
  params: {
    token: string;
  };
};

export const metadata: Metadata = {
  title: "Общая ссылка",
};

export default function SharedTokenPage({ params }: PageProps) {
  return <PublicSharePage token={params.token} />;
}

