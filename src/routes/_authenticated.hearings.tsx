import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CalendarClock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { EmptyState, PageHeader, SectionCard } from "@/components/common/page";
import { Tone } from "@/components/common/badges";
import { casesApi, hearingsApi } from "@/lib/api";
import { fmtDate, fmtLongDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/hearings")({
  head: () => ({
    meta: [
      { title: "Hearings & Court Calendar — Lexfolio" },
      {
        name: "description",
        content:
          "Upcoming and past court listings with judge, court room, hearing type and status.",
      },
      { property: "og:title", content: "Hearings & Court Calendar — Lexfolio" },
      {
        property: "og:description",
        content: "Court listings with judge, court room, hearing type and status.",
      },
    ],
  }),
  component: HearingsPage,
});

function HearingsPage() {
  const [selected, setSelected] = useState<Date | undefined>(new Date());
  const { data: hearings } = useQuery({
    queryKey: ["hearings"],
    queryFn: () => hearingsApi.list(),
  });
  const { data: cases } = useQuery({ queryKey: ["cases", {}], queryFn: () => casesApi.list({}) });

  const all = hearings ?? [];
  const caseFor = (id: string) => (cases ?? []).find((c) => c.id === id);
  const upcoming = all.filter((h) => new Date(h.date) >= new Date());
  const dayList = selected
    ? all.filter((h) => fmtDate(h.date) === fmtDate(selected.toISOString()))
    : [];
  const marked = all.map((h) => new Date(h.date));

  const Item = ({ id }: { id: string }) => {
    const h = all.find((x) => x.id === id)!;
    const c = caseFor(h.caseId);
    return (
      <li className="flex flex-wrap items-center gap-3 px-5 py-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">
            {c ? (
              <Link to="/cases/$caseId" params={{ caseId: c.id }} className="hover:underline">
                {c.title}
              </Link>
            ) : (
              h.type
            )}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {c?.caseNumber} · {h.type} · {h.court} · {h.judge}
          </p>
          <p className="truncate text-xs text-muted-foreground">{h.location}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">{fmtDate(h.date)}</p>
          <p className="text-xs text-muted-foreground">{h.time}</p>
        </div>
        <Tone
          tone={h.status === "Scheduled" ? "gold" : h.status === "Adjourned" ? "danger" : "neutral"}
        >
          {h.status}
        </Tone>
      </li>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        crumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Hearings & calendar" }]}
        eyebrow="Court schedule"
        title="Hearings & calendar"
        description="Every listing across your matters, in calendar or list view."
      />

      <Tabs defaultValue="calendar">
        <TabsList>
          <TabsTrigger value="calendar">Calendar view</TabsTrigger>
          <TabsTrigger value="list">List view</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-5 grid gap-6 lg:grid-cols-[auto_1fr]">
          <SectionCard title="Select a date" bodyClassName="p-3">
            <Calendar
              mode="single"
              selected={selected}
              onSelect={setSelected}
              modifiers={{ hearing: marked }}
              modifiersClassNames={{ hearing: "font-semibold text-gold-foreground underline" }}
            />
          </SectionCard>
          <SectionCard
            title={selected ? fmtLongDate(selected.toISOString()) : "Listings"}
            description={`${dayList.length} listing(s) on this date`}
            bodyClassName="p-0"
          >
            {dayList.length === 0 ? (
              <EmptyState
                className="m-4 border-0"
                icon={<CalendarClock className="size-5" />}
                title="No hearings on this date."
              />
            ) : (
              <ul className="divide-y divide-border">
                {dayList.map((h) => (
                  <Item key={h.id} id={h.id} />
                ))}
              </ul>
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="list" className="mt-5 space-y-6">
          <SectionCard title="Upcoming hearings" bodyClassName="p-0">
            {upcoming.length === 0 ? (
              <EmptyState className="m-4 border-0" title="No upcoming hearings." />
            ) : (
              <ul className="divide-y divide-border">
                {upcoming.map((h) => (
                  <Item key={h.id} id={h.id} />
                ))}
              </ul>
            )}
          </SectionCard>
          <SectionCard title="Past listings" bodyClassName="p-0">
            <ul className="divide-y divide-border">
              {all
                .filter((h) => new Date(h.date) < new Date())
                .slice(0, 20)
                .map((h) => (
                  <Item key={h.id} id={h.id} />
                ))}
            </ul>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
