"use client";

import { type ReactNode } from "react";
import { QueryProvider } from "@/src/shared/providers/query/query-provider";
import { ThemeProvider } from "@/src/shared/providers/theme/theme-provider";
import { AuthProvider } from "@/src/features/auth/providers/auth-provider";
import { ErrorProvider } from "@/src/shared/providers/error/error-provider";

type Props = {
  children: ReactNode;
};

export function AppProviders({ children }: Props) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <ErrorProvider>{children}</ErrorProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}

