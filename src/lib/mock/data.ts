import type {
  ActivityItem,
  AppNotification,
  CaseCategory,
  CaseDocument,
  CaseOutcome,
  CaseRecord,
  CaseStatus,
  Client,
  Deadline,
  Hearing,
  Lawyer,
  Priority,
  TimelineEvent,
} from "../types";
import { CASE_CATEGORIES, DOCUMENT_TYPES } from "../types";

/** Deterministic PRNG so mock data is stable between server and client renders. */
function makeRandom(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
const rnd = makeRandom(20260811);
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rnd() * arr.length)]!;
const int = (min: number, max: number) => min + Math.floor(rnd() * (max - min + 1));

const BASE = new Date("2026-08-11T09:00:00.000Z").getTime();
const DAY = 86_400_000;
const iso = (offsetDays: number) => new Date(BASE + offsetDays * DAY).toISOString();

export const lawyers: Lawyer[] = [
  {
    id: "lw-001",
    name: "Barrister Ahmed Musa",
    title: "Senior Associate",
    role: "Lead Counsel",
    specialization: "Commercial & Corporate Litigation",
    email: "a.musa@haldane-partners.law",
    phone: "+234 802 441 7788",
    barNumber: "BAR/2013/044821",
    licenseNumber: "LIC-NG-98241",
    firm: "Haldane & Partners LLP",
    officeAddress: "14 Marina Chambers, 3rd Floor, Lagos Island, Lagos",
    yearsExperience: 13,
    practiceAreas: [
      "Commercial Law",
      "Corporate Law",
      "Contract Disputes",
      "Employment Law",
      "Civil Law",
    ],
    bio: "Ahmed Musa is a senior associate at Haldane & Partners with thirteen years of courtroom practice across commercial, corporate and civil litigation. He has led trial teams in high-value contractual disputes, advised boards on regulatory exposure, and appeared before the Federal High Court and the Court of Appeal.",
  },
  {
    id: "lw-002",
    name: "Barrister Zainab Okonkwo",
    title: "Partner",
    role: "Supervising Partner",
    specialization: "Family & Property Law",
    email: "z.okonkwo@haldane-partners.law",
    phone: "+234 803 118 2290",
    barNumber: "BAR/2006/019903",
    licenseNumber: "LIC-NG-55120",
    firm: "Haldane & Partners LLP",
    officeAddress: "14 Marina Chambers, 3rd Floor, Lagos Island, Lagos",
    yearsExperience: 20,
    practiceAreas: ["Family Law", "Property Law", "Civil Law"],
    bio: "Zainab Okonkwo leads the firm's private client practice.",
  },
  {
    id: "lw-003",
    name: "Barrister Tunde Adeyemi",
    title: "Associate",
    role: "Junior Counsel",
    specialization: "Criminal Defence",
    email: "t.adeyemi@haldane-partners.law",
    phone: "+234 809 552 3311",
    barNumber: "BAR/2018/077412",
    licenseNumber: "LIC-NG-71204",
    firm: "Haldane & Partners LLP",
    officeAddress: "14 Marina Chambers, 3rd Floor, Lagos Island, Lagos",
    yearsExperience: 8,
    practiceAreas: ["Criminal Law", "Constitutional Law"],
    bio: "Tunde Adeyemi defends complex criminal matters at first instance and on appeal.",
  },
  {
    id: "lw-004",
    name: "Barrister Grace Nwachukwu",
    title: "Senior Associate",
    role: "Co-Counsel",
    specialization: "Intellectual Property & Tax",
    email: "g.nwachukwu@haldane-partners.law",
    phone: "+234 806 900 4412",
    barNumber: "BAR/2012/040112",
    licenseNumber: "LIC-NG-64330",
    firm: "Haldane & Partners LLP",
    officeAddress: "14 Marina Chambers, 3rd Floor, Lagos Island, Lagos",
    yearsExperience: 14,
    practiceAreas: ["Intellectual Property", "Tax Law", "Commercial Law"],
    bio: "Grace Nwachukwu advises on IP portfolios and contentious tax assessments.",
  },
];

export const CURRENT_LAWYER_ID = "lw-001";

const clientSeeds: Array<[string, Client["type"], string]> = [
  ["Meridian Logistics Ltd", "Corporate", "9 Ijora Causeway, Apapa, Lagos"],
  ["Adaeze Obi", "Individual", "22 Awolowo Road, Ikoyi, Lagos"],
  ["Northbridge Energy Plc", "Corporate", "Plot 44 Central Business District, Abuja"],
  ["Kola Ibrahim", "Individual", "5B Rumuola Road, Port Harcourt"],
  ["Sahel Microfinance Bank", "Corporate", "18 Ahmadu Bello Way, Kaduna"],
  ["Foundation for Civic Trust", "Non-Profit", "31 Herbert Macaulay Way, Yaba, Lagos"],
  ["Chidera Eze", "Individual", "7 Nnamdi Azikiwe Street, Enugu"],
  ["Harcourt Textiles Ltd", "Corporate", "12 Aba Road, Port Harcourt"],
  ["Ministry of Urban Works", "Government", "Secretariat Complex, Alausa, Ikeja"],
  ["Bilal Sanni", "Individual", "40 Ring Road, Ibadan"],
  ["Verdant Agro Holdings", "Corporate", "KM 8 Ilorin–Jebba Road, Ilorin"],
  ["Ngozi Balogun", "Individual", "3 Isaac John Street, GRA Ikeja"],
];

export const clients: Client[] = clientSeeds.map(([name, type, address], i) => ({
  id: `cl-${String(i + 1).padStart(3, "0")}`,
  clientId: `CLT-${2019 + (i % 7)}-${String(1040 + i * 13)}`,
  name,
  type,
  phone: `+234 8${int(0, 9)}${int(0, 9)} ${int(100, 999)} ${int(1000, 9999)}`,
  email: `${name.toLowerCase().replace(/[^a-z]+/g, ".").replace(/^\.|\.$/g, "")}@mail.com`,
  address,
  since: iso(-int(400, 2200)),
  notes:
    type === "Corporate"
      ? "Retainer client. Board resolutions required before settlement authority."
      : "Private client. Prefers correspondence by email.",
  lastActivity: iso(-int(0, 30)),
}));

const courts = [
  ["Federal High Court", "Lagos Judicial Division", "Hon. Justice E. Adebayo"],
  ["Lagos State High Court", "Ikeja Division", "Hon. Justice M. Coker"],
  ["National Industrial Court", "Abuja Division", "Hon. Justice P. Danjuma"],
  ["Court of Appeal", "Lagos Division", "Hon. Justice R. Okafor"],
  ["Magistrate Court", "Yaba Magisterial District", "His Worship S. Bello"],
  ["Supreme Court", "Abuja", "Hon. Justice A. Ogundipe"],
] as const;

const titles: Array<[string, CaseCategory]> = [
  ["Breach of Distribution Agreement", "Contract Disputes"],
  ["Unlawful Termination of Employment", "Employment Law"],
  ["Recovery of Premises", "Property Law"],
  ["Shareholders' Oppression Petition", "Corporate Law"],
  ["Trademark Infringement Action", "Intellectual Property"],
  ["Assessment Appeal on Company Income Tax", "Tax Law"],
  ["Enforcement of Fundamental Rights", "Constitutional Law"],
  ["Defamation and Injurious Falsehood", "Civil Law"],
  ["Custody and Maintenance Application", "Family Law"],
  ["Charge of Obtaining by False Pretence", "Criminal Law"],
  ["Negligence Claim Arising from Road Accident", "Personal Injury"],
  ["Debt Recovery under Credit Facility", "Commercial Law"],
  ["Specific Performance of Sale of Land", "Property Law"],
  ["Judicial Review of Contract Award", "Constitutional Law"],
  ["Winding-up Petition", "Corporate Law"],
  ["Wrongful Dismissal and Terminal Benefits", "Employment Law"],
];

const statusToOutcome: Record<CaseStatus, CaseOutcome> = {
  Active: "Pending",
  Pending: "Pending",
  "Hearing Scheduled": "Pending",
  "Under Review": "Pending",
  Appealed: "Pending",
  Stayed: "Pending",
  Settled: "Settled",
  Won: "Won",
  Lost: "Lost",
  Dismissed: "Dismissed",
  Withdrawn: "Withdrawn",
  Closed: "Won",
};

const statusPool: CaseStatus[] = [
  "Active",
  "Active",
  "Active",
  "Pending",
  "Pending",
  "Hearing Scheduled",
  "Hearing Scheduled",
  "Under Review",
  "Won",
  "Won",
  "Won",
  "Won",
  "Won",
  "Won",
  "Won",
  "Lost",
  "Lost",
  "Lost",
  "Settled",
  "Settled",
  "Settled",
  "Dismissed",
  "Withdrawn",
  "Closed",
  "Appealed",
  "Appealed",
  "Stayed",
];

const priorities: Priority[] = ["Low", "Medium", "High", "Critical"];
const opposing: Array<[string, string, string]> = [
  ["Delta Freight Systems Ltd", "Chief Bola Ransome, SAN", "Delta Freight Systems Ltd"],
  ["Mr. Emeka Uzo", "T. Salami & Co.", "—"],
  ["Crestview Properties Ltd", "Ajayi Legal Practitioners", "Crestview Properties Ltd"],
  ["Federal Inland Revenue Service", "FIRS Legal Department", "FIRS"],
  ["Zenith Media Group", "Okoro, Bassey & Partners", "Zenith Media Group"],
  ["The State", "Directorate of Public Prosecutions", "Lagos State Government"],
  ["Ms. Halima Yusuf", "Yusuf Chambers", "—"],
  ["Pinnacle Bank Plc", "In-house Litigation Unit", "Pinnacle Bank Plc"],
];

const timelineSteps: Array<[string, string]> = [
  ["Case Created", "Matter opened in the firm's register and conflict check cleared."],
  ["Initial Consultation", "Client interviewed; instructions and fee arrangement confirmed."],
  ["Case Filed", "Originating process filed and served on the opposing party."],
  ["First Hearing", "Matter mentioned in open court; hearing dates allocated."],
  ["Evidence Submitted", "Documentary exhibits front-loaded and served."],
  ["Witness Examination", "Witnesses examined in chief and cross-examined."],
  ["Final Arguments", "Written addresses adopted by both counsel."],
  ["Judgment", "Court delivered judgment in the matter."],
  ["Case Closed", "File reviewed, billed and archived."],
];

function buildTimeline(openedOffset: number, steps: number, lawyer: string): TimelineEvent[] {
  return timelineSteps.slice(0, steps).map((step, i) => ({
    id: `tl-${i}`,
    date: iso(openedOffset + i * int(18, 42)),
    title: step[0],
    description: step[1],
    createdBy: lawyer,
    documents: i % 2 === 0 ? [] : [`${step[0].toLowerCase().replace(/\s+/g, "-")}-bundle.pdf`],
  }));
}

export const cases: CaseRecord[] = Array.from({ length: 54 }, (_, i) => {
  const [title, category] = titles[i % titles.length]!;
  const status = statusPool[i % statusPool.length]!;
  const outcome = statusToOutcome[status];
  const openedOffset = -int(60, 1500);
  const court = courts[i % courts.length]!;
  const opp = opposing[i % opposing.length]!;
  const client = clients[i % clients.length]!;
  const isOpen = outcome === "Pending";
  const lead = i % 5 === 0 ? pick(lawyers).id : CURRENT_LAWYER_ID;
  const team = Array.from(new Set([lead, CURRENT_LAWYER_ID, pick(lawyers).id]));
  const steps = isOpen ? int(3, 6) : 9;

  return {
    id: `cs-${String(i + 1).padStart(3, "0")}`,
    caseNumber: `${court[0].startsWith("Federal") ? "FHC" : court[0].startsWith("Court of Appeal") ? "CA" : court[0].startsWith("Supreme") ? "SC" : "LD"}/${1200 + i * 7}/${2019 + (i % 7)}`,
    title: `${client.name.split(" ")[0] ?? client.name} v. ${opp[0].split(" ")[0]} — ${title}`,
    description: `${title} arising from a dispute between ${client.name} and ${opp[0]}. The client seeks declaratory relief, damages and costs. Counsel has advised on the merits, the available defences, and the prospects of an early resolution.`,
    clientId: client.id,
    opposingParty: {
      name: opp[0],
      contact: `+234 80${int(1, 9)} ${int(100, 999)} ${int(1000, 9999)}`,
      counsel: opp[1],
      organization: opp[2],
    },
    court: court[0],
    courtLocation: court[1],
    judge: court[2],
    category,
    dateFiled: iso(openedOffset - int(5, 30)),
    dateOpened: iso(openedOffset),
    updatedAt: iso(-int(0, 45)),
    closedAt: isOpen ? undefined : iso(openedOffset + int(200, 900)),
    nextHearing: isOpen ? iso(int(1, 60)) : undefined,
    status,
    outcome,
    outcomeSummary: isOpen
      ? undefined
      : outcome === "Won"
        ? "Judgment entered in favour of the client with costs awarded."
        : outcome === "Lost"
          ? "Claim dismissed on the merits; advice on appeal prospects delivered."
          : outcome === "Settled"
            ? "Terms of settlement filed and entered as consent judgment."
            : outcome === "Dismissed"
              ? "Suit struck out for want of jurisdiction."
              : "Notice of discontinuance filed on the client's instructions.",
    priority: priorities[i % priorities.length]!,
    lawyerIds: team,
    leadLawyerId: lead,
    timeline: buildTimeline(openedOffset, steps, lawyers.find((l) => l.id === lead)!.name),
  };
});

export const hearings: Hearing[] = cases
  .filter((c) => c.nextHearing)
  .flatMap((c, i) => {
    const types = ["Mention", "Motion Hearing", "Trial", "Judgment", "Pre-trial Conference"];
    return [
      {
        id: `hr-${c.id}-a`,
        caseId: c.id,
        date: c.nextHearing!,
        time: `${String(9 + (i % 5)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`,
        type: types[i % types.length]!,
        court: c.court,
        judge: c.judge,
        location: `${c.courtLocation}, Court Room ${1 + (i % 8)}`,
        lawyerId: c.leadLawyerId,
        status: "Scheduled" as const,
        notes: "Counsel to attend with the certified true copy of the record.",
      },
      {
        id: `hr-${c.id}-b`,
        caseId: c.id,
        date: iso(-int(10, 120)),
        time: "10:00",
        type: types[(i + 2) % types.length]!,
        court: c.court,
        judge: c.judge,
        location: `${c.courtLocation}, Court Room ${1 + (i % 8)}`,
        lawyerId: c.leadLawyerId,
        status: (i % 4 === 0 ? "Adjourned" : "Completed") as Hearing["status"],
        notes: "Matter adjourned for continuation of cross-examination.",
      },
    ];
  });

export const documents: CaseDocument[] = cases.flatMap((c, i) =>
  Array.from({ length: int(2, 4) }, (_, j) => {
    const type = DOCUMENT_TYPES[(i + j) % DOCUMENT_TYPES.length]!;
    return {
      id: `doc-${c.id}-${j}`,
      name: `${c.caseNumber.replace(/\//g, "-")}_${type.replace(/\s+/g, "-").toLowerCase()}_v${j + 1}.pdf`,
      type,
      caseId: c.id,
      uploadedBy: lawyers.find((l) => l.id === c.leadLawyerId)!.name,
      uploadedAt: iso(-int(1, 400)),
      sizeKb: int(90, 8600),
      version: j + 1,
    };
  }),
);

export const activities: ActivityItem[] = cases.slice(0, 14).map((c, i) => ({
  id: `act-${i}`,
  kind: (["case", "document", "hearing", "client"] as const)[i % 4]!,
  title:
    i % 4 === 0
      ? `Status updated to ${c.status}`
      : i % 4 === 1
        ? "New document uploaded"
        : i % 4 === 2
          ? "Hearing date allocated"
          : "Client correspondence logged",
  detail: `${c.caseNumber} — ${c.title}`,
  at: iso(-i * 0.6),
  caseId: c.id,
}));

export const notifications: AppNotification[] = cases.slice(0, 11).map((c, i) => {
  const kinds: AppNotification["kind"][] = [
    "hearing",
    "assignment",
    "status",
    "document",
    "deadline",
    "client",
    "court",
  ];
  const kind = kinds[i % kinds.length]!;
  const copy: Record<AppNotification["kind"], [string, string]> = {
    hearing: ["Upcoming hearing", `Hearing listed for ${c.caseNumber} in ${c.court}.`],
    assignment: ["New case assignment", `You have been assigned to ${c.caseNumber}.`],
    status: ["Case status changed", `${c.caseNumber} moved to ${c.status}.`],
    document: ["New document filed", `A new exhibit bundle was added to ${c.caseNumber}.`],
    deadline: ["Deadline approaching", `Written address due for ${c.caseNumber}.`],
    client: ["Client update", `Client left instructions on ${c.caseNumber}.`],
    court: ["Court update", `${c.court} published a revised cause list.`],
  };
  return {
    id: `ntf-${i}`,
    kind,
    title: copy[kind][0],
    detail: copy[kind][1],
    at: iso(-i * 0.35),
    read: i > 4,
    caseId: c.id,
  };
});

export const deadlines: Deadline[] = cases
  .filter((c) => c.nextHearing)
  .slice(0, 6)
  .map((c, i) => ({
    id: `dl-${i}`,
    title: [
      "File written address",
      "Serve list of witnesses",
      "Respond to notice to produce",
      "File counter-affidavit",
      "Settle record of appeal",
      "Renew injunction application",
    ][i]!,
    caseId: c.id,
    due: iso(i * 2 + 1),
    severity: i < 2 ? "urgent" : "normal",
  }));

export const CATEGORIES = CASE_CATEGORIES;
