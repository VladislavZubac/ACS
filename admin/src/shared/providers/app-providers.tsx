"use client";

import { type ReactNode } from "react";
import { ThemeProvider } from "@/src/shared/providers/theme/theme-provider";
import { QueryProvider } from "@/src/shared/providers/query/query-provider";
import { AdminAuthProvider } from "@/src/features/admin-auth/providers/admin-auth-provider";
import { ErrorProvider } from "@/src/shared/providers/error/error-provider";

type Props = {
  children: ReactNode;
};

export function AppProviders({ children }: Props) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <ErrorProvider>
          <AdminAuthProvider>{children}</AdminAuthProvider>
        </ErrorProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}


