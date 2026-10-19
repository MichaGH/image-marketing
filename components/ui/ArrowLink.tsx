import Link from "next/link";
import type { ReactNode } from "react";

export function ArrowLink({
  children,
  href,
  size = "medium",
  light = false,
}: {
  children: ReactNode;
  href: string;
  size?: "small" | "medium" | "large";
  light?: boolean;
}) {
  const sizing =
    size === "large"
      ? "h-14 gap-[18px] pl-[26px] text-[15px]"
      : size === "small"
        ? "h-12 gap-3.5 pl-[22px] text-sm"
        : "h-[52px] gap-3.5 pl-[22px] text-sm";
  const circle =
    size === "large"
      ? "size-10 text-lg"
      : size === "small"
        ? "size-8"
        : "size-9";
  return (
    <Link
      href={href}
      className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full pr-2 font-semibold transition-colors ${sizing} ${light ? "bg-surface text-foreground hover:bg-surface-hover" : "bg-foreground text-white hover:bg-interactive-dark"}`}
    >
      {children}
      <span
        aria-hidden="true"
        className={`flex items-center justify-center rounded-full ${circle} ${light ? "bg-foreground text-white" : "bg-primary text-foreground"}`}
      >
        →
      </span>
    </Link>
  );
}
