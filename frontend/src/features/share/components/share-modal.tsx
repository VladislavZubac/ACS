"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Link2, X } from "lucide-react";
import { createShareLink } from "@/src/features/share/api/share-api";
import type { ShareDto, ShareTtlOption } from "@/src/features/share/types";
import { Button } from "@/src/shared/ui/button";
import { getApiErrorMessage } from "@/src/shared/api/client";

const ttlOptions: Array<{
  value: ShareTtlOption;
  label: string;
  description: string;
}> = [
  { value: "H1", label: "1 час", description: "Временный доступ" },
  { value: "H24", label: "24 часа", description: "Короткая ссылка" },
  { value: "D7", label: "7 дней", description: "Неделя доступа" },
  { value: "D30", label: "30 дней", description: "Долгосрочная ссылка" },
];

export type ShareModalTarget =
  | {
      id: string;
      name: string;
      type: "file";
    }
  | {
      id: string;
      name: string;
      type: "folder";
    };

type ShareModalProps = {
  open: boolean;
  target: ShareModalTarget | null;
  onClose: () => void;
};

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function ShareModal({ open, target, onClose }: ShareModalProps) {
  const [selectedTtl, setSelectedTtl] = useState<ShareTtlOption>("H24");
  const [share, setShare] = useState<ShareDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) {
      setShare(null);
      setError(null);
      setCopied(false);
      setSelectedTtl("H24");
    } else {
      setShare(null);
      setError(null);
      setCopied(false);
    }
  }, [open, target?.id]);

  const shareUrl = useMemo(() => {
    if (!share) {
      return null;
    }
    if (typeof window === "undefined") {
      return null;
    }
    return `${window.location.origin}/shared/${share.token}`;
  }, [share]);

  if (!open || !target) {
    return null;
  }

  const handleGenerate = async () => {
    if (!target) return;

    setIsSubmitting(true);
    setError(null);
    setCopied(false);

    try {
      const created = await createShareLink({
        targetId: target.id,
        targetType: target.type,
        ttl: selectedTtl,
      });
      setShare(created);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Не удалось скопировать ссылку. Скопируйте вручную.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8">
      <div className="relative w-full max-w-lg rounded-3xl border border-border/70 bg-card p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-transparent bg-muted/60 p-2 text-muted-foreground transition hover:border-border hover:text-foreground"
          aria-label="Закрыть модалку"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="space-y-2 pr-8">
          <p className="text-xs uppercase tracking-[0.2em] text-primary/70">Поделиться</p>
          <h2 className="text-xl font-semibold text-foreground">
            {target.type === "file" ? "Файл" : "Папка"} «{target.name}»
          </h2>
          <p className="text-sm text-muted-foreground">
            Выберите срок действия ссылки и отправьте её коллегам или друзьям.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase text-muted-foreground">Срок действия</p>
            <div className="grid grid-cols-2 gap-3">
              {ttlOptions.map((option) => {
                const isActive = selectedTtl === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedTtl(option.value)}
                    className={`rounded-2xl border px-4 py-3 text-left transition ${
                      isActive
                        ? "border-primary/50 bg-primary/10 text-foreground"
                        : "border-border/60 bg-muted/40 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    <p className="text-sm font-semibold">{option.label}</p>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          {share ? (
            <div className="space-y-3 rounded-2xl border border-border/60 bg-muted/30 p-4">
              <p className="text-xs font-medium uppercase text-muted-foreground">Ссылка готова</p>
              <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-background px-3 py-2 text-sm">
                <Link2 className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{shareUrl}</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="ml-auto rounded-full border border-border/70 p-1.5 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-primary"
                >
                  {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Истекает {dateFormatter.format(new Date(share.expiresAt))}
              </p>
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button variant="outline" className="rounded-2xl" onClick={onClose}>
            Отмена
          </Button>
          <Button className="rounded-2xl" onClick={handleGenerate} loading={isSubmitting}>
            {share ? "Создать заново" : "Создать ссылку"}
          </Button>
        </div>
      </div>
    </div>
  );
}

