/**
 * API service layer.
 *
 * Every screen talks to this module only — never to the mock data directly.
 * To connect a real REST backend, replace the bodies of these functions with
 * `http()` calls (see `request` below) and delete the `./mock/data` import.
 */
import {
  CURRENT_LAWYER_ID,
  activities,
  cases,
  clients,
  deadlines,
  documents,
  hearings,
  lawyers,
  notifications,
} from "./mock/data";
import type {
  ActivityItem,
  AppNotification,
  CaseDocument,
  CaseRecord,
  Client,
  Deadline,
  Hearing,
  Lawyer,
} from "./types";

export const API_BASE_URL = "/api";

/** Thin fetch wrapper the mock layer can be swapped for. */
export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return (await res.json()) as T;
}

const latency = () => new Promise((r) => setTimeout(r, 220));
async function ok<T>(value: T): Promise<T> {
  await latency();
  return value;
}

export interface CaseFilters {
  q?: string;
  client?: string;
  opposing?: string;
  status?: string;
  outcome?: string;
  court?: string;
  category?: string;
  lawyerId?: string;
  from?: string;
  to?: string;
  sort?: string;
  mine?: boolean;
}

export const casesApi = {
  list: (filters: CaseFilters = {}) => ok(applyFilters(cases, filters)),
  get: (id: string) => ok(cases.find((c) => c.id === id) ?? null),
  courts: () => ok([...new Set(cases.map((c) => c.court))].sort()),
};

export function applyFilters(source: CaseRecord[], f: CaseFilters): CaseRecord[] {
  const q = f.q?.trim().toLowerCase();
  let out = source.filter((c) => {
    if (f.mine && !c.lawyerIds.includes(CURRENT_LAWYER_ID)) return false;
    if (f.status && f.status !== "all" && c.status !== f.status) return false;
    if (f.outcome && f.outcome !== "all" && c.outcome !== f.outcome) return false;
    if (f.court && f.court !== "all" && c.court !== f.court) return false;
    if (f.category && f.category !== "all" && c.category !== f.category) return false;
    if (f.lawyerId && f.lawyerId !== "all" && !c.lawyerIds.includes(f.lawyerId)) return false;
    if (f.from && new Date(c.dateOpened) < new Date(f.from)) return false;
    if (f.to && new Date(c.dateOpened) > new Date(f.to)) return false;
    if (f.client) {
      const name = clientName(c.clientId).toLowerCase();
      if (!name.includes(f.client.toLowerCase())) return false;
    }
    if (f.opposing && !c.opposingParty.name.toLowerCase().includes(f.opposing.toLowerCase()))
      return false;
    if (q) {
      const hay =
        `${c.caseNumber} ${c.title} ${clientName(c.clientId)} ${c.opposingParty.name} ${c.court} ${c.category}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const sorters: Record<string, (a: CaseRecord, b: CaseRecord) => number> = {
    updated: (a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt),
    newest: (a, b) => +new Date(b.dateOpened) - +new Date(a.dateOpened),
    oldest: (a, b) => +new Date(a.dateOpened) - +new Date(b.dateOpened),
    hearing: (a, b) =>
      (a.nextHearing ? +new Date(a.nextHearing) : Infinity) -
      (b.nextHearing ? +new Date(b.nextHearing) : Infinity),
    status: (a, b) => a.status.localeCompare(b.status),
    outcome: (a, b) => a.outcome.localeCompare(b.outcome),
  };
  out = [...out].sort(sorters[f.sort ?? "updated"] ?? sorters["updated"]!);
  return out;
}

export function clientName(clientId: string) {
  return clients.find((c) => c.id === clientId)?.name ?? "Unknown client";
}

export function lawyerName(id: string) {
  return lawyers.find((l) => l.id === id)?.name ?? "Unassigned";
}

export const clientsApi = {
  list: () => ok(clients),
  get: (id: string) => ok(clients.find((c) => c.id === id) ?? null),
  casesFor: (clientId: string) => ok(cases.filter((c) => c.clientId === clientId)),
};

export const hearingsApi = {
  list: () => ok([...hearings].sort((a, b) => +new Date(a.date) - +new Date(b.date))),
  upcoming: (limit = 5) =>
    ok(
      hearings
        .filter((h) => h.status === "Scheduled" && new Date(h.date) >= new Date())
        .sort((a, b) => +new Date(a.date) - +new Date(b.date))
        .slice(0, limit),
    ),
  forCase: (caseId: string) => ok(hearings.filter((h) => h.caseId === caseId)),
};

export const documentsApi = {
  list: () => ok([...documents].sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt))),
  forCase: (caseId: string) => ok(documents.filter((d) => d.caseId === caseId)),
};

export const lawyersApi = {
  list: () => ok(lawyers),
  get: (id: string) => ok(lawyers.find((l) => l.id === id) ?? null),
  me: () => ok(lawyers.find((l) => l.id === CURRENT_LAWYER_ID)!),
};

export const notificationsApi = {
  list: () => ok(notifications),
  activity: () => ok(activities),
  deadlines: () => ok(deadlines),
};

export interface CaseStats {
  total: number;
  active: number;
  won: number;
  lost: number;
  pending: number;
  closed: number;
  withdrawn: number;
  appealed: number;
  settled: number;
  dismissed: number;
  successRate: number;
  avgDurationDays: number;
}

export function computeStats(list: CaseRecord[]): CaseStats {
  const by = (fn: (c: CaseRecord) => boolean) => list.filter(fn).length;
  const won = by((c) => c.outcome === "Won");
  const lost = by((c) => c.outcome === "Lost");
  const settled = by((c) => c.outcome === "Settled");
  const dismissed = by((c) => c.outcome === "Dismissed");
  const withdrawn = by((c) => c.outcome === "Withdrawn");
  const decided = won + lost + settled + dismissed;
  const closedCases = list.filter((c) => c.closedAt);
  const avg =
    closedCases.length === 0
      ? 0
      : Math.round(
          closedCases.reduce(
            (sum, c) => sum + (+new Date(c.closedAt!) - +new Date(c.dateOpened)) / 86_400_000,
            0,
          ) / closedCases.length,
        );

  return {
    total: list.length,
    active: by((c) => ["Active", "Hearing Scheduled", "Under Review"].includes(c.status)),
    won,
    lost,
    settled,
    dismissed,
    withdrawn,
    pending: by((c) => c.outcome === "Pending"),
    closed: by((c) => c.status === "Closed" || (!!c.closedAt && c.status !== "Appealed")),
    appealed: by((c) => c.status === "Appealed"),
    successRate: decided === 0 ? 0 : Math.round(((won + settled) / decided) * 100),
    avgDurationDays: avg,
  };
}

export const statsApi = {
  forLawyer: async (lawyerId: string) => {
    const list = cases.filter((c) => c.lawyerIds.includes(lawyerId));
    return ok(computeStats(list));
  },
};

export interface SearchResult {
  group: "Cases" | "Clients" | "Hearings" | "Documents" | "Courts";
  id: string;
  label: string;
  sub: string;
  to: string;
  params?: Record<string, string>;
}

export const searchApi = {
  query: async (term: string): Promise<SearchResult[]> => {
    const q = term.trim().toLowerCase();
    if (!q) return [];
    const results: SearchResult[] = [];
    for (const c of cases) {
      if (`${c.caseNumber} ${c.title}`.toLowerCase().includes(q))
        results.push({
          group: "Cases",
          id: c.id,
          label: c.title,
          sub: `${c.caseNumber} · ${c.court}`,
          to: "/cases/$caseId",
          params: { caseId: c.id },
        });
    }
    for (const cl of clients) {
      if (`${cl.name} ${cl.clientId}`.toLowerCase().includes(q))
        results.push({
          group: "Clients",
          id: cl.id,
          label: cl.name,
          sub: `${cl.clientId} · ${cl.type}`,
          to: "/clients/$clientId",
          params: { clientId: cl.id },
        });
    }
    for (const h of hearings.slice(0, 60)) {
      if (`${h.type} ${h.court}`.toLowerCase().includes(q))
        results.push({
          group: "Hearings",
          id: h.id,
          label: `${h.type} — ${h.court}`,
          sub: h.location,
          to: "/hearings",
        });
    }
    for (const d of documents) {
      if (d.name.toLowerCase().includes(q))
        results.push({
          group: "Documents",
          id: d.id,
          label: d.name,
          sub: d.type,
          to: "/documents",
        });
    }
    const courts = [...new Set(cases.map((c) => c.court))].filter((c) =>
      c.toLowerCase().includes(q),
    );
    for (const court of courts)
      results.push({ group: "Courts", id: court, label: court, sub: "Court", to: "/cases" });

    return ok(results.slice(0, 24));
  },
};

export type {
  CaseRecord,
  Client,
  Hearing,
  CaseDocument,
  Lawyer,
  ActivityItem,
  AppNotification,
  Deadline,
};
