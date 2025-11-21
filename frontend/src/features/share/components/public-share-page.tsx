"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/src/shared/ui/button";
import {
  getPublicShare,
  getPublicShareDownloadUrl,
} from "@/src/features/share/api/share-api";
import type { SharePublicDto } from "@/src/features/share/types";
import { getApiErrorMessage } from "@/src/shared/api/client";
import { formatBytes } from "@/src/shared/lib/utils";

type PublicSharePageProps = {
  token: string;
};

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function PublicSharePage({ token }: PublicSharePageProps) {
  const [data, setData] = useState<SharePublicDto | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "ready">("idle");
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setStatus("loading");
      setError(null);
      try {
        const response = await getPublicShare(token);
        if (!cancelled) {
          setData(response);
          setStatus("ready");
        }
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err));
          setStatus("error");
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [token, reloadKey]);

  const isFileShare = Boolean(data?.file);
  const downloadUrl = useMemo(
    () => (isFileShare ? getPublicShareDownloadUrl(token) : null),
    [isFileShare, token],
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-3xl border border-border/70 bg-card/90 p-8 shadow-card backdrop-blur">
        {status === "loading" ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Загружаем информацию по ссылке...</p>
          </div>
        ) : null}

        {status === "error" ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="space-y-2">
              <h1 className="text-xl font-semibold text-foreground">Ссылка недоступна</h1>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <Button variant="outline" className="gap-2 rounded-2xl" onClick={() => setReloadKey((key) => key + 1)}>
              <RefreshCw className="h-4 w-4" />
              Повторить
            </Button>
          </div>
        ) : null}

        {status === "ready" && data ? (
          <div className="space-y-8">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-primary/70">Общая ссылка</p>
              <h1 className="text-2xl font-semibold text-foreground">{data.share.targetName}</h1>
              <p className="text-sm text-muted-foreground">
                Срок действия до {dateFormatter.format(new Date(data.share.expiresAt))}
              </p>
            </div>

            {isFileShare && data.file ? (
              <div className="rounded-3xl border border-border/70 bg-background/70 p-6 shadow-inner">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-primary/60">Файл</p>
                    <h2 className="text-xl font-semibold text-foreground">{data.file.originalName}</h2>
                    <p className="text-sm text-muted-foreground">
                      {formatBytes(data.file.sizeBytes)} • {data.file.mimeType || "Неизвестный формат"}
                    </p>
                  </div>
                  {downloadUrl ? (
                    <Button
                      className="gap-2 rounded-2xl"
                      onClick={() => window.open(downloadUrl, "_blank", "noopener,noreferrer")}
                    >
                      <Download className="h-4 w-4" />
                      Скачать
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : null}

            {!isFileShare && data.folder ? (
              <div className="space-y-4 rounded-3xl border border-border/70 bg-background/70 p-6 shadow-inner">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-primary/60">Папка</p>
                  <h2 className="text-xl font-semibold text-foreground">{data.folder.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {data.folderFiles.length > 0
                      ? `Файлов внутри: ${data.folderFiles.length}`
                      : "Папка пока пуста"}
                  </p>
                </div>

                {data.folderFiles.length > 0 ? (
                  <div className="divide-y divide-border/60 rounded-2xl border border-border/70">
                    {data.folderFiles.map((fileItem) => (
                      <div
                        key={fileItem.id}
                        className="flex flex-col gap-1 px-4 py-3 text-sm text-foreground sm:flex-row sm:items-center sm:justify-between"
                      >
                        <span className="font-medium">{fileItem.originalName}</span>
                        <span className="text-muted-foreground">
                          {formatBytes(fileItem.sizeBytes)} •{" "}
                          {dateFormatter.format(new Date(fileItem.updatedAt))}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

