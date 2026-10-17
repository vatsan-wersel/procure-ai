// Prototype data — replace with the AI-generated evaluation for the event.
// Consistent with mockDocuments.ts (SE-1051 Marine Logistics Framework).

export const estimate = 2_200_000;

export type EvalVendor = { id: string; name: string; bid: number };

export const evalVendors: EvalVendor[] = [
  { id: "aker", name: "Aker Marine Services", bid: 2_080_000 },
  { id: "atlas", name: "Atlas Offshore Supply", bid: 2_310_000 },
  { id: "bluewave", name: "BlueWave Logistics", bid: 1_740_000 },
];

export const recommendedId = "aker";

/** Every criterion score is derived from item-level points (see scoreGroups). */
export type Criterion = { key: string; name: string; weight: number; basis: string };

export const criteria: Criterion[] = [
  { key: "tech", name: "Technical compliance", weight: 40, basis: "Requirement responses, vessel specs, OCR-read drawings" },
  { key: "comm", name: "Commercial offer", weight: 35, basis: "Lowest bid ÷ bid × 100" },
  { key: "hse", name: "HSE and quality record", weight: 15, basis: "Certificates, incident rates, audit history" },
  { key: "local", name: "Local content", weight: 10, basis: "Local crew and port-services commitment" },
];

const lowestBid = Math.min(...evalVendors.map((v) => v.bid));

export type Scored = EvalVendor & {
  scores: Record<string, number>;
  /** Weighted points per criterion, rounded to 1 decimal; `total` is their sum. */
  points: Record<string, number>;
  total: number;
  deltaVsEstimate: number;
  rank: number;
  mandatoryMisses: number;
};

export type Status = "Compliant" | "Partial" | "Non-compliant";

export type Requirement = {
  id: string;
  text: string;
  responses: Record<string, { status: Status; note: string }>;
};

export const requirements: Requirement[] = [
  {
    id: "R1",
    text: "Valid ISO 9001 and ISO 14001 certification",
    responses: {
      aker: { status: "Compliant", note: "ISO 9001, 14001, 45001 attached" },
      atlas: { status: "Compliant", note: "Both certificates valid to 2028" },
      bluewave: { status: "Partial", note: "ISO 9001 only; 14001 in progress" },
    },
  },
  {
    id: "R2",
    text: "Minimum 5 years of offshore supply experience",
    responses: {
      aker: { status: "Compliant", note: "12 years" },
      atlas: { status: "Compliant", note: "9 years" },
      bluewave: { status: "Compliant", note: "7 years" },
    },
  },
  {
    id: "R3",
    text: "Fleet of at least 4 vessels with DP2 capability",
    responses: {
      aker: { status: "Compliant", note: "7 DP2 vessels, 5 offered" },
      atlas: { status: "Compliant", note: "6 DP2 vessels, 4 offered" },
      bluewave: { status: "Non-compliant", note: "2 of 4 vessels DP2; upgrade proposed for Q2 2027" },
    },
  },
  {
    id: "R4",
    text: "24/7 operations desk with 2-hour response",
    responses: {
      aker: { status: "Compliant", note: "24/7, 1-hour response" },
      atlas: { status: "Partial", note: "24/7 desk, 3-hour response overnight" },
      bluewave: { status: "Non-compliant", note: "Staffed 06:00–22:00; on-call overnight, 4-hour response" },
    },
  },
  {
    id: "R5",
    text: "Local content plan for crew and port services",
    responses: {
      aker: { status: "Compliant", note: "62% local crew commitment" },
      atlas: { status: "Compliant", note: "45% local crew commitment" },
      bluewave: { status: "Compliant", note: "38% local crew commitment" },
    },
  },
  {
    id: "R6",
    text: "All offered vessels hold DNV or equivalent class",
    responses: {
      aker: { status: "Compliant", note: "DNV 1A1 certificates (Annex A)" },
      atlas: { status: "Compliant", note: "DNV and ABS" },
      bluewave: { status: "Partial", note: "Class certificate missing for 1 vessel" },
    },
  },
  {
    id: "R7",
    text: "LTIFR of 0.5 or lower over the last 3 years",
    responses: {
      aker: { status: "Compliant", note: "0.21" },
      atlas: { status: "Compliant", note: "0.38" },
      bluewave: { status: "Non-compliant", note: "0.74 in 2025" },
    },
  },
  {
    id: "R8",
    text: "P&I and liability insurance of USD 50M or more",
    responses: {
      aker: { status: "Compliant", note: "USD 100M" },
      atlas: { status: "Compliant", note: "USD 75M" },
      bluewave: { status: "Partial", note: "USD 30M; top-up offered at extra cost" },
    },
  },
  {
    id: "R9",
    text: "Annual emissions reporting for operated vessels",
    responses: {
      aker: { status: "Compliant", note: "IMO DCS reports supplied" },
      atlas: { status: "Partial", note: "Reports for 2 of 4 vessels" },
      bluewave: { status: "Partial", note: "Not supplied; offered post-award" },
    },
  },
  {
    id: "R10",
    text: "Parent company guarantee",
    responses: {
      aker: { status: "Compliant", note: "Signed guarantee included" },
      atlas: { status: "Compliant", note: "Signed guarantee included" },
      bluewave: { status: "Non-compliant", note: "Not offered; bank guarantee proposed instead" },
    },
  },
];

export type ItemCell = { pts: number; note: string; status?: Status };
export type ScoreItem = { id: string; label: string; method: string; cells: Record<string, ItemCell> };
export type ScoreGroup = Criterion & {
  items: ScoreItem[];
  adjustments?: Record<string, { pts: number; reason: string }>;
};

const statusPts: Record<Status, number> = { Compliant: 100, Partial: 50, "Non-compliant": 0 };
const STATUS_METHOD = "Compliant 100 · Partial 50 · Non-compliant 0";
const cellsFor = (f: (vendorId: string) => ItemCell) => Object.fromEntries(evalVendors.map((v) => [v.id, f(v.id)]));

const reqItem = (id: string): ScoreItem => {
  const r = requirements.find((x) => x.id === id)!;
  return {
    id,
    label: r.text,
    method: STATUS_METHOD,
    cells: cellsFor((v) => ({ pts: statusPts[r.responses[v].status], note: r.responses[v].note, status: r.responses[v].status })),
  };
};

const priceItem: ScoreItem = {
  id: "Price",
  label: "Total bid price",
  method: "Lowest bid ÷ bid × 100",
  cells: cellsFor((v) => {
    const bid = evalVendors.find((x) => x.id === v)!.bid;
    return { pts: Math.round((lowestBid / bid) * 100), note: `$${(bid / 1_000_000).toFixed(2)}M total bid` };
  }),
};

const auditItem: ScoreItem = {
  id: "Audit",
  label: "Incident and audit history",
  method: "Assessed from audit reports, 0 to 100",
  cells: {
    aker: { pts: 90, note: "No major findings in the last 3 audits" },
    atlas: { pts: 80, note: "2 minor findings, both closed" },
    bluewave: { pts: 60, note: "1 major finding open since 2025" },
  },
};

const localItem: ScoreItem = {
  id: "R5",
  label: "Local content plan for crew and port services",
  method: "Local crew share ÷ 70% target × 100, capped at 100",
  cells: cellsFor((v) => {
    const note = requirements.find((x) => x.id === "R5")!.responses[v].note;
    const pct = Number(/(\d+)%/.exec(note)![1]);
    return { pts: Math.min(100, Math.round((pct / 70) * 100)), note, status: requirements.find((x) => x.id === "R5")!.responses[v].status };
  }),
};

export const scoreGroups: ScoreGroup[] = criteria.map((c) => ({
  ...c,
  items:
    c.key === "tech" ? ["R2", "R3", "R4", "R6", "R9"].map(reqItem)
    : c.key === "comm" ? [priceItem]
    : c.key === "hse" ? [reqItem("R1"), reqItem("R7"), auditItem]
    : [localItem],
  adjustments:
    c.key === "tech"
      ? { aker: { pts: -8, reason: "Class certificate for MV Aker Horizon expires inside the framework term" } }
      : undefined,
}));

/** Pass/fail gates: checked and flagged, but not part of the weighted score. */
export const gateItems: ScoreItem[] = ["R8", "R10"].map(reqItem);

const groupScore = (g: ScoreGroup, vendorId: string) => {
  const avg = g.items.reduce((n, i) => n + i.cells[vendorId].pts, 0) / g.items.length;
  const adj = g.adjustments?.[vendorId]?.pts ?? 0;
  return Math.max(0, Math.min(100, Math.round(avg + adj)));
};

export const scored: Scored[] = evalVendors
  .map((v) => {
    const scores: Record<string, number> = Object.fromEntries(scoreGroups.map((g) => [g.key, groupScore(g, v.id)]));
    const r1 = (n: number) => Math.round(n * 10 + 1e-6) / 10;
    const points: Record<string, number> = Object.fromEntries(criteria.map((c) => [c.key, r1((scores[c.key] * c.weight) / 100)]));
    const total = r1(Object.values(points).reduce((n, x) => n + x, 0));
    const mandatoryMisses = requirements.filter((r) => r.responses[v.id].status !== "Compliant").length;
    return { ...v, scores, points, total, deltaVsEstimate: (v.bid - estimate) / estimate, rank: 0, mandatoryMisses };
  })
  .sort((a, b) => b.total - a.total)
  .map((v, i) => ({ ...v, rank: i + 1 }));

export type Severity = "High" | "Medium" | "Low";

export type Deviation = {
  vendorId: string;
  area: string;
  tender: string;
  offered: string;
  severity: Severity;
  impact: string;
};

export const deviations: Deviation[] = [
  { vendorId: "bluewave", area: "DP2 fleet (R3)", tender: "4 DP2 vessels", offered: "2 DP2 vessels, upgrade by Q2 2027", severity: "High", impact: "Cannot cover offshore supply runs until the upgrade is delivered." },
  { vendorId: "bluewave", area: "Operations desk (R4)", tender: "24/7, 2-hour response", offered: "06:00–22:00 plus on-call, 4-hour response", severity: "High", impact: "Overnight incidents would breach the response requirement." },
  { vendorId: "bluewave", area: "Safety record (R7)", tender: "LTIFR ≤ 0.5", offered: "LTIFR 0.74", severity: "High", impact: "Above the safety threshold set by the Company's HSE standard." },
  { vendorId: "bluewave", area: "Guarantee (R10)", tender: "Parent company guarantee", offered: "Bank guarantee", severity: "Medium", impact: "Weaker recourse if the vendor defaults." },
  { vendorId: "bluewave", area: "Payment terms", tender: "Net 30", offered: "Net 45", severity: "Low", impact: "Favours the Company on cash flow; no action needed." },
  { vendorId: "atlas", area: "Operations desk (R4)", tender: "2-hour response", offered: "3-hour response overnight", severity: "Medium", impact: "Small gap; can be closed by contract clause." },
  { vendorId: "atlas", area: "Emissions reporting (R9)", tender: "All vessels", offered: "2 of 4 vessels", severity: "Low", impact: "Reports for remaining vessels can be a condition of award." },
  { vendorId: "aker", area: "Class certificate validity", tender: "Valid for the 3-year term", offered: "MV Aker Horizon expires 02 Feb 2027", severity: "Medium", impact: "Needs renewal evidence before the first call-off after expiry." },
  { vendorId: "aker", area: "Fleet offered", tender: "Minimum 4 DP2 vessels", offered: "5 of 7 fleet", severity: "Low", impact: "Exceeds the minimum; no action needed." },
];

export type RiskItem = {
  vendorId: string;
  category: "Compliance" | "Commercial" | "Operational" | "Financial" | "Document";
  risk: string;
  severity: Severity;
  mitigation: string;
};

export const risks: RiskItem[] = [
  { vendorId: "aker", category: "Compliance", risk: "Class certificate for MV Aker Horizon expires 02 Feb 2027, inside the 3-year term.", severity: "Medium", mitigation: "Make renewal evidence a condition of award and a call-off precondition." },
  { vendorId: "aker", category: "Operational", risk: "Only 5 of 7 DP2 vessels are offered, so peak demand may exceed capacity.", severity: "Low", mitigation: "Add a surge-capacity clause covering the 2 remaining vessels." },
  { vendorId: "atlas", category: "Operational", risk: "Overnight response time is 3 hours against a 2-hour requirement.", severity: "Medium", mitigation: "Contract a 2-hour overnight service level with service credits." },
  { vendorId: "bluewave", category: "Operational", risk: "Half the offered vessels lack DP2 until a planned upgrade in Q2 2027.", severity: "High", mitigation: "Do not award unless the upgrade is completed and verified before mobilisation." },
  { vendorId: "bluewave", category: "Compliance", risk: "Safety record is above the LTIFR threshold and ISO 14001 is not yet certified.", severity: "High", mitigation: "Reject on HSE grounds or require a corrective action plan with audit." },
  { vendorId: "bluewave", category: "Financial", risk: "Insurance is USD 30M against a USD 50M requirement and no parent guarantee is offered.", severity: "Medium", mitigation: "Require full insurance and a parent guarantee before award." },
  { vendorId: "bluewave", category: "Document", risk: "ISO certificate scan was read at 84% OCR confidence.", severity: "Low", mitigation: "Verify the certificate number with the issuing body." },
];

export type ComplianceCheck = { name: string; result: "Pass" | "Review" | "Fail"; detail: string };

export const complianceChecks: ComplianceCheck[] = [
  { name: "Minimum number of bids", result: "Pass", detail: "3 bids received; policy requires at least 3." },
  { name: "Sanctions and watchlist screening", result: "Pass", detail: "No matches for any bidder or parent company." },
  { name: "Conflict of interest declarations", result: "Pass", detail: "Declarations signed by all evaluators." },
  { name: "Evaluation criteria match the tender", result: "Pass", detail: "Weights used match the RFP: 40 / 35 / 15 / 10." },
  { name: "Certificate validity across the term", result: "Review", detail: "Aker class certificate expires 02 Feb 2027; renewal evidence needed." },
  { name: "Insurance meets the minimum", result: "Fail", detail: "BlueWave holds USD 30M; USD 50M is required." },
  { name: "Approval authority for the value", result: "Review", detail: "Awards above USD 1M need CPO and Finance approval." },
  { name: "Bid validity period", result: "Pass", detail: "All bids are valid for 120 days." },
];

export const money = (n: number) => `$${(n / 1_000_000).toFixed(2)}M`;

/** Why each criterion got its score, per vendor (AI-written rationale). */
export const scoreWhy: Record<string, Record<string, string>> = {
  aker: {
    tech: "Meets all 10 requirements. The vessel drawing shows 820 m² deck area, 3,200 t deadweight and 120 t bollard pull, all at or above the specification. Held back from a higher score by the certificate expiring in Feb 2027.",
    comm: "USD 2.08M is 16% above the lowest bid, so the price score is 84. It is 5.5% under the USD 2.2M estimate.",
    hse: "LTIFR 0.21 is well under the 0.5 limit, with ISO 9001, 14001 and 45001 all certified.",
    local: "62% local crew commitment is the highest of the three bids.",
  },
  atlas: {
    tech: "Meets 8 of 10 requirements. Partial on the overnight response time (3 hours vs 2) and on emissions reporting (2 of 4 vessels).",
    comm: "USD 2.31M is the highest bid and 5.0% over the estimate, so the price score is 75.",
    hse: "LTIFR 0.38 is within the limit and both ISO certificates are valid. Slightly less evidence than Aker on audit history.",
    local: "45% local crew commitment meets the requirement but is below Aker.",
  },
  bluewave: {
    tech: "Meets only 2 of 10 requirements. Non-compliant on DP2 fleet, operations desk, safety record and parent guarantee, and partial on four more.",
    comm: "USD 1.74M is the lowest bid, so it gets the full 100. This is its only top score.",
    hse: "LTIFR 0.74 is above the 0.5 limit and ISO 14001 is still in progress.",
    local: "38% local crew commitment meets the requirement but is the lowest of the three.",
  },
};
