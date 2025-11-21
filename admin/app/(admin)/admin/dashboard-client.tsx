"use client";

import { AlertTriangle, BarChart3 } from "lucide-react";
import { useAdminSummary } from "@/src/features/dashboard/hooks/use-admin-summary";
import { formatBytes } from "@/src/shared/lib/utils";
import { Button } from "@/src/shared/ui/button";
import { FullscreenLoader } from "@/src/shared/components/fullscreen-loader";

export function DashboardClient() {
  const { data, isLoading, isError, refetch, isRefetching } =
    useAdminSummary();

  if (isLoading) {
    return <FullscreenLoader message="Получаем статистику..." />;
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">
            Не удалось загрузить данные
          </h2>
          <p className="text-sm text-muted-foreground">
            Проверьте соединение с сервером и повторите попытку.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => refetch()}
          loading={isRefetching}
        >
          Повторить
        </Button>
      </div>
    );
  }

  const utilization =
    data.totalAssignedBytes > 0
      ? Math.min(
          (data.totalUsedBytes / data.totalAssignedBytes) * 100,
          100,
        )
      : 0;

  const cards = [
    {
      label: "Всего пользователей",
      value: data.totalUsers.toLocaleString("ru-RU"),
      hint: "учётные записи",
    },
    {
      label: "Файлов в системе",
      value: data.totalFiles.toLocaleString("ru-RU"),
      hint: "загруженных объектов",
    },
    {
      label: "Занятое пространство",
      value: formatBytes(data.totalUsedBytes),
      hint: `из ${formatBytes(data.totalAssignedBytes)}`,
    },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.2em] text-primary/70">
          Админ • Сводка
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Состояние хранилища
        </h1>
      </header>

      <section className="grid gap-4 lg:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-3xl border border-border/70 bg-card/80 p-5 shadow-inner"
          >
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">
              {card.value}
            </p>
            <p className="text-xs text-muted-foreground">{card.hint}</p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-border/70 bg-card/80 p-6 shadow-card">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Общая занятость
            </h2>
            <p className="text-sm text-muted-foreground">
              {formatBytes(data.totalUsedBytes)} из{" "}
              {formatBytes(data.totalAssignedBytes)} (≈
              {utilization.toFixed(1)}%)
            </p>
          </div>
          <BarChart3 className="h-5 w-5 text-primary" />
        </div>
        <div className="mt-6 h-3 rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300"
            style={{ width: `${utilization}%` }}
          />
        </div>
      </section>
    </div>
  );
}


