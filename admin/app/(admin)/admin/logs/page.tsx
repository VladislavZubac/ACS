import type { Metadata } from "next";
import { LogsClient } from "./logs-client";

export const metadata: Metadata = {
  title: "Логи",
};

export default function AdminLogsPage() {
  return <LogsClient />;
}


