import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader, SectionCard } from "@/components/common/page";
import { Tone } from "@/components/common/badges";
import { notificationsApi } from "@/lib/api";
import { fmtRelative } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({
    meta: [
      { title: "Notification Centre — Lexfolio" },
      {
        name: "description",
        content: "Hearing reminders, case assignments, status changes, filings and deadlines.",
      },
      { property: "og:title", content: "Notification Centre — Lexfolio" },
      {
        property: "og:description",
        content: "Hearing reminders, assignments, status changes, filings and deadlines.",
      },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.list(),
  });
  const [read, setRead] = useState<string[]>([]);
  const items = data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        crumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Notifications" }]}
        eyebrow="Alerts"
        title="Notification centre"
        description="Everything requiring your attention across cases, hearings, clients and courts."
        actions={
          <Button variant="outline" size="sm" onClick={() => setRead(items.map((n) => n.id))}>
            Mark all as read
          </Button>
        }
      />

      <SectionCard title="All notifications" bodyClassName="p-0">
        {items.length === 0 ? (
          <EmptyState icon={<Bell className="size-5" />} title="You're all caught up." />
        ) : (
          <ul className="divide-y divide-border">
            {items.map((n) => {
              const isRead = n.read || read.includes(n.id);
              return (
                <li key={n.id} className="flex flex-wrap items-start gap-3 px-5 py-4">
                  <span
                    className={`mt-2 size-2 shrink-0 rounded-full ${isRead ? "bg-border" : "bg-gold"}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium">{n.title}</p>
                      <Tone>{n.kind}</Tone>
                    </div>
                    <p className="text-sm text-muted-foreground">{n.detail}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{fmtRelative(n.at)}</p>
                  </div>
                  {n.caseId && (
                    <Button asChild size="sm" variant="ghost">
                      <Link to="/cases/$caseId" params={{ caseId: n.caseId }}>
                        Open case
                      </Link>
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
