"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminUsers } from "@/src/features/users/api/admin-users-api";

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: getAdminUsers,
    staleTime: 30_000,
  });
}

export function useAdminUser(userId: string | undefined) {
  const usersQuery = useAdminUsers();

  const user = useMemo(() => {
    if (!userId || !usersQuery.data) {
      return null;
    }
    return usersQuery.data.find((candidate) => candidate.id === userId) ?? null;
  }, [userId, usersQuery.data]);

  return { ...usersQuery, user };
}


