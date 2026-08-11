import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  to,
  search,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  to?: string;
  search?: Record<string, string>;
  tone?: "default" | "success" | "danger" | "gold" | "info";
}) {
  const toneRing = {
    default: "text-muted-foreground bg-secondary",
    success: "text-success bg-success/10",
    danger: "text-destructive bg-destructive/10",
    gold: "text-gold-foreground bg-gold/15",
    info: "text-info bg-info/10",
  }[tone];

  const body = (
    <div className="surface-card h-full p-5 transition-shadow hover:shadow-panel">
      <div className="flex items-start justify-between gap-3">
        <p className="text-eyebrow">{label}</p>
        {Icon && (
          <span className={cn("flex size-8 items-center justify-center rounded-md", toneRing)}>
            <Icon className="size-4" />
          </span>
        )}
      </div>
      <p className="mt-3 font-display text-3xl leading-none">{value}</p>
      {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );

  if (!to) return body;
  return (
    <Link to={to} search={(search ?? {}) as never} className="block focus-visible:outline-none">
      {body}
    </Link>
  );
}
