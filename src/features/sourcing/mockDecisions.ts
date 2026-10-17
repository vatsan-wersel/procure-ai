// Prototype data — replace with the agent run log from the backend.
// Timestamps are local "YYYY-MM-DD HH:mm". Counts match mockEvaluation.ts.

export type Agent = {
  id: string;
  name: string;
  role: string;
  model: string;
};

export const agents: Agent[] = [
  { id: "extractor", name: "Requirements Extractor", role: "Reads the tender and pulls out requirements, criteria and weights", model: "claude-sonnet-5-5" },
  { id: "screener", name: "Screening Agent", role: "Screens vendors against sanctions and watchlists", model: "Rules engine + list lookup" },
  { id: "reader", name: "Document Reader", role: "Reads bid documents with OCR and vision, and flags low-confidence text", model: "OCR engine v3 + claude-sonnet-5-5 vision" },
  { id: "compliance", name: "Compliance Checker", role: "Compares each bid answer with each tender requirement", model: "claude-sonnet-5-5" },
  { id: "risk", name: "Risk Analyst", role: "Finds risks the score does not show and suggests mitigations", model: "claude-sonnet-5-5 + knowledge graph" },
  { id: "scoring", name: "Scoring Agent", role: "Scores each criterion, applies the weights and ranks the bids", model: "claude-sonnet-5-5" },
  { id: "brief", name: "Brief Writer", role: "Writes the one-page CXO brief from the evaluation", model: "claude-sonnet-5-5" },
];

export type TriggerType = "User action" | "Event" | "Agent handoff";

export type Decision = {
  id: string;
  at: string;
  agentId: string;
  /** What the agent did, as a short sentence. */
  did: string;
  /** What it concluded or produced. */
  result: string;
  trigger: { type: TriggerType; detail: string };
  inputs: string[];
  confidence: number;
  seconds: number;
  review: { status: "Reviewed" | "Auto-accepted" | "Awaiting review" | "Flagged"; note: string };
};

/** `creator` is the event owner, filled in from the event. */
export const decisions = (creator: string): Decision[] => [
  {
    id: "RUN-0007",
    at: "2026-10-16 09:02",
    agentId: "brief",
    did: "Wrote the CXO brief (version 1)",
    result: "One page: decision requested, 3 reasons, bidder comparison, 1 condition of award and next steps.",
    trigger: { type: "User action", detail: `${creator} opened the CXO brief tab` },
    inputs: ["Evaluation results", "Risk register", "Approval chain"],
    confidence: 94,
    seconds: 18,
    review: { status: "Awaiting review", note: "Goes to the CPO and Finance Director with the award request" },
  },
  {
    id: "RUN-0006",
    at: "2026-10-15 15:55",
    agentId: "scoring",
    did: "Scored and ranked 3 bids",
    result: "Aker 89.7, Atlas 78.7, BlueWave 62.0. Recommended Aker, the only bid that meets all 10 requirements.",
    trigger: { type: "Agent handoff", detail: "Risk Analyst finished (RUN-0005)" },
    inputs: ["30 requirement results", "Pricing schedules", "Local content plans", "Evaluation weights 40 / 35 / 15 / 10"],
    confidence: 92,
    seconds: 41,
    review: { status: "Reviewed", note: "Approved by Jonas Reid, Oct 15 at 04:12 PM" },
  },
  {
    id: "RUN-0005",
    at: "2026-10-15 15:48",
    agentId: "risk",
    did: "Logged 7 risks across the 3 bids",
    result: "2 high (both BlueWave), 3 medium, 2 low. One medium on the recommended bid: Aker class certificate expires 02 Feb 2027.",
    trigger: { type: "Agent handoff", detail: "Compliance Checker finished (RUN-0004)" },
    inputs: ["Compliance results", "Class and ISO certificates", "Insurance and guarantee clauses", "Knowledge graph"],
    confidence: 89,
    seconds: 36,
    review: { status: "Reviewed", note: "Accepted by Jonas Reid; renewal check added as a condition" },
  },
  {
    id: "RUN-0004",
    at: "2026-10-15 11:45",
    agentId: "compliance",
    did: "Checked 30 bid answers against 10 requirements",
    result: "20 compliant, 6 partial, 4 non-compliant. BlueWave misses 8 requirements; Aker meets all 10.",
    trigger: { type: "Agent handoff", detail: "Document Reader finished (RUN-0003)" },
    inputs: ["Requirements list", "OCR text of 5 bid documents", "Vessel drawing and class certificate (vision)"],
    confidence: 94,
    seconds: 52,
    review: { status: "Reviewed", note: "Spot-checked by Jonas Reid" },
  },
  {
    id: "RUN-0003",
    at: "2026-10-15 11:30",
    agentId: "reader",
    did: "Read 5 bid documents",
    result: "All pages read; 2 embedded images analysed. One scan (BlueWave ISO certificate) read at 84% confidence.",
    trigger: { type: "User action", detail: `${creator} started the evaluation` },
    inputs: ["Aker_Technical_Proposal.pdf", "BlueWave_Bid_Response.pdf", "BlueWave_ISO_Certificate_Scan.pdf", "2 more bid files"],
    confidence: 91,
    seconds: 64,
    review: { status: "Flagged", note: "Certificate number QMS-2291847 needs a human check against the issuer's register" },
  },
  {
    id: "RUN-0002",
    at: "2026-10-13 10:20",
    agentId: "extractor",
    did: "Extracted 10 requirements and 4 criteria from the tender",
    result: "Criteria weights 40 / 35 / 15 / 10 set as the evaluation yardstick.",
    trigger: { type: "Event", detail: "Tender documents uploaded (AUD-0003)" },
    inputs: ["RFP_Marine_Logistics_Framework.pdf", "Technical_Specification_Rev3.pdf"],
    confidence: 98,
    seconds: 27,
    review: { status: "Reviewed", note: "Approved by Priya Shah with the tender package, Oct 13 at 06:30 PM" },
  },
  {
    id: "RUN-0001",
    at: "2026-10-12 16:52",
    agentId: "screener",
    did: "Screened 3 vendors against sanctions and watchlists",
    result: "No matches for any vendor, owner or parent company.",
    trigger: { type: "Event", detail: "Vendors invited (AUD-0002)" },
    inputs: ["Vendor legal names", "Parent company records", "OFAC, UN and EU lists"],
    confidence: 99,
    seconds: 9,
    review: { status: "Auto-accepted", note: "No matches, so no human review needed" },
  },
];
