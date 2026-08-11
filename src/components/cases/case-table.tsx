import { Link } from "@tanstack/react-router";
import { Eye, MoreHorizontal, CalendarPlus, FileUp, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { OutcomeBadge, StatusBadge } from "@/components/common/badges";
import { EmptyState } from "@/components/common/page";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { clientName, lawyerName } from "@/lib/api";
import { fmtDate } from "@/lib/format";
import type { CaseRecord } from "@/lib/types";
import { Gavel } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export function CaseTable({
  cases,
  emptyTitle = "No cases assigned yet.",
  emptyDescription = "When a matter is assigned to you it will appear here with its court, status and hearing dates.",
  emptyAction,
}: {
  cases: CaseRecord[];
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
}) {
  const [pendingClose, setPendingClose] = useState<CaseRecord | null>(null);

  if (cases.length === 0) {
    return (
      <EmptyState
        icon={<Gavel className="size-5" />}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <>
      <div className="w-full overflow-x-auto">
        <Table className="min-w-[68rem]">
          <TableHeader>
            <TableRow className="bg-secondary/60 hover:bg-secondary/60">
              <TableHead>Case no.</TableHead>
              <TableHead>Case title</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Opposing party</TableHead>
              <TableHead>Court</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Opened</TableHead>
              <TableHead>Next hearing</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Outcome</TableHead>
              <TableHead>Lead counsel</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cases.map((c) => (
              <TableRow key={c.id} className="align-top">
                <TableCell className="font-mono text-xs whitespace-nowrap">
                  {c.caseNumber}
                </TableCell>
                <TableCell className="max-w-[18rem] min-w-[14rem]">
                  <Link
                    to="/cases/$caseId"
                    params={{ caseId: c.id }}
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    {c.title}
                  </Link>
                </TableCell>
                <TableCell className="whitespace-nowrap">{clientName(c.clientId)}</TableCell>
                <TableCell className="whitespace-nowrap">{c.opposingParty.name}</TableCell>
                <TableCell className="whitespace-nowrap">{c.court}</TableCell>
                <TableCell className="whitespace-nowrap">{c.category}</TableCell>
                <TableCell className="whitespace-nowrap">{fmtDate(c.dateOpened)}</TableCell>
                <TableCell className="whitespace-nowrap">{fmtDate(c.nextHearing)}</TableCell>
                <TableCell>
                  <StatusBadge status={c.status} />
                </TableCell>
                <TableCell>
                  <OutcomeBadge outcome={c.outcome} />
                </TableCell>
                <TableCell className="whitespace-nowrap">{lawyerName(c.leadLawyerId)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="Case actions">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to="/cases/$caseId" params={{ caseId: c.id }}>
                          <Eye className="size-4" /> View case
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.info("Hearing scheduler opens here")}>
                        <CalendarPlus className="size-4" /> Schedule hearing
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.info("Document upload opens here")}>
                        <FileUp className="size-4" /> Upload document
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setPendingClose(c)}
                      >
                        <Trash2 className="size-4" /> Close case file
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={!!pendingClose}
        onOpenChange={(v) => !v && setPendingClose(null)}
        title="Close this case file?"
        description={`${pendingClose?.caseNumber ?? ""} will be archived and removed from your active list. This action is recorded in the audit trail.`}
        confirmLabel="Close case file"
        onConfirm={() => {
          toast.success("Case file closed", { description: pendingClose?.caseNumber });
          setPendingClose(null);
        }}
      />
    </>
  );
}

export function CaseCardList({ cases }: { cases: CaseRecord[] }) {
  return (
    <ul className="space-y-3">
      {cases.map((c) => (
        <li key={c.id} className="surface-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-mono text-[0.7rem] text-muted-foreground">{c.caseNumber}</p>
              <Link
                to="/cases/$caseId"
                params={{ caseId: c.id }}
                className="line-clamp-2 font-medium underline-offset-4 hover:underline"
              >
                {c.title}
              </Link>
              <p className="mt-1 text-xs text-muted-foreground">
                {clientName(c.clientId)} · {c.court}
              </p>
            </div>
            <StatusBadge status={c.status} />
          </div>
        </li>
      ))}
    </ul>
  );
}
