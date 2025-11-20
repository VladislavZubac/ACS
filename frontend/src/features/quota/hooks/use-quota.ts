"use client";

import { useQuery } from "@tanstack/react-query";
import { getQuota } from "@/src/features/quota/api/quota-api";

export function useQuota() {
  return useQuery({
    queryKey: ["quota"],
    queryFn: getQuota,
    staleTime: 30_000,
  });
}

