import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Pill buttons per DESIGN.md: teal is the single primary action colour, navy
 * signals a second product direction, secondary/ghost are outlined. 48px
 * radius minimum — pill geometry is the signature.
 */
type Variant = "primary" | "navy" | "secondary" | "ghost";
type Size = "sm" | "md";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-55";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--accent)] text-[var(--accent-ink)] hover:bg-[var(--accent-hover)]",
  navy: "bg-[var(--navy)] text-white hover:bg-[var(--navy-hover)]",
  secondary:
    "border border-[var(--pine)] bg-transparent text-[var(--pine)] hover:bg-[var(--accent-wash)]",
  ghost:
    "text-[var(--ink-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--ink)]",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-4 text-sm",
  md: "h-10 px-6 text-sm",
};

export function buttonClass(
  variant: Variant = "primary",
  size: Size = "md",
  className?: string,
) {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return (
    <button className={buttonClass(variant, size, className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  external = false,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  external?: boolean;
}) {
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        // noopener/noreferrer prevents the opened page reaching back via
        // window.opener; this matters for links coming from a spreadsheet.
        rel="noopener noreferrer"
        className={buttonClass(variant, size, className)}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={buttonClass(variant, size, className)}>
      {children}
    </Link>
  );
}
