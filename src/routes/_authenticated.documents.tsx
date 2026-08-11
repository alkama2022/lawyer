import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Download, Eye, FileText, MoreHorizontal, Search, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState, PageHeader, TableSkeleton } from "@/components/common/page";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { casesApi, documentsApi } from "@/lib/api";
import { DOCUMENT_TYPES } from "@/lib/types";
import { fmtDate, fmtSize } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/documents")({
  head: () => ({
    meta: [
      { title: "Case Documents — Lexfolio" },
      {
        name: "description",
        content: "Court filings, evidence, judgments and correspondence held against your matters.",
      },
      { property: "og:title", content: "Case Documents — Lexfolio" },
      {
        property: "og:description",
        content: "Court filings, evidence, judgments and correspondence for your matters.",
      },
    ],
  }),
  component: DocumentsPage,
});

function DocumentsPage() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const { data: docs, isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: () => documentsApi.list(),
  });
  const { data: cases } = useQuery({ queryKey: ["cases", {}], queryFn: () => casesApi.list({}) });

  const rows = (docs ?? [])
    .filter((d) => (type === "all" ? true : d.type === type))
    .filter((d) => d.name.toLowerCase().includes(q.toLowerCase()))
    .slice(0, 60);

  return (
    <div className="space-y-6">
      <PageHeader
        crumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Documents" }]}
        eyebrow="Document vault"
        title="Case documents"
        description="Secure repository of every document filed or received on your matters."
        actions={
          <Button size="sm" onClick={() => toast.info("Secure upload opens here")}>
            <Upload className="size-4" /> Upload document
          </Button>
        }
      />

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[16rem] flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search documents" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {DOCUMENT_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <section className="surface-card overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={8} cols={5} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<FileText className="size-5" />}
            title="No documents available for your cases."
            description="Uploaded filings, evidence and judgments will be listed here."
          />
        ) : (
          <div className="w-full overflow-x-auto">
            <Table className="min-w-[58rem]">
              <TableHeader>
                <TableRow className="bg-secondary/60 hover:bg-secondary/60">
                  <TableHead>Document</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Related case</TableHead>
                  <TableHead>Uploaded by</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((d) => {
                  const c = (cases ?? []).find((k) => k.id === d.caseId);
                  return (
                    <TableRow key={d.id}>
                      <TableCell className="max-w-[20rem] truncate font-medium">{d.name}</TableCell>
                      <TableCell className="whitespace-nowrap">{d.type}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {c ? (
                          <Link to="/cases/$caseId" params={{ caseId: c.id }} className="hover:underline">
                            {c.caseNumber}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{d.uploadedBy}</TableCell>
                      <TableCell className="whitespace-nowrap">{fmtDate(d.uploadedAt)}</TableCell>
                      <TableCell>{fmtSize(d.sizeKb)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Document actions">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => toast.info("Secure viewer opens here")}>
                              <Eye className="size-4" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.success("Download started")}>
                              <Download className="size-4" /> Download
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.info("Upload new version")}>
                              <Upload className="size-4" /> Upload new version
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setPendingDelete(d.id)}
                            >
                              <Trash2 className="size-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(v) => !v && setPendingDelete(null)}
        title="Delete this document?"
        description="The document will be removed from the case file. Deletions are logged and cannot be undone."
        confirmLabel="Delete document"
        onConfirm={() => {
          setPendingDelete(null);
          toast.success("Document deleted");
        }}
      />
    </div>
  );
}
