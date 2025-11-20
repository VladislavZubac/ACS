"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  Clock3,
  Folder,
  Image as ImageIcon,
  Layers,
  Search,
  Share2,
  Trash2,
  Video,
} from "lucide-react";
import { AuthGuard } from "@/src/features/auth/components/auth-guard";
import { useAuth } from "@/src/features/auth/hooks/use-auth";
import { useQuota } from "@/src/features/quota/hooks/use-quota";
import { ThemeToggle } from "@/src/shared/components/theme-toggle";
import { Logo } from "@/src/shared/components/logo";
import { QuotaIndicator } from "@/src/shared/components/quota-indicator";
import { Button } from "@/src/shared/ui/button";

const sidebarNav = [
  { label: "Мои файлы", href: "/files", icon: Folder },
  { label: "Недавние", href: "/files?filter=recent", icon: Clock3 },
  { label: "Изображения", href: "/files?filter=images", icon: ImageIcon },
  { label: "Видео", href: "/files?filter=videos", icon: Video },
  { label: "Опубликовано", href: "/files?filter=shared", icon: Share2 },
  { label: "Архив", href: "/files?filter=archive", icon: Layers },
  { label: "Корзина", href: "/files?filter=trash", icon: Trash2 },
];

function SidebarLink({
  label,
  href,
  icon: Icon,
}: (typeof sidebarNav)[number]) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-2xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted/80 hover:text-foreground"
    >
      <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
      <span>{label}</span>
    </Link>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <LayoutContent>{children}</LayoutContent>
    </AuthGuard>
  );
}

function LayoutContent({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { data: quotaData, isLoading: isQuotaLoading } = useQuota();

  const usedQuota = quotaData?.usedSpaceBytes ?? user?.usedSpaceBytes ?? 0;
  const totalQuota = quotaData?.assignedSpaceBytes ?? user?.assignedSpaceBytes ?? 1;
  const initials = (user?.username?.slice(0, 2) || "AC").toUpperCase();

  return (
    <div className="flex min-h-screen bg-muted/20">
      <aside className="hidden w-72 flex-col border-r border-border/60 bg-card/60 px-5 py-6 backdrop-blur-lg lg:flex">
        <Logo className="mb-8" />

        <div className="space-y-1">
          {sidebarNav.map((item) => (
            <SidebarLink key={item.href} {...item} />
          ))}
        </div>

        <div className="mt-auto space-y-4 rounded-3xl border border-border/80 bg-background/70 p-4 shadow-inner">
          <QuotaIndicator usedBytes={usedQuota} totalBytes={totalQuota} loading={isQuotaLoading} />
          <Button variant="outline" className="w-full" size="sm">
            Управление квотой
          </Button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-20 flex-col justify-center gap-3 border-b border-border/60 bg-card/70 px-4 backdrop-blur lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex w-full flex-1 items-center gap-3">
            <div className="flex items-center gap-3 lg:hidden">
              <Logo />
            </div>
            <div className="relative flex w-full items-center">
              <Search className="pointer-events-none absolute left-4 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Поиск по файлам и папкам"
                className="w-full rounded-2xl border border-border bg-background/80 py-3 pl-11 pr-4 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 lg:justify-end">
            <ThemeToggle />
            <QuotaIndicator
              usedBytes={usedQuota}
              totalBytes={totalQuota}
              size="compact"
              className="hidden min-w-[220px] lg:block"
              loading={isQuotaLoading}
            />
            <div className="flex items-center gap-3 rounded-full border border-border/70 px-3 py-1.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 font-semibold text-primary">
                {initials}
              </div>
              <div className="text-xs">
                <p className="font-medium text-foreground">{user?.username}</p>
                <button
                  type="button"
                  onClick={logout}
                  className="text-muted-foreground transition hover:text-primary"
                >
                  Выйти
                </button>
              </div>
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

