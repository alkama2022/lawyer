export const CASE_STATUSES = [
  "Active",
  "Pending",
  "Hearing Scheduled",
  "Under Review",
  "Settled",
  "Won",
  "Lost",
  "Dismissed",
  "Withdrawn",
  "Closed",
  "Appealed",
  "Stayed",
] as const;
export type CaseStatus = (typeof CASE_STATUSES)[number];

export const CASE_OUTCOMES = [
  "Won",
  "Lost",
  "Settled",
  "Dismissed",
  "Withdrawn",
  "Pending",
] as const;
export type CaseOutcome = (typeof CASE_OUTCOMES)[number];

export const CASE_CATEGORIES = [
  "Criminal Law",
  "Civil Law",
  "Corporate Law",
  "Family Law",
  "Property Law",
  "Employment Law",
  "Commercial Law",
  "Constitutional Law",
  "Tax Law",
  "Intellectual Property",
  "Contract Disputes",
  "Personal Injury",
  "Other",
] as const;
export type CaseCategory = (typeof CASE_CATEGORIES)[number];

export const DOCUMENT_TYPES = [
  "Court filings",
  "Evidence",
  "Contracts",
  "Judgments",
  "Legal notices",
  "Affidavits",
  "Client documents",
  "Correspondence",
  "Agreements",
  "Other",
] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export type Priority = "Low" | "Medium" | "High" | "Critical";

export interface Lawyer {
  id: string;
  name: string;
  title: string;
  role: string;
  specialization: string;
  email: string;
  phone: string;
  avatar?: string | undefined;
  barNumber: string;
  licenseNumber: string;
  firm: string;
  officeAddress: string;
  yearsExperience: number;
  practiceAreas: string[];
  bio: string;
}

export interface Client {
  id: string;
  clientId: string;
  name: string;
  type: "Individual" | "Corporate" | "Government" | "Non-Profit";
  phone: string;
  email: string;
  address: string;
  since: string;
  notes: string;
  lastActivity: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  createdBy: string;
  documents: string[];
}

export interface CaseRecord {
  id: string;
  caseNumber: string;
  title: string;
  description: string;
  clientId: string;
  opposingParty: {
    name: string;
    contact: string;
    counsel: string;
    organization: string;
  };
  court: string;
  courtLocation: string;
  judge: string;
  category: CaseCategory;
  dateFiled: string;
  dateOpened: string;
  updatedAt: string;
  closedAt?: string | undefined;
  nextHearing?: string | undefined;
  status: CaseStatus;
  outcome: CaseOutcome;
  outcomeSummary?: string | undefined;
  priority: Priority;
  lawyerIds: string[];
  leadLawyerId: string;
  timeline: TimelineEvent[];
}

export interface Hearing {
  id: string;
  caseId: string;
  date: string;
  time: string;
  type: string;
  court: string;
  judge: string;
  location: string;
  lawyerId: string;
  status: "Scheduled" | "Completed" | "Adjourned" | "Cancelled";
  notes: string;
}

export interface CaseDocument {
  id: string;
  name: string;
  type: DocumentType;
  caseId: string;
  uploadedBy: string;
  uploadedAt: string;
  sizeKb: number;
  version: number;
}

export interface ActivityItem {
  id: string;
  kind: "case" | "document" | "hearing" | "client";
  title: string;
  detail: string;
  at: string;
  caseId?: string;
}

export interface AppNotification {
  id: string;
  kind: "hearing" | "assignment" | "status" | "document" | "deadline" | "client" | "court";
  title: string;
  detail: string;
  at: string;
  read: boolean;
  caseId?: string;
}

export interface Deadline {
  id: string;
  title: string;
  caseId: string;
  due: string;
  severity: "normal" | "urgent";
}
