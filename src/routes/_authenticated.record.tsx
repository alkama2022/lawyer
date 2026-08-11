import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader, SectionCard } from "@/components/common/page";
import { StatCard } from "@/components/common/stat-card";
import { BarsChart, ChartLegend, DonutChart } from "@/components/charts/charts";
import { Tone } from "@/components/common/badges";
import { casesApi, computeStats } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { initials } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/record")({
  head: () => ({
    meta: [
      { title: "My Professional Record — Lexfolio" },
      {
        name: "description",
        content:
          "Bar registration, practice areas, career statistics and lifetime case performance.",
      },
      { property: "og:title", content: "My Professional Record — Lexfolio" },
      {
        property: "og:description",
        content: "Bar registration, practice areas and lifetime case performance for counsel.",
      },
    ],
  }),
  component: RecordPage,
});

function RecordPage() {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ["cases", { mine: true }],
    queryFn: () => casesApi.list({ mine: true }),
  });
  const stats = computeStats(data ?? []);

  const outcomeData = [
    { name: "Won", value: stats.won, color: "var(--color-chart-1)" },
    { name: "Lost", value: stats.lost, color: "var(--color-chart-2)" },
    { name: "Settled", value: stats.settled, color: "var(--color-chart-5)" },
    { name: "Dismissed", value: stats.dismissed, color: "var(--color-chart-3)" },
    { name: "Withdrawn", value: stats.withdrawn, color: "var(--color-chart-6)" },
    { name: "Active", value: stats.active, color: "var(--color-chart-4)" },
  ];

  const info: Array<[string, string]> = [
    ["Lawyer ID", user?.id ?? "—"],
    ["Bar registration", user?.barNumber ?? "—"],
    ["License number", user?.licenseNumber ?? "—"],
    ["Email", user?.email ?? "—"],
    ["Phone", user?.phone ?? "—"],
    ["Office address", user?.officeAddress ?? "—"],
    ["Law firm", user?.firm ?? "—"],
    ["Position", user?.title ?? "—"],
    ["Specialisation", user?.specialization ?? "—"],
    ["Years of experience", `${user?.yearsExperience ?? 0} years`],
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        crumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Professional record" }]}
        eyebrow="Counsel profile"
        title="My professional record"
        description="Your registration details, practice areas and complete career performance."
      />

      <section className="surface-card flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
        <Avatar className="size-20">
          <AvatarFallback className="bg-primary text-lg font-semibold text-primary-foreground">
            {initials(user?.name ?? "")}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h2 className="text-xl font-semibold">{user?.name}</h2>
          <p className="text-sm text-muted-foreground">
            {user?.title} · {user?.firm}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(user?.practiceAreas ?? []).map((a) => (
              <Tone key={a} tone="gold">
                {a}
              </Tone>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Personal & professional information"
          bodyClassName="grid gap-4 sm:grid-cols-2"
        >
          {info.map(([k, v]) => (
            <div key={k}>
              <p className="text-eyebrow">{k}</p>
              <p className="mt-1 text-sm font-medium break-words">{v}</p>
            </div>
          ))}
        </SectionCard>
        <SectionCard title="Professional biography">
          <p className="text-sm leading-relaxed text-muted-foreground">{user?.bio}</p>
        </SectionCard>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total cases handled" value={stats.total} />
        <StatCard label="Cases won" value={stats.won} tone="success" />
        <StatCard label="Cases lost" value={stats.lost} tone="danger" />
        <StatCard label="Cases settled" value={stats.settled} tone="info" />
        <StatCard label="Cases withdrawn" value={stats.withdrawn} />
        <StatCard label="Cases dismissed" value={stats.dismissed} />
        <StatCard label="Active cases" value={stats.active} />
        <StatCard
          label="Average case duration"
          value={`${Math.round(stats.avgDurationDays / 30)} mo`}
          hint={`${stats.avgDurationDays} days across concluded matters`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Career outcome breakdown">
          <DonutChart
            data={outcomeData}
            centerValue={`${stats.successRate}%`}
            centerLabel="Success rate"
          />
          <ChartLegend data={outcomeData} />
        </SectionCard>
        <SectionCard title="Outcomes by volume">
          <BarsChart data={outcomeData} layout="horizontal" height={300} />
        </SectionCard>
      </div>
    </div>
  );
}
