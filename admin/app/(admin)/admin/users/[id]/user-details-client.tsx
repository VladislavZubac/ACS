"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserQuota } from "@/src/features/users/api/admin-users-api";
import { useAdminUser } from "@/src/features/users/hooks/use-admin-users";
import { formatBytes } from "@/src/shared/lib/utils";
import { Button } from "@/src/shared/ui/button";
import { Input } from "@/src/shared/ui/input";
import { getApiErrorMessage } from "@/src/shared/api/client";
import { ConfirmDialog } from "@/src/shared/ui/confirm-dialog";
import { useErrorNotifications } from "@/src/shared/providers/error/error-provider";

type UserDetailsClientProps = {
  userId: string;
};

export function UserDetailsClient({ userId }: UserDetailsClientProps) {
  const { user, isLoading } = useAdminUser(userId);
  const queryClient = useQueryClient();
  const [quotaInput, setQuotaInput] = useState<string | null>(null);
  const [pendingQuota, setPendingQuota] = useState<number | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const { notifyError } = useErrorNotifications();

  const updateQuotaMutation = useMutation({
    mutationFn: (assignedSpaceBytes: number) =>
      updateUserQuota(userId, { assignedSpaceBytes }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setQuotaInput(null);
    },
    onError: (error) => {
      notifyError(getApiErrorMessage(error));
    },
    onSettled: () => {
      setIsConfirmDialogOpen(false);
      setPendingQuota(null);
    },
  });

  const mutationError = updateQuotaMutation.isError
    ? getApiErrorMessage(updateQuotaMutation.error)
    : null;

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-border/70 bg-card/80 p-6 text-sm text-muted-foreground">
        Загружаем данные пользователя...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-3xl border border-border/70 bg-card/80 p-6 text-center text-sm text-muted-foreground">
        <p>Пользователь не найден или данные ещё не доступны.</p>
        <Button asChild variant="outline" className="mt-4 rounded-2xl">
          <Link href="/admin/users">Вернуться к списку</Link>
        </Button>
      </div>
    );
  }

  const utilization =
    user.assignedSpaceBytes > 0
      ? Math.min(
          (user.usedSpaceBytes / user.assignedSpaceBytes) * 100,
          100,
        )
      : 0;

  const currentInput =
    quotaInput ?? user.assignedSpaceBytes.toString();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextValue = Number(currentInput);
    if (!Number.isFinite(nextValue) || nextValue <= 0) {
      return;
    }
    setPendingQuota(nextValue);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmUpdate = () => {
    if (pendingQuota === null) {
      return;
    }
    updateQuotaMutation.mutate(pendingQuota);
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-sm uppercase tracking-[0.2em] text-primary/70">
          Админ • Пользователь
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          {user.username}
        </h1>
        <p className="text-sm text-muted-foreground">
          Роль: {user.role === "ADMIN" ? "Администратор" : "Пользователь"}
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-border/70 bg-card/80 p-5 shadow-inner">
          <p className="text-sm text-muted-foreground">Выделено</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {formatBytes(user.assignedSpaceBytes)}
          </p>
        </div>
        <div className="rounded-3xl border border-border/70 bg-card/80 p-5 shadow-inner">
          <p className="text-sm text-muted-foreground">Использовано</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {formatBytes(user.usedSpaceBytes)}
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-border/70 bg-card/80 p-6 shadow-card">
        <h2 className="text-lg font-semibold text-foreground">
          Изменить квоту
        </h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              Доступный объём (в байтах)
            </label>
            <Input
              type="number"
              min={1}
              value={currentInput}
              onChange={(event) => setQuotaInput(event.target.value)}
              required
            />
          </div>
          {mutationError ? (
            <div className="rounded-2xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {mutationError}
            </div>
          ) : null}

          <Button
            type="submit"
            className="rounded-2xl"
            loading={updateQuotaMutation.isPending}
          >
            Сохранить
          </Button>
        </form>
        <div className="mt-6">
          <p className="text-xs text-muted-foreground">
            Текущая загрузка: {formatBytes(user.usedSpaceBytes)} из{" "}
            {formatBytes(user.assignedSpaceBytes)} (~
            {utilization.toFixed(1)}%)
          </p>
          <div className="mt-3 h-2 rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${utilization}%` }}
            />
          </div>
        </div>
      </section>

      <ConfirmDialog
        open={isConfirmDialogOpen}
        title="Подтвердите изменение квоты"
        description={
          pendingQuota !== null ? (
            <div className="space-y-2 text-sm">
              <p>
                Новое значение: {formatBytes(pendingQuota)} (
                {pendingQuota.toLocaleString("ru-RU")} байт)
              </p>
              <p className="text-xs text-muted-foreground">
                Действие применяется сразу, пользователю станет доступен новый
                лимит.
              </p>
            </div>
          ) : null
        }
        confirmLabel="Сохранить"
        cancelLabel="Отмена"
        loading={updateQuotaMutation.isPending}
        onCancel={() => {
          setIsConfirmDialogOpen(false);
          setPendingQuota(null);
        }}
        onConfirm={handleConfirmUpdate}
      />
    </div>
  );
}


