"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getAdminLogs,
  type AdminLogsQueryParams,
} from "@/src/features/logs/api/admin-logs-api";

export type UseAdminLogsOptions = AdminLogsQueryParams;

export function useAdminLogs(options?: UseAdminLogsOptions) {
  const tail = options?.tail ?? 500;

  return useQuery({
    queryKey: ["admin-logs", tail],
    queryFn: () => getAdminLogs({ tail }),
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}


