import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, PageHeader, SectionCard } from "@/components/common/page";
import { CaseTable } from "@/components/cases/case-table";
import { StatCard } from "@/components/common/stat-card";
import { clientsApi } from "@/lib/api";
import { fmtDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/clients/$clientId")({
  head: () => ({
    meta: [
      { title: "Client profile — Lexfolio" },
      { name: "description", content: "Client contact details and complete case history." },
      { property: "og:title", content: "Client profile — Lexfolio" },
      { property: "og:description", content: "Client contact details and complete case history." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ClientDetail,
});

function ClientDetail() {
  const { clientId } = Route.useParams();
  const { data: client, isLoading } = useQuery({
    queryKey: ["client", clientId],
    queryFn: () => clientsApi.get(clientId),
  });
  const { data: cases } = useQuery({
    queryKey: ["client-cases", clientId],
    queryFn: () => clientsApi.casesFor(clientId),
  });

  if (isLoading) return <Skeleton className="h-[50vh] w-full rounded-xl" />;
  if (!client)
    return (
      <EmptyState
        title="Client not found"
        description="This client record may have been archived or is outside your access."
        action={
          <Button asChild>
            <Link to="/clients">Back to clients</Link>
          </Button>
        }
      />
    );

  const list = cases ?? [];
  const active = list.filter((c) => c.outcome === "Pending").length;

  return (
    <div className="space-y-6">
      <PageHeader
        crumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Clients", to: "/clients" },
          { label: client.name },
        ]}
        eyebrow={`${client.clientId} · ${client.type} client`}
        title={client.name}
        description={`Client since ${fmtDate(client.since)}. ${client.notes}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total cases" value={list.length} />
        <StatCard label="Active cases" value={active} tone="info" />
        <StatCard label="Concluded" value={list.length - active} tone="success" />
        <StatCard label="Won" value={list.filter((c) => c.outcome === "Won").length} tone="gold" />
      </div>

      <SectionCard title="Contact details" bodyClassName="grid gap-4 sm:grid-cols-2">
        {[
          ["Phone", client.phone],
          ["Email", client.email],
          ["Address", client.address],
          ["Client type", client.type],
        ].map(([k, v]) => (
          <div key={k}>
            <p className="text-eyebrow">{k}</p>
            <p className="mt-1 text-sm font-medium">{v}</p>
          </div>
        ))}
      </SectionCard>

      <section className="surface-card overflow-hidden">
        <header className="border-b border-border px-5 py-3.5">
          <p className="text-sm font-medium">Case history</p>
        </header>
        <CaseTable
          cases={list}
          emptyTitle="No cases for this client yet."
          emptyDescription="New matters opened for this client will appear here."
        />
      </section>
    </div>
  );
}
