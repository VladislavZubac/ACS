import type { ReactNode } from "react";
import { Logo } from "@/src/shared/components/logo";
import { AuthRedirect } from "@/src/features/auth/components/auth-redirect";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-background to-muted/60">
      <AuthRedirect />

      <div className="pointer-events-none absolute inset-0">
        <div className="mx-auto h-[520px] w-[520px] rounded-full bg-primary/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8 rounded-3xl border border-border/80 bg-card/80 p-8 shadow-card backdrop-blur">
          <div className="space-y-2 text-center">
            <Logo asLink={false} />
            <p className="text-sm text-muted-foreground">
              Войдите, чтобы продолжить работу с мини-облаком.
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

