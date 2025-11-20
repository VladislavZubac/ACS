"use client";

import { type ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/features/auth/hooks/use-auth";
import { FullscreenLoader } from "@/src/shared/components/fullscreen-loader";

type Props = {
  children: ReactNode;
};

export function AuthGuard({ children }: Props) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "idle" || status === "checking" || status === "unauthenticated") {
    return (
      <FullscreenLoader
        message={
          status === "unauthenticated"
            ? "Перенаправляем на страницу входа..."
            : "Проверяем авторизацию..."
        }
      />
    );
  }

  return <>{children}</>;
}

