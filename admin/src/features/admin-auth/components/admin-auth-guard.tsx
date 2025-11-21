"use client";

import { type ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/src/features/admin-auth/hooks/use-admin-auth";
import { FullscreenLoader } from "@/src/shared/components/fullscreen-loader";

type Props = {
  children: ReactNode;
};

export function AdminAuthGuard({ children }: Props) {
  const { status } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/admin/login");
    }
  }, [status, router]);

  if (
    status === "idle" ||
    status === "checking" ||
    status === "unauthenticated"
  ) {
    return (
      <FullscreenLoader message="Проверяем права администратора..." />
    );
  }

  return <>{children}</>;
}


