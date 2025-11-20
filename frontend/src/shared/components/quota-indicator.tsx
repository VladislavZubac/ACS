import { cn, formatBytes } from "@/src/shared/lib/utils";

type Props = {
  usedBytes: number;
  totalBytes: number;
  size?: "default" | "compact";
  className?: string;
  loading?: boolean;
};

function resolveState(percent: number) {
  if (percent >= 90) return "danger";
  if (percent >= 80) return "warning";
  return "normal";
}

const stateToColor: Record<string, string> = {
  normal: "bg-primary",
  warning: "bg-amber-500",
  danger: "bg-red-500",
};

export function QuotaIndicator({
  usedBytes,
  totalBytes,
  size = "default",
  className,
  loading = false,
}: Props) {
  const safeTotal = totalBytes || 1;
  const percent = Math.min((usedBytes / safeTotal) * 100, 100);
  const state = resolveState(percent);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Квота</span>
        <span className="font-medium text-foreground">
          {loading ? "—" : `${formatBytes(usedBytes)} из ${formatBytes(totalBytes)}`}
        </span>
      </div>

      <div
        className={cn(
          "h-2 rounded-full bg-muted",
          size === "compact" && "h-1.5",
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-300",
            loading ? "bg-muted-foreground/40 animate-pulse" : stateToColor[state],
          )}
          style={{ width: loading ? "40%" : `${percent}%` }}
        />
      </div>
    </div>
  );
}

