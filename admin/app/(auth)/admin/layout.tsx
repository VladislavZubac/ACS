import type { ReactNode } from "react";
import { Logo } from "@/src/shared/components/logo";
import { AdminAuthRedirect } from "@/src/features/admin-auth/components/admin-auth-redirect";

export default function AdminAuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-background to-muted/60">
      <AdminAuthRedirect />

      <div className="pointer-events-none absolute inset-0">
        <div className="mx-auto h-[520px] w-[520px] rounded-full bg-primary/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl space-y-8 rounded-3xl border border-border/80 bg-card/80 p-10 shadow-card backdrop-blur">
          <div className="space-y-2 text-center">
            <Logo asLink={false} />
            <p className="text-sm text-muted-foreground">
              Войдите, чтобы открыть административную панель.
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}


