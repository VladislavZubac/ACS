"use client";

import { type ReactNode } from "react";
import { QueryProvider } from "@/src/shared/providers/query/query-provider";
import { ThemeProvider } from "@/src/shared/providers/theme/theme-provider";
import { AuthProvider } from "@/src/features/auth/providers/auth-provider";

type Props = {
  children: ReactNode;
};

export function AppProviders({ children }: Props) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>{children}</AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}

