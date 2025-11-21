"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { useAdminLogs } from "@/src/features/logs/hooks/use-admin-logs";
import { getApiErrorMessage } from "@/src/shared/api/client";
import { FullscreenLoader } from "@/src/shared/components/fullscreen-loader";
import { Button } from "@/src/shared/ui/button";

const tailOptions = [200, 500, 1000];

export function LogsClient() {
  const [tail, setTail] = useState(500);
  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
    dataUpdatedAt,
    error,
  } = useAdminLogs({ tail });

  const formattedUpdatedAt = useMemo(() => {
    if (!dataUpdatedAt) {
      return null;
    }

    return new Intl.DateTimeFormat("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(dataUpdatedAt);
  }, [dataUpdatedAt]);

  if (isLoading) {
    return <FullscreenLoader message="Загружаем логи..." />;
  }

  if (isError) {
    const errorMessage = getApiErrorMessage(error);
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <p className="text-sm text-muted-foreground">
          Не удалось загрузить логи: {errorMessage}.
        </p>
        <Button variant="outline" onClick={() => refetch()} loading={isRefetching}>
          Повторить
        </Button>
      </div>
    );
  }

  const logsContent =
    data && data.trim().length > 0
      ? data
      : "Логи отсутствуют или backend не вернул контент.";

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-sm uppercase tracking-[0.2em] text-primary/70">
          Админ • Логи
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Последние события backend
        </h1>
        <p className="text-sm text-muted-foreground">
          Просматривайте хвост лога сервера и обновляйте его вручную.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-4 justify-between rounded-3xl border border-border/60 bg-card/60 px-4 py-3">
        <div className="text-xs text-muted-foreground">
          {formattedUpdatedAt
            ? `Обновлено в ${formattedUpdatedAt}`
            : "Логи ещё не загружались"}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs text-muted-foreground" htmlFor="tail-select">
            Количество строк
          </label>
          <select
            id="tail-select"
            className="rounded-2xl border border-border/70 bg-background/80 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            value={tail}
            onChange={(event) => setTail(Number(event.target.value))}
          >
            {tailOptions.map((option) => (
              <option key={option} value={option}>
                {option} строк
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="outline"
            onClick={() => refetch()}
            loading={isRefetching}
          >
            <RefreshCcw className="h-4 w-4" />
            Обновить
          </Button>
        </div>
      </div>

      <section className="rounded-3xl border border-border/70 bg-card/80 p-4 shadow-card">
        <pre className="max-h-[70vh] overflow-auto whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-foreground">
          {logsContent}
        </pre>
      </section>
    </div>
  );
}


