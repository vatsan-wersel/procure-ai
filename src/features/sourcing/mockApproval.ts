// Prototype data — replace with approval records and the audit trail from the backend.
// Timestamps are local "YYYY-MM-DD HH:mm".

export type ApprovalStatus = "Approved" | "Pending" | "Rejected";

export type Approval = {
  id: string;
  what: string;
  detail: string;
  approver: string;
  role: string;
  status: ApprovalStatus;
  /** When it was decided; for pending steps, when it was sent. */
  at: string;
  comment?: string;
};

export const approvals: Approval[] = [
  {
    id: "AP-1",
    what: "Tender package",
    detail: "RFP, technical specification and evaluation criteria",
    approver: "Priya Shah",
    role: "Category Manager",
    status: "Approved",
    at: "2026-10-13 18:30",
    comment: "Criteria and weights match the sourcing plan.",
  },
  {
    id: "AP-2",
    what: "Vendor shortlist",
    detail: "3 bidders invited to bid",
    approver: "Aisha Okafor",
    role: "Head of Procurement",
    status: "Approved",
    at: "2026-10-14 17:05",
    comment: "Atlas added to widen competition.",
  },
  {
    id: "AP-3",
    what: "Technical evaluation",
    detail: "Scores and compliance for all 3 bids",
    approver: "Jonas Reid",
    role: "Evaluation Committee Chair",
    status: "Approved",
    at: "2026-10-15 16:12",
    comment: "Agreed with the AI scoring. Verify the Aker certificate renewal before award.",
  },
  {
    id: "AP-4",
    what: "Award recommendation",
    detail: "Aker Marine Services at $2.08M",
    approver: "Daniel Mercer",
    role: "Chief Procurement Officer",
    status: "Pending",
    at: "2026-10-16 09:12",
  },
  {
    id: "AP-5",
    what: "Award recommendation (budget)",
    detail: "Aker Marine Services at $2.08M",
    approver: "Rina Patel",
    role: "Finance Director",
    status: "Pending",
    at: "2026-10-16 09:12",
  },
];

export type AuditCategory = "Event" | "Documents" | "Evaluation" | "Approval" | "AI";

export type AuditEntry = {
  id: string;
  at: string;
  actor: string;
  role: string;
  action: string;
  detail?: string;
  category: AuditCategory;
};

/** `creator` is the event owner, filled in from the event. */
export const auditLog = (creator: string): AuditEntry[] => [
  { id: "AUD-0014", at: "2026-10-16 09:12", actor: creator, role: "Sourcing Lead", action: "Sent the award recommendation for approval", detail: "Routed to the CPO and the Finance Director", category: "Approval" },
  { id: "AUD-0013", at: "2026-10-16 09:10", actor: creator, role: "Sourcing Lead", action: "Recorded the award recommendation", detail: "Aker Marine Services, $2.08M, score 89.7", category: "Evaluation" },
  { id: "AUD-0012", at: "2026-10-16 09:02", actor: "Brief Writer", role: "AI agent", action: "Generated the CXO brief", detail: "Version 1", category: "AI" },
  { id: "AUD-0011", at: "2026-10-15 16:12", actor: "Jonas Reid", role: "Evaluation Committee Chair", action: "Approved the technical evaluation", detail: "Comment: verify the Aker certificate renewal before award", category: "Approval" },
  { id: "AUD-0010", at: "2026-10-15 15:55", actor: "Scoring Agent", role: "AI agent", action: "Completed the evaluation of 3 bids", detail: "Aker 89.7, Atlas 78.7, BlueWave 62.0", category: "AI" },
  { id: "AUD-0009", at: "2026-10-15 15:48", actor: "Risk Analyst", role: "AI agent", action: "Logged 7 risks", detail: "2 high, 3 medium, 2 low; includes the Aker class certificate expiring 02 Feb 2027", category: "AI" },
  { id: "AUD-0008", at: "2026-10-15 11:30", actor: "Document Reader", role: "AI agent", action: "Read 5 bid documents", detail: "OCR on all pages, vision on 2 images, 1 low-confidence scan flagged", category: "Documents" },
  { id: "AUD-0007", at: "2026-10-14 17:05", actor: "Aisha Okafor", role: "Head of Procurement", action: "Approved the vendor shortlist", detail: "Comment: Atlas added to widen competition", category: "Approval" },
  { id: "AUD-0006", at: "2026-10-14 14:20", actor: creator, role: "Sourcing Lead", action: "Uploaded bid documents for BlueWave Logistics", detail: "BlueWave_Bid_Response.pdf, BlueWave_ISO_Certificate_Scan.pdf", category: "Documents" },
  { id: "AUD-0005", at: "2026-10-14 11:02", actor: creator, role: "Sourcing Lead", action: "Uploaded bid documents for Aker Marine Services", detail: "Aker_Technical_Proposal.pdf", category: "Documents" },
  { id: "AUD-0004", at: "2026-10-13 18:30", actor: "Priya Shah", role: "Category Manager", action: "Approved the tender package", detail: "Comment: criteria and weights match the sourcing plan", category: "Approval" },
  { id: "AUD-0003", at: "2026-10-13 10:15", actor: creator, role: "Sourcing Lead", action: "Uploaded tender documents", detail: "RFP_Marine_Logistics_Framework.pdf, Technical_Specification_Rev3.pdf", category: "Documents" },
  { id: "AUD-0002", at: "2026-10-12 16:48", actor: creator, role: "Sourcing Lead", action: "Invited 3 vendors", detail: "Aker Marine Services, Atlas Offshore Supply, BlueWave Logistics", category: "Event" },
  { id: "AUD-0001", at: "2026-10-12 09:05", actor: creator, role: "Sourcing Lead", action: "Created the sourcing event", detail: "Status set to Draft", category: "Event" },
];

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const fmtDate = (at: string) => {
  const [y, m, d] = at.slice(0, 10).split("-").map(Number);
  return `${months[m - 1]} ${String(d).padStart(2, "0")}, ${y}`;
};

export const fmtTime = (at: string) => {
  const [h, min] = at.slice(11).split(":").map(Number);
  return `${String(h % 12 || 12).padStart(2, "0")}:${String(min).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};
