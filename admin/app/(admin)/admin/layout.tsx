"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut, ScrollText, Users } from "lucide-react";
import { AdminAuthGuard } from "@/src/features/admin-auth/components/admin-auth-guard";
import { useAdminAuth } from "@/src/features/admin-auth/hooks/use-admin-auth";
import { Logo } from "@/src/shared/components/logo";
import { ThemeToggle } from "@/src/shared/components/theme-toggle";
import { cn } from "@/src/shared/lib/utils";

const navItems = [
  { label: "Дэшборд", href: "/admin", icon: LayoutDashboard },
  { label: "Пользователи", href: "/admin/users", icon: Users },
  { label: "Логи", href: "/admin/logs", icon: ScrollText },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminAuthGuard>
      <LayoutContent>{children}</LayoutContent>
    </AdminAuthGuard>
  );
}

function LayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAdminAuth();

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden w-72 flex-col border-r border-border/60 bg-card/60 px-5 py-6 backdrop-blur-lg xl:flex">
        <Logo className="mb-8" />

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === item.href
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-2xl px-3 py-2 text-sm transition",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-3xl border border-border/80 bg-background/70 p-4 shadow-inner">
          <p className="text-xs text-muted-foreground">Вы вошли как</p>
          <p className="text-sm font-medium text-foreground">{user?.username}</p>
          <button
            type="button"
            onClick={logout}
            className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-primary"
          >
            <LogOut className="h-4 w-4" />
            Выйти
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-20 flex-col justify-center gap-3 border-b border-border/60 bg-card/70 px-4 backdrop-blur lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3 lg:hidden">
            <Logo short />
          </div>
          <div className="flex flex-wrap items-center gap-4 lg:justify-end">
            <ThemeToggle />
            <div className="rounded-full border border-border/70 px-4 py-1 text-xs text-muted-foreground">
              {user?.username}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-background/60 px-4 py-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}


