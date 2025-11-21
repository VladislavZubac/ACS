"use client";

import { type ReactNode } from "react";
import { Button } from "@/src/shared/ui/button";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Подтвердить",
  cancelLabel = "Отмена",
  loading,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur">
      <div className="w-full max-w-md rounded-3xl border border-border/70 bg-card/90 p-6 shadow-2xl">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          {description ? (
            <div className="text-sm text-muted-foreground">{description}</div>
          ) : null}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            loading={loading}
            className="rounded-2xl"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}


