import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { PageHeader, TableSkeleton } from "@/components/common/page";
import { CaseTable } from "@/components/cases/case-table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { casesApi } from "@/lib/api";
import type { CaseRecord } from "@/lib/types";

const searchSchema = z.object({ tab: fallback(z.string(), "won").default("won") });

const TABS: Array<{ id: string; label: string; match: (c: CaseRecord) => boolean; blurb: string }> = [
  { id: "won", label: "Won", match: (c) => c.outcome === "Won", blurb: "Matters concluded in the client's favour." },
  { id: "lost", label: "Lost", match: (c) => c.outcome === "Lost", blurb: "Adverse judgments, with outcome summaries." },
  { id: "settled", label: "Settled", match: (c) => c.outcome === "Settled", blurb: "Resolved by terms of settlement." },
  {
    id: "withdrawn",
    label: "Withdrawn / stopped",
    match: (c) => c.outcome === "Withdrawn" || c.status === "Stayed" || c.status === "Withdrawn",
    blurb: "Discontinued, stayed, abandoned or terminated matters.",
  },
  { id: "pending", label: "Pending", match: (c) => c.outcome === "Pending" && c.status !== "Appealed", blurb: "Matters without a final outcome." },
  { id: "appealed", label: "Appealed", match: (c) => c.status === "Appealed", blurb: "Matters currently before appellate courts." },
];

export const Route = createFileRoute("/_authenticated/outcomes")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Case Outcomes — Lexfolio" },
      {
        name: "description",
        content:
          "Complete historical performance: won, lost, settled, withdrawn, pending and appealed matters.",
      },
      { property: "og:title", content: "Case Outcomes — Lexfolio" },
      {
        property: "og:description",
        content: "Won, lost, settled, withdrawn, pending and appealed matters in one record.",
      },
    ],
  }),
  component: OutcomesPage,
});

function OutcomesPage() {
  const { tab } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { data, isLoading } = useQuery({
    queryKey: ["cases", { mine: true, sort: "newest" }],
    queryFn: () => casesApi.list({ mine: true, sort: "newest" }),
  });

  const active = TABS.find((t) => t.id === tab) ?? TABS[0]!;
  const list = (data ?? []).filter(active.match);

  return (
    <div className="space-y-6">
      <PageHeader
        crumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Case outcomes" }]}
        eyebrow="Historical performance"
        title="Case outcomes"
        description="Your complete record of decided and ongoing matters, grouped by result."
      />

      <Tabs value={active.id} onValueChange={(v) => navigate({ search: { tab: v } })}>
        <TabsList className="flex-wrap">
          {TABS.map((t) => (
            <TabsTrigger key={t.id} value={t.id}>
              {t.label}
              <span className="ml-1.5 text-xs text-muted-foreground">
                {(data ?? []).filter(t.match).length}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <section className="surface-card overflow-hidden">
        <header className="border-b border-border px-5 py-3.5">
          <p className="text-sm font-medium">{active.label} cases</p>
          <p className="text-xs text-muted-foreground">{active.blurb}</p>
        </header>
        {isLoading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : (
          <CaseTable
            cases={list}
            emptyTitle={`No ${active.label.toLowerCase()} cases yet.`}
            emptyDescription="Matters will appear in this category once their outcome is recorded."
          />
        )}
      </section>
    </div>
  );
}
