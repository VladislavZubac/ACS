import type { Metadata } from "next";
import { UserDetailsClient } from "./user-details-client";

export const metadata: Metadata = {
  title: "Пользователь",
};

type PageProps = {
  params: {
    id: string;
  };
};

export default function AdminUserDetailsPage({ params }: PageProps) {
  return <UserDetailsClient userId={params.id} />;
}
