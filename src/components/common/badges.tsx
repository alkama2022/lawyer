import { cn } from "@/lib/utils";
import type { CaseOutcome, CaseStatus } from "@/lib/types";

const statusTone: Record<CaseStatus, string> = {
  Active: "bg-info/10 text-info border-info/25",
  Pending: "bg-muted text-muted-foreground border-border",
  "Hearing Scheduled": "bg-gold/15 text-gold-foreground border-gold/35",
  "Under Review": "bg-secondary text-secondary-foreground border-border",
  Settled: "bg-chart-5/12 text-chart-5 border-chart-5/30",
  Won: "bg-success/12 text-success border-success/30",
  Lost: "bg-destructive/10 text-destructive border-destructive/25",
  Dismissed: "bg-destructive/8 text-destructive border-destructive/20",
  Withdrawn: "bg-muted text-muted-foreground border-border",
  Closed: "bg-primary/8 text-primary border-primary/20",
  Appealed: "bg-chart-6/12 text-chart-6 border-chart-6/30",
  Stayed: "bg-warning/15 text-warning-foreground border-warning/35",
};

const outcomeTone: Record<CaseOutcome, string> = {
  Won: "bg-success/12 text-success border-success/30",
  Lost: "bg-destructive/10 text-destructive border-destructive/25",
  Settled: "bg-chart-5/12 text-chart-5 border-chart-5/30",
  Dismissed: "bg-destructive/8 text-destructive border-destructive/20",
  Withdrawn: "bg-muted text-muted-foreground border-border",
  Pending: "bg-secondary text-secondary-foreground border-border",
};

const base =
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap";

export function StatusBadge({ status, className }: { status: CaseStatus; className?: string }) {
  return <span className={cn(base, statusTone[status], className)}>{status}</span>;
}

export function OutcomeBadge({ outcome, className }: { outcome: CaseOutcome; className?: string }) {
  return <span className={cn(base, outcomeTone[outcome], className)}>{outcome}</span>;
}

export function PriorityBadge({ priority }: { priority: string }) {
  const tone =
    priority === "Critical"
      ? "bg-destructive/10 text-destructive border-destructive/25"
      : priority === "High"
        ? "bg-warning/15 text-warning-foreground border-warning/35"
        : priority === "Medium"
          ? "bg-info/10 text-info border-info/25"
          : "bg-muted text-muted-foreground border-border";
  return <span className={cn(base, tone)}>{priority} priority</span>;
}

export function Tone({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "danger" | "gold" | "info";
}) {
  const map = {
    neutral: "bg-muted text-muted-foreground border-border",
    success: "bg-success/12 text-success border-success/30",
    danger: "bg-destructive/10 text-destructive border-destructive/25",
    gold: "bg-gold/15 text-gold-foreground border-gold/35",
    info: "bg-info/10 text-info border-info/25",
  } as const;
  return <span className={cn(base, map[tone])}>{children}</span>;
}
