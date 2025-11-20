"use client";

import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { cn } from "@/src/shared/lib/utils";
import {
  type ResolvedTheme,
  type Theme,
  useTheme,
} from "@/src/shared/providers/theme/theme-provider";

const options: Array<{
  value: Theme;
  label: string;
  icon: LucideIcon;
}> = [
  { value: "light", label: "Светлая", icon: Sun },
  { value: "system", label: "Система", icon: Monitor },
  { value: "dark", label: "Тёмная", icon: Moon },
];

function isOptionActive(
  option: Theme,
  theme: Theme,
  resolvedTheme: ResolvedTheme,
) {
  if (option === "system") {
    return theme === "system";
  }

  if (theme === "system") {
    return resolvedTheme === option;
  }

  return theme === option;
}

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <div className="flex items-center rounded-full border border-border/70 bg-card/80 p-1 text-xs shadow-sm backdrop-blur">
      {options.map(({ value, label, icon: Icon }) => {
        const active = isOptionActive(value, theme, resolvedTheme);

        return (
          <button
            key={value}
            type="button"
            className={cn(
              "flex items-center gap-1 rounded-full px-3 py-1 text-muted-foreground transition hover:text-foreground",
              active && "bg-background text-foreground shadow",
            )}
            onClick={() => setTheme(value)}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

