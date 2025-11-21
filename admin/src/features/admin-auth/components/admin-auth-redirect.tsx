"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/src/features/admin-auth/hooks/use-admin-auth";
import { FullscreenLoader } from "@/src/shared/components/fullscreen-loader";

type Props = {
  redirectTo?: string;
};

export function AdminAuthRedirect({ redirectTo = "/admin" }: Props) {
  const { status } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(redirectTo);
    }
  }, [status, redirectTo, router]);

  if (status === "authenticated") {
    return (
      <FullscreenLoader message="Уже вошли, перенаправляем в панель..." />
    );
  }

  return null;
}


