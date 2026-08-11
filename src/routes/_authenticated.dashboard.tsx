import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  BadgeCheck,
  CalendarClock,
  CalendarPlus,
  CircleDashed,
  FileUp,
  Gavel,
  PieChart,
  Scale,
  ShieldX,
  TrendingUp,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/common/stat-card";
import { CardsSkeleton, EmptyState, PageHeader, SectionCard } from "@/components/common/page";
import { ChartLegend, DonutChart } from "@/components/charts/charts";
import { StatusBadge } from "@/components/common/badges";
import { casesApi, clientName, computeStats, hearingsApi, notificationsApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { daysUntil, fmtDate, fmtRelative } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Lexfolio Case Management" },
      {
        name: "description",
        content:
          "Your caseload at a glance: active matters, outcomes, upcoming hearings, deadlines and recent activity.",
      },
      { property: "og:title", content: "Dashboard — Lexfolio Case Management" },
      {
        property: "og:description",
        content: "Active matters, case outcomes, hearings and deadlines for counsel.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const { data: myCases, isLoading } = useQuery({
    queryKey: ["cases", { mine: true }],
    queryFn: () => casesApi.list({ mine: true }),
  });
  const { data: upcoming } = useQuery({
    queryKey: ["hearings", "upcoming"],
    queryFn: () => hearingsApi.upcoming(5),
  });
  const { data: activity } = useQuery({
    queryKey: ["activity"],
    queryFn: () => notificationsApi.activity(),
  });
  const { data: deadlines } = useQuery({
    queryKey: ["deadlines"],
    queryFn: () => notificationsApi.deadlines(),
  });

  const list = myCases ?? [];
  const stats = computeStats(list);
  const caseById = (id?: string) => list.find((c) => c.id === id);

  const outcomeData = [
    { name: "Won", value: stats.won, color: "var(--color-chart-1)" },
    { name: "Lost", value: stats.lost, color: "var(--color-chart-2)" },
    { name: "Settled", value: stats.settled, color: "var(--color-chart-5)" },
    { name: "Pending", value: stats.pending, color: "var(--color-chart-4)" },
    { name: "Withdrawn", value: stats.withdrawn, color: "var(--color-chart-6)" },
    { name: "Dismissed", value: stats.dismissed, color: "var(--color-chart-3)" },
  ];

  const quickActions = [
    { label: "Add case", icon: Gavel },
    { label: "Add client", icon: UserPlus },
    { label: "Schedule hearing", icon: CalendarPlus },
    { label: "Upload document", icon: FileUp },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Chambers overview"
        title={`Welcome back, ${user?.name ?? "Counsel"}`}
        description={`${user?.title} · ${user?.firm}. Here is where your practice stands today.`}
        actions={
          <>
            {quickActions.map((a) => (
              <Button
                key={a.label}
                variant={a.label === "Add case" ? "default" : "outline"}
                size="sm"
                onClick={() => toast.info(`${a.label} form opens here`)}
              >
                <a.icon className="size-4" /> {a.label}
              </Button>
            ))}
            <Button asChild variant="secondary" size="sm">
              <Link to="/reports">
                <PieChart className="size-4" /> View reports
              </Link>
            </Button>
          </>
        }
      />

      {isLoading ? (
        <CardsSkeleton count={8} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total cases" value={stats.total} icon={Scale} to="/cases" search={{ mine: "yes" }} hint="All matters you are counsel on" />
          <StatCard label="Active cases" value={stats.active} icon={Activity} tone="info" to="/cases" search={{ mine: "yes", status: "Active" }} hint="Currently before the courts" />
          <StatCard label="Won" value={stats.won} icon={BadgeCheck} tone="success" to="/outcomes" search={{ tab: "won" }} hint="Judgment in client's favour" />
          <StatCard label="Lost" value={stats.lost} icon={XCircle} tone="danger" to="/outcomes" search={{ tab: "lost" }} hint="Adverse judgments" />
          <StatCard label="Pending" value={stats.pending} icon={CircleDashed} to="/outcomes" search={{ tab: "pending" }} hint="Awaiting final outcome" />
          <StatCard label="Closed" value={stats.closed} icon={Gavel} to="/cases" search={{ mine: "yes", status: "Closed" }} hint="Billed and archived" />
          <StatCard label="Withdrawn / stopped" value={stats.withdrawn} icon={ShieldX} to="/outcomes" search={{ tab: "withdrawn" }} hint="Discontinued or stayed" />
          <StatCard label="Under appeal" value={stats.appealed} icon={TrendingUp} tone="gold" to="/outcomes" search={{ tab: "appealed" }} hint="Pending at appellate courts" />
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        <SectionCard
          title="Performance overview"
          description="Distribution of every decided and pending matter"
          className="xl:col-span-2"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <DonutChart
                data={outcomeData}
                centerValue={`${stats.successRate}%`}
                centerLabel="Case success rate"
              />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-eyebrow">Case success rate</p>
              <p className="font-display text-5xl">{stats.successRate}%</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Calculated across {stats.won + stats.lost + stats.settled + stats.dismissed}{" "}
                concluded matters — wins and settlements against all decided cases.
              </p>
              <Progress value={stats.successRate} className="mt-4" />
              <ChartLegend data={outcomeData} />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Upcoming hearings"
          description="Next five listings"
          actions={
            <Button asChild variant="ghost" size="sm">
              <Link to="/hearings">Open calendar</Link>
            </Button>
          }
          bodyClassName="p-0"
        >
          {!upcoming ? (
            <div className="space-y-2 p-5">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <EmptyState
              className="m-4 border-0"
              icon={<CalendarClock className="size-5" />}
              title="No upcoming hearings."
            />
          ) : (
            <ul className="divide-y divide-border">
              {upcoming.map((h) => {
                const c = caseById(h.caseId);
                const days = daysUntil(h.date);
                return (
                  <li key={h.id} className="flex gap-3 px-5 py-4">
                    <div className="flex size-11 shrink-0 flex-col items-center justify-center rounded-md bg-secondary text-center">
                      <span className="text-[0.65rem] text-muted-foreground uppercase">
                        {fmtDate(h.date).slice(3, 6)}
                      </span>
                      <span className="text-sm leading-none font-semibold">
                        {fmtDate(h.date).slice(0, 2)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {c ? (
                          <Link to="/cases/$caseId" params={{ caseId: c.id }} className="hover:underline">
                            {c.title}
                          </Link>
                        ) : (
                          h.type
                        )}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {h.time} · {h.type} · {h.court}
                      </p>
                      <p className="mt-1 text-[0.7rem] text-gold-foreground">
                        {days <= 0 ? "Today" : `In ${days} day${days === 1 ? "" : "s"}`}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Recent activity" description="Latest updates across your matters" bodyClassName="p-0">
          <ul className="divide-y divide-border">
            {(activity ?? []).slice(0, 7).map((a) => (
              <li key={a.id} className="flex items-start gap-3 px-5 py-3.5">
                <span className="mt-1 flex size-7 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                  {a.kind === "document" ? (
                    <FileUp className="size-3.5" />
                  ) : a.kind === "hearing" ? (
                    <CalendarClock className="size-3.5" />
                  ) : a.kind === "client" ? (
                    <Users className="size-3.5" />
                  ) : (
                    <Gavel className="size-3.5" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{a.detail}</p>
                </div>
                <span className="ml-auto shrink-0 text-[0.7rem] text-muted-foreground">
                  {fmtRelative(a.at)}
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Upcoming deadlines" description="Filing obligations requiring attention" bodyClassName="p-0">
          {(deadlines ?? []).length === 0 ? (
            <EmptyState className="m-4 border-0" title="No deadlines recorded." />
          ) : (
            <ul className="divide-y divide-border">
              {(deadlines ?? []).map((d) => {
                const c = caseById(d.caseId);
                return (
                  <li key={d.id} className="flex items-center gap-3 px-5 py-3.5">
                    <span
                      className={`size-2 shrink-0 rounded-full ${d.severity === "urgent" ? "bg-destructive" : "bg-gold"}`}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{d.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {c ? `${c.caseNumber} · ${clientName(c.clientId)}` : "Matter file"}
                      </p>
                    </div>
                    <div className="ml-auto shrink-0 text-right">
                      <p className="text-xs font-medium">{fmtDate(d.due)}</p>
                      <p className="text-[0.7rem] text-muted-foreground">
                        {daysUntil(d.due)} days left
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>
      </div>

      <SectionCard title="Matters needing attention" description="Highest priority open files" bodyClassName="p-0">
        <ul className="divide-y divide-border">
          {list
            .filter((c) => c.outcome === "Pending")
            .sort((a, b) => (a.priority === "Critical" ? -1 : 1))
            .slice(0, 5)
            .map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <Link
                    to="/cases/$caseId"
                    params={{ caseId: c.id }}
                    className="truncate text-sm font-medium hover:underline"
                  >
                    {c.title}
                  </Link>
                  <p className="truncate text-xs text-muted-foreground">
                    {c.caseNumber} · {c.court} · next hearing {fmtDate(c.nextHearing)}
                  </p>
                </div>
                <StatusBadge status={c.status} />
              </li>
            ))}
        </ul>
      </SectionCard>
    </div>
  );
}
