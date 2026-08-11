import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { Filter, RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader, TableSkeleton } from "@/components/common/page";
import { CaseTable } from "@/components/cases/case-table";
import { casesApi, lawyersApi } from "@/lib/api";
import { CASE_CATEGORIES, CASE_OUTCOMES, CASE_STATUSES } from "@/lib/types";

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  client: fallback(z.string(), "").default(""),
  opposing: fallback(z.string(), "").default(""),
  status: fallback(z.string(), "all").default("all"),
  outcome: fallback(z.string(), "all").default("all"),
  court: fallback(z.string(), "all").default("all"),
  category: fallback(z.string(), "all").default("all"),
  lawyer: fallback(z.string(), "all").default("all"),
  from: fallback(z.string(), "").default(""),
  to: fallback(z.string(), "").default(""),
  sort: fallback(z.string(), "updated").default("updated"),
  mine: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/_authenticated/cases/")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "My Cases — Lexfolio Case Management" },
      {
        name: "description",
        content:
          "Search, filter and sort every matter by court, status, outcome, client, case type and hearing date.",
      },
      { property: "og:title", content: "My Cases — Lexfolio Case Management" },
      {
        property: "og:description",
        content: "Every matter you handle, filterable by court, status, outcome and client.",
      },
    ],
  }),
  component: CasesPage,
});

function CasesPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const mine = search.mine === "yes";

  const set = (patch: Record<string, string>) =>
    navigate({ search: (prev: Record<string, string>) => ({ ...prev, ...patch }) });

  const { data: courts } = useQuery({ queryKey: ["courts"], queryFn: () => casesApi.courts() });
  const { data: lawyers } = useQuery({ queryKey: ["lawyers"], queryFn: () => lawyersApi.list() });
  const { data, isLoading } = useQuery({
    queryKey: ["cases", search],
    queryFn: () =>
      casesApi.list({
        q: search.q,
        client: search.client,
        opposing: search.opposing,
        status: search.status,
        outcome: search.outcome,
        court: search.court,
        category: search.category,
        lawyerId: search.lawyer,
        from: search.from,
        to: search.to,
        sort: search.sort,
        mine,
      }),
  });

  const cases = data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        crumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: mine ? "My cases" : "All cases" },
        ]}
        eyebrow="Case register"
        title={mine ? "My cases" : "All cases"}
        description="Every matter on the register with court, status, outcome and hearing information."
        actions={
          <>
            <Button
              variant={mine ? "default" : "outline"}
              size="sm"
              onClick={() => set({ mine: mine ? "" : "yes" })}
            >
              <Filter className="size-4" /> {mine ? "Showing my cases" : "Show only my cases"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                navigate({
                  search: {
                    q: "",
                    client: "",
                    opposing: "",
                    status: "all",
                    outcome: "all",
                    court: "all",
                    category: "all",
                    lawyer: "all",
                    from: "",
                    to: "",
                    sort: "updated",
                    mine: "",
                  },
                })
              }
            >
              <RotateCcw className="size-4" /> Reset
            </Button>
          </>
        }
      />

      <section className="surface-card p-5">
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
          <div className="space-y-1.5 md:col-span-3 xl:col-span-2">
            <Label htmlFor="q">Search case number, title or party</Label>
            <div className="relative">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="q"
                className="pl-9"
                placeholder="e.g. FHC/1207/2020 or Meridian"
                value={search.q}
                onChange={(e) => set({ q: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="client">Client</Label>
            <Input
              id="client"
              placeholder="Client name"
              value={search.client}
              onChange={(e) => set({ client: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="opposing">Opposing party</Label>
            <Input
              id="opposing"
              placeholder="Opposing party"
              value={search.opposing}
              onChange={(e) => set({ opposing: e.target.value })}
            />
          </div>

          <FilterSelect
            label="Status"
            value={search.status}
            onChange={(v) => set({ status: v })}
            options={CASE_STATUSES}
          />
          <FilterSelect
            label="Outcome"
            value={search.outcome}
            onChange={(v) => set({ outcome: v })}
            options={CASE_OUTCOMES}
          />
          <FilterSelect
            label="Court"
            value={search.court}
            onChange={(v) => set({ court: v })}
            options={courts ?? []}
          />
          <FilterSelect
            label="Case type"
            value={search.category}
            onChange={(v) => set({ category: v })}
            options={CASE_CATEGORIES}
          />
          <div className="space-y-1.5">
            <Label>Lawyer</Label>
            <Select value={search.lawyer} onValueChange={(v) => set({ lawyer: v })}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All lawyers</SelectItem>
                {(lawyers ?? []).map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="from">Opened from</Label>
            <Input
              id="from"
              type="date"
              value={search.from}
              onChange={(e) => set({ from: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="to">Opened to</Label>
            <Input
              id="to"
              type="date"
              value={search.to}
              onChange={(e) => set({ to: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Sort by</Label>
            <Select value={search.sort} onValueChange={(v) => set({ sort: v })}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated">Recently updated</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="hearing">Next hearing</SelectItem>
                <SelectItem value="status">Case status</SelectItem>
                <SelectItem value="outcome">Outcome</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="surface-card overflow-hidden">
        <header className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Loading matters…"
              : `${cases.length} matter${cases.length === 1 ? "" : "s"}`}
          </p>
        </header>
        {isLoading ? <TableSkeleton rows={8} cols={6} /> : <CaseTable cases={cases} />}
      </section>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
