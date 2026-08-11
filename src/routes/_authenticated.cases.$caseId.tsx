import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, Download, FileText, Gavel, Mail, MapPin, Phone, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState, PageHeader, SectionCard } from "@/components/common/page";
import { OutcomeBadge, PriorityBadge, StatusBadge, Tone } from "@/components/common/badges";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { casesApi, clientsApi, documentsApi, hearingsApi, lawyersApi } from "@/lib/api";
import { durationBetween, fmtDate, fmtSize, initials } from "@/lib/format";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/cases/$caseId")({
  head: () => ({
    meta: [
      { title: "Case file — Lexfolio Case Management" },
      {
        name: "description",
        content:
          "Full case file: parties, court, legal team, timeline, hearings and filed documents.",
      },
      { property: "og:title", content: "Case file — Lexfolio Case Management" },
      {
        property: "og:description",
        content: "Parties, court, legal team, case timeline, hearings and documents.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CaseDetail,
});

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border/70 py-2.5 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium sm:text-right">{value}</span>
    </div>
  );
}

function CaseDetail() {
  const { caseId } = Route.useParams();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: record, isLoading } = useQuery({
    queryKey: ["case", caseId],
    queryFn: () => casesApi.get(caseId),
  });
  const { data: clients } = useQuery({ queryKey: ["clients"], queryFn: () => clientsApi.list() });
  const { data: lawyers } = useQuery({ queryKey: ["lawyers"], queryFn: () => lawyersApi.list() });
  const { data: docs } = useQuery({
    queryKey: ["documents", caseId],
    queryFn: () => documentsApi.forCase(caseId),
  });
  const { data: caseHearings } = useQuery({
    queryKey: ["hearings", caseId],
    queryFn: () => hearingsApi.forCase(caseId),
  });

  if (isLoading) return <Skeleton className="h-[60vh] w-full rounded-xl" />;
  if (!record)
    return (
      <EmptyState
        title="Case not found"
        description="This matter may have been archived or you may not have access to it."
        action={
          <Button asChild>
            <Link to="/cases">Back to case register</Link>
          </Button>
        }
      />
    );

  const client = (clients ?? []).find((c) => c.id === record.clientId);
  const team = (lawyers ?? []).filter((l) => record.lawyerIds.includes(l.id));

  return (
    <div className="space-y-6">
      <PageHeader
        crumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Cases", to: "/cases" },
          { label: record.caseNumber },
        ]}
        eyebrow={record.caseNumber}
        title={record.title}
        description={record.description}
        actions={
          <>
            <StatusBadge status={record.status} />
            <OutcomeBadge outcome={record.outcome} />
            <PriorityBadge priority={record.priority} />
            <Button size="sm" variant="outline" onClick={() => toast.info("Hearing scheduler opens here")}>
              <CalendarClock className="size-4" /> Schedule hearing
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="size-4" /> Close file
            </Button>
          </>
        }
      />

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="hearings">Hearings</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-5 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard title="Case overview" bodyClassName="px-5 py-2">
              <Row label="Case number" value={record.caseNumber} />
              <Row label="Case type" value={record.category} />
              <Row label="Court" value={record.court} />
              <Row label="Court location" value={record.courtLocation} />
              <Row label="Judge" value={record.judge} />
              <Row label="Date filed" value={fmtDate(record.dateFiled)} />
              <Row label="Date opened" value={fmtDate(record.dateOpened)} />
              <Row label="Current status" value={<StatusBadge status={record.status} />} />
              <Row label="Outcome" value={<OutcomeBadge outcome={record.outcome} />} />
              <Row label="Duration" value={durationBetween(record.dateOpened, record.closedAt ?? new Date().toISOString())} />
              {record.outcomeSummary && <Row label="Outcome summary" value={record.outcomeSummary} />}
            </SectionCard>

            <div className="space-y-6">
              <SectionCard title="Client information" bodyClassName="px-5 py-2">
                <Row
                  label="Client"
                  value={
                    client ? (
                      <Link to="/clients/$clientId" params={{ clientId: client.id }} className="hover:underline">
                        {client.name}
                      </Link>
                    ) : (
                      "—"
                    )
                  }
                />
                <Row label="Client ID" value={client?.clientId ?? "—"} />
                <Row label="Client type" value={client?.type ?? "—"} />
                <Row label="Phone" value={client?.phone ?? "—"} />
                <Row label="Email" value={client?.email ?? "—"} />
                <Row label="Address" value={client?.address ?? "—"} />
                <Row label="Notes" value={client?.notes ?? "—"} />
              </SectionCard>

              <SectionCard title="Opposing party" bodyClassName="px-5 py-2">
                <Row label="Name" value={record.opposingParty.name} />
                <Row label="Contact" value={record.opposingParty.contact} />
                <Row label="Counsel" value={record.opposingParty.counsel} />
                <Row label="Organisation" value={record.opposingParty.organization} />
              </SectionCard>
            </div>
          </div>

          <SectionCard title="Legal team" description="Counsel assigned to this matter">
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {team.map((l) => (
                <li key={l.id} className="flex gap-3 rounded-lg border border-border p-4">
                  <Avatar className="size-10">
                    <AvatarFallback className="bg-secondary text-xs font-semibold">
                      {initials(l.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{l.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {l.id === record.leadLawyerId ? "Lead counsel" : l.role} · {l.specialization}
                    </p>
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <Mail className="size-3" /> {l.email}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="size-3" /> {l.phone}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </SectionCard>
        </TabsContent>

        <TabsContent value="timeline" className="mt-5">
          <SectionCard title="Case timeline" description="Chronological record of every step taken">
            <ol className="relative space-y-6 border-l border-border pl-6">
              {record.timeline.map((t) => (
                <li key={t.id} className="relative">
                  <span className="absolute top-1.5 -left-[1.72rem] size-3 rounded-full border-2 border-card bg-gold" />
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{t.title}</p>
                    <Tone>{fmtDate(t.date)}</Tone>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Recorded by {t.createdBy}</p>
                  {t.documents.length > 0 && (
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {t.documents.map((d) => (
                        <li
                          key={d}
                          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/60 px-2 py-1 text-xs"
                        >
                          <FileText className="size-3" /> {d}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ol>
          </SectionCard>
        </TabsContent>

        <TabsContent value="hearings" className="mt-5">
          <SectionCard title="Hearings" bodyClassName="p-0">
            {(caseHearings ?? []).length === 0 ? (
              <EmptyState className="m-4 border-0" title="No upcoming hearings." />
            ) : (
              <ul className="divide-y divide-border">
                {(caseHearings ?? []).map((h) => (
                  <li key={h.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        {h.type} — {fmtDate(h.date)} at {h.time}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="size-3" /> {h.location} · {h.judge}
                      </p>
                    </div>
                    <Tone tone={h.status === "Scheduled" ? "gold" : "neutral"}>{h.status}</Tone>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="documents" className="mt-5">
          <SectionCard
            title="Documents"
            actions={
              <Button size="sm" variant="outline" onClick={() => toast.info("Secure upload opens here")}>
                Upload document
              </Button>
            }
            bodyClassName="p-0"
          >
            {(docs ?? []).length === 0 ? (
              <EmptyState className="m-4 border-0" title="No documents available for this case." />
            ) : (
              <ul className="divide-y divide-border">
                {(docs ?? []).map((d) => (
                  <li key={d.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                    <FileText className="size-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{d.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {d.type} · v{d.version} · {fmtSize(d.sizeKb)} · uploaded {fmtDate(d.uploadedAt)} by {d.uploadedBy}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => toast.info("Secure viewer opens here")}>
                      <Download className="size-4" /> Download
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Close this case file?"
        description={`${record.caseNumber} will be archived. This action is recorded in the audit trail.`}
        confirmLabel="Close file"
        onConfirm={() => {
          setConfirmDelete(false);
          toast.success("Case file closed", { description: record.caseNumber });
        }}
      />

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Gavel className="size-3.5" /> Privileged material — do not disclose without client
        instruction.
      </div>
    </div>
  );
}
