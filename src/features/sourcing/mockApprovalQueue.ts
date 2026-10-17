// Prototype data — replace with the approval inbox from the backend.
// Timestamps are local "YYYY-MM-DD HH:mm".

export type QueueStatus = "Pending" | "Approved" | "Rejected";

export type QueueItem = {
  id: string;
  /** What is being approved. */
  what: string;
  eventId: string;
  eventTitle: string;
  value: string;
  requestedBy: string;
  approver: string;
  approverRole: string;
  submittedAt: string;
  status: QueueStatus;
  decidedAt?: string;
  reason?: string;
};

/** The signed-in user; swap for the session user once approvals are backed by an API. */
export const currentApprover = "Daniel Mercer";

export const queue: QueueItem[] = [
  { id: "AP-4", what: "Award recommendation", eventId: "SE-1051", eventTitle: "Marine Logistics Framework", value: "$2.2M", requestedBy: "Leo Torres", approver: "Daniel Mercer", approverRole: "Chief Procurement Officer", submittedAt: "2026-10-16 09:12", status: "Pending" },
  { id: "AP-5", what: "Award recommendation (budget)", eventId: "SE-1051", eventTitle: "Marine Logistics Framework", value: "$2.2M", requestedBy: "Leo Torres", approver: "Rina Patel", approverRole: "Finance Director", submittedAt: "2026-10-16 09:12", status: "Pending" },
  { id: "AP-9", what: "Tender package", eventId: "SE-1048", eventTitle: "Offshore Valve Supply FY27", value: "$1.8M", requestedBy: "Maya Khan", approver: "Daniel Mercer", approverRole: "Chief Procurement Officer", submittedAt: "2026-10-15 11:05", status: "Pending" },
  { id: "AP-8", what: "Vendor shortlist", eventId: "SE-1046", eventTitle: "Core Banking Hardware Refresh", value: "$2.4M", requestedBy: "Priya Shah", approver: "Aisha Okafor", approverRole: "Head of Procurement", submittedAt: "2026-10-14 10:18", status: "Pending" },
  { id: "AP-7", what: "Tender package", eventId: "SE-1047", eventTitle: "Pipeline Inspection Services", value: "$920K", requestedBy: "Jonas Reid", approver: "Daniel Mercer", approverRole: "Chief Procurement Officer", submittedAt: "2026-10-09 15:20", status: "Approved", decidedAt: "2026-10-10 09:40", reason: "Scope and criteria are clear." },
  { id: "AP-6", what: "Award recommendation", eventId: "SE-1043", eventTitle: "Branch Security Systems Upgrade", value: "$610K", requestedBy: "Aisha Okafor", approver: "Daniel Mercer", approverRole: "Chief Procurement Officer", submittedAt: "2026-09-30 13:02", status: "Rejected", decidedAt: "2026-10-01 11:15", reason: "Top two scores are tied; re-run the commercial comparison first." },
];
