import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader, SectionCard } from "@/components/common/page";
import { StatCard } from "@/components/common/stat-card";
import { BarsChart, ChartLegend, DonutChart, TrendChart } from "@/components/charts/charts";
import { casesApi, computeStats } from "@/lib/api";
import { CASE_CATEGORIES } from "@/lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({
    meta: [
      { title: "Reports & Analytics — Lexfolio" },
      {
        name: "description",
        content:
          "Case performance analytics by outcome, year, legal category, court and success rate.",
      },
      { property: "og:title", content: "Reports & Analytics — Lexfolio" },
      {
        property: "og:description",
        content: "Analytics by outcome, year, legal category, court and success-rate trend.",
      },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const [year, setYear] = useState("all");
  const [category, setCategory] = useState("all");
  const { data } = useQuery({
    queryKey: ["cases", { mine: true }],
    queryFn: () => casesApi.list({ mine: true }),
  });

  const all = data ?? [];
  const list = all
    .filter((c) => (year === "all" ? true : new Date(c.dateOpened).getFullYear() === Number(year)))
    .filter((c) => (category === "all" ? true : c.category === category));
  const stats = computeStats(list);

  const years = [...new Set(all.map((c) => new Date(c.dateOpened).getFullYear()))].sort();

  const outcomeData = [
    { name: "Won", value: stats.won, color: "var(--color-chart-1)" },
    { name: "Lost", value: stats.lost, color: "var(--color-chart-2)" },
    { name: "Settled", value: stats.settled, color: "var(--color-chart-5)" },
    { name: "Dismissed", value: stats.dismissed, color: "var(--color-chart-3)" },
    { name: "Withdrawn", value: stats.withdrawn, color: "var(--color-chart-6)" },
    { name: "Pending", value: stats.pending, color: "var(--color-chart-4)" },
  ];

  const perYear = years.map((y) => ({
    name: String(y),
    value: list.filter((c) => new Date(c.dateOpened).getFullYear() === y).length,
  }));

  const byCategory = CASE_CATEGORIES.map((c) => ({
    name: c,
    value: list.filter((k) => k.category === c).length,
  })).filter((d) => d.value > 0);

  const byCourt = [...new Set(list.map((c) => c.court))].map((court) => ({
    name: court,
    value: list.filter((c) => c.court === court).length,
  }));

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthly = months.map((m, i) => ({
    name: m,
    value: list.filter((c) => new Date(c.updatedAt).getMonth() === i).length,
  }));

  const successTrend = years.map((y) => {
    const cs = list.filter((c) => new Date(c.dateOpened).getFullYear() === y);
    const decided = cs.filter((c) => c.outcome !== "Pending");
    const wins = cs.filter((c) => c.outcome === "Won" || c.outcome === "Settled").length;
    return {
      name: String(y),
      value: decided.length ? Math.round((wins / decided.length) * 100) : 0,
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        crumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Reports & analytics" }]}
        eyebrow="Practice analytics"
        title="Reports & analytics"
        description="Performance of your caseload across outcomes, courts, categories and time."
        actions={
          <>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All years</SelectItem>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Case type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All case types</SelectItem>
                {CASE_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info("Report export coming soon")}
            >
              <Download className="size-4" /> Export
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total cases" value={stats.total} />
        <StatCard label="Won" value={stats.won} tone="success" />
        <StatCard label="Lost" value={stats.lost} tone="danger" />
        <StatCard label="Settled" value={stats.settled} tone="info" />
        <StatCard label="Withdrawn" value={stats.withdrawn} />
        <StatCard label="Pending" value={stats.pending} />
        <StatCard label="Dismissed" value={stats.dismissed} />
        <StatCard label="Success rate" value={`${stats.successRate}%`} tone="gold" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Case outcome distribution">
          <DonutChart
            data={outcomeData}
            centerValue={`${stats.successRate}%`}
            centerLabel="Success rate"
          />
          <ChartLegend data={outcomeData} />
        </SectionCard>
        <SectionCard title="Cases per year">
          <BarsChart data={perYear} />
        </SectionCard>
        <SectionCard title="Cases by legal category">
          <BarsChart
            data={byCategory}
            layout="horizontal"
            height={320}
            color="var(--color-chart-5)"
          />
        </SectionCard>
        <SectionCard title="Cases by court">
          <BarsChart data={byCourt} layout="horizontal" height={300} color="var(--color-chart-3)" />
        </SectionCard>
        <SectionCard title="Monthly case activity">
          <BarsChart data={monthly} color="var(--color-chart-4)" />
        </SectionCard>
        <SectionCard title="Success rate trend">
          <TrendChart data={successTrend} suffix="%" />
        </SectionCard>
      </div>
    </div>
  );
}
