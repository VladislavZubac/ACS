import type { Metadata } from "next";
import { UsersClient } from "./users-client";

export const metadata: Metadata = {
  title: "Пользователи",
};

export default function AdminUsersPage() {
  return <UsersClient />;
}


