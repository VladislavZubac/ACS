import Link from "next/link";
import { cn } from "@/src/shared/lib/utils";

type LogoProps = {
  asLink?: boolean;
  short?: boolean;
  className?: string;
};

export function Logo({ asLink = true, short = false, className }: LogoProps) {
  const content = (
    <span className="inline-flex items-center gap-2 font-semibold tracking-tight text-foreground">
      <span className="rounded-xl bg-primary/15 px-2 py-0.5 text-xs font-bold uppercase text-primary shadow-inner shadow-primary/20">
        ACS
      </span>
      <span className="text-base sm:text-lg">
        {short ? "Cloud" : "Mini Cloud"}
      </span>
    </span>
  );

  if (asLink) {
    return (
      <Link href="/files" className={cn("inline-flex items-center", className)}>
        {content}
      </Link>
    );
  }

  return <span className={cn("inline-flex items-center", className)}>{content}</span>;
}

