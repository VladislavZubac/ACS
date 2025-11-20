"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/features/auth/hooks/use-auth";
import { FullscreenLoader } from "@/src/shared/components/fullscreen-loader";

type Props = {
  redirectTo?: string;
};

export function AuthRedirect({ redirectTo = "/files" }: Props) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(redirectTo);
    }
  }, [status, redirectTo, router]);

  if (status === "authenticated") {
    return <FullscreenLoader message="Уже авторизованы, перенаправляем..." />;
  }

  return null;
}

