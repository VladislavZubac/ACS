"use client";

import Link from "next/link";
import { useAdminUsers } from "@/src/features/users/hooks/use-admin-users";
import { formatBytes } from "@/src/shared/lib/utils";
import { Button } from "@/src/shared/ui/button";
import { FullscreenLoader } from "@/src/shared/components/fullscreen-loader";

export function UsersClient() {
  const { data, isLoading, isError, refetch, isRefetching } =
    useAdminUsers();

  if (isLoading) {
    return <FullscreenLoader message="Получаем список пользователей..." />;
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-sm text-muted-foreground">
          Не удалось загрузить список пользователей.
        </p>
        <Button variant="outline" onClick={() => refetch()} loading={isRefetching}>
          Повторить
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-sm uppercase tracking-[0.2em] text-primary/70">
          Админ • Пользователи
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Управление квотами
        </h1>
        <p className="text-sm text-muted-foreground">
          Следите за занятостью хранилища и изменяйте лимиты прямо здесь.
        </p>
      </header>

      <div className="space-y-4">
        <div className="hidden overflow-hidden rounded-3xl border border-border/70 bg-card/80 shadow-card md:block">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border/70" aria-label="Список пользователей">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left">Пользователь</th>
                  <th scope="col" className="px-6 py-4 text-left">Роль</th>
                  <th scope="col" className="px-6 py-4 text-right">Выделено</th>
                  <th scope="col" className="px-6 py-4 text-right">Использовано</th>
                  <th scope="col" className="px-6 py-4 text-left">Загрузка</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-sm">
                {data.map((user) => {
                  const utilization = getUtilization(user.usedSpaceBytes, user.assignedSpaceBytes);
                  return (
                    <tr key={user.id} className="transition hover:bg-muted/40">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="font-semibold text-foreground hover:text-primary"
                          >
                            {user.username}
                          </Link>
                          <span className="text-xs text-muted-foreground">
                            ID: {user.id.slice(0, 8)}…
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-sm">
                        {formatBytes(user.assignedSpaceBytes)}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-sm">
                        {formatBytes(user.usedSpaceBytes)}
                      </td>
                      <td className="px-6 py-4">
                        <UtilizationBar value={utilization} />
                        <span className="ml-2 text-xs text-muted-foreground">
                          {utilization.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-3 md:hidden">
          {data.map((user) => {
            const utilization = getUtilization(user.usedSpaceBytes, user.assignedSpaceBytes);
            return (
              <div
                key={user.id}
                className="rounded-3xl border border-border/70 bg-card/80 p-4 shadow-inner"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="text-base font-semibold text-foreground hover:text-primary"
                    >
                      {user.username}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      ID: {user.id.slice(0, 8)}…
                    </p>
                  </div>
                  <RoleBadge role={user.role} />
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl border border-border/60 bg-background/60 p-3">
                    <dt className="text-xs uppercase text-muted-foreground">
                      Выделено
                    </dt>
                    <dd className="font-mono text-sm">{formatBytes(user.assignedSpaceBytes)}</dd>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-background/60 p-3">
                    <dt className="text-xs uppercase text-muted-foreground">
                      Использовано
                    </dt>
                    <dd className="font-mono text-sm">{formatBytes(user.usedSpaceBytes)}</dd>
                  </div>
                </dl>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Загрузка</span>
                    <span>{utilization.toFixed(1)}%</span>
                  </div>
                  <div className="mt-2">
                    <UtilizationBar value={utilization} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function getUtilization(used: number, assigned: number) {
  if (assigned <= 0) {
    return 0;
  }
  return Math.min((used / assigned) * 100, 999);
}

function RoleBadge({ role }: { role: "USER" | "ADMIN" }) {
  const isAdmin = role === "ADMIN";
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
        isAdmin
          ? "bg-primary/15 text-primary"
          : "bg-muted/60 text-muted-foreground"
      }`}
    >
      {isAdmin ? "Администратор" : "Пользователь"}
    </span>
  );
}

function UtilizationBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-primary transition-[width] duration-500"
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}


