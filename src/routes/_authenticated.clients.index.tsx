import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState, PageHeader, TableSkeleton } from "@/components/common/page";
import { Tone } from "@/components/common/badges";
import { casesApi, clientsApi } from "@/lib/api";
import { fmtRelative } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/clients/")({
  head: () => ({
    meta: [
      { title: "Clients — Lexfolio" },
      {
        name: "description",
        content: "Every client you represent with case counts, contact details and last activity.",
      },
      { property: "og:title", content: "Clients — Lexfolio" },
      {
        property: "og:description",
        content: "Client register with case counts, contact details and recent activity.",
      },
    ],
  }),
  component: ClientsPage,
});

function ClientsPage() {
  const [q, setQ] = useState("");
  const { data: clients, isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: () => clientsApi.list(),
  });
  const { data: cases } = useQuery({ queryKey: ["cases", {}], queryFn: () => casesApi.list({}) });

  const rows = (clients ?? [])
    .filter((c) => `${c.name} ${c.clientId} ${c.email}`.toLowerCase().includes(q.toLowerCase()))
    .map((c) => {
      const mine = (cases ?? []).filter((k) => k.clientId === c.id);
      return {
        client: c,
        total: mine.length,
        active: mine.filter((k) => k.outcome === "Pending").length,
        closed: mine.filter((k) => k.outcome !== "Pending").length,
      };
    });

  return (
    <div className="space-y-6">
      <PageHeader
        crumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Clients" }]}
        eyebrow="Client register"
        title="Clients"
        description="Everyone you represent, with their matters and latest activity."
      />

      <div className="relative max-w-md">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search clients by name, ID or email"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <section className="surface-card overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<Users className="size-5" />}
            title="No clients found."
            description="Adjust your search, or ask your administrator to assign client records to you."
          />
        ) : (
          <div className="w-full overflow-x-auto">
            <Table className="min-w-[52rem]">
              <TableHeader>
                <TableRow className="bg-secondary/60 hover:bg-secondary/60">
                  <TableHead>Client</TableHead>
                  <TableHead>Client ID</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Cases</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Closed</TableHead>
                  <TableHead>Last activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.client.id}>
                    <TableCell>
                      <Link
                        to="/clients/$clientId"
                        params={{ clientId: r.client.id }}
                        className="font-medium hover:underline"
                      >
                        {r.client.name}
                      </Link>
                      <div className="mt-1">
                        <Tone>{r.client.type}</Tone>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{r.client.clientId}</TableCell>
                    <TableCell className="whitespace-nowrap">{r.client.phone}</TableCell>
                    <TableCell className="max-w-[14rem] truncate">{r.client.email}</TableCell>
                    <TableCell>{r.total}</TableCell>
                    <TableCell>{r.active}</TableCell>
                    <TableCell>{r.closed}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {fmtRelative(r.client.lastActivity)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}
