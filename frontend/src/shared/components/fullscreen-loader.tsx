type Props = {
  message?: string;
};

export function FullscreenLoader({
  message = "Загружаем интерфейс...",
}: Props) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background/80 px-4 py-8">
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-border/70 bg-card/90 px-10 py-8 shadow-lg">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

