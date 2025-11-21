"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminSummary } from "@/src/features/dashboard/api/admin-dashboard-api";

export function useAdminSummary() {
  return useQuery({
    queryKey: ["admin-summary"],
    queryFn: getAdminSummary,
    staleTime: 30_000,
  });
}


