import { events, priorities, statuses, type Priority } from "@/features/sourcing/data";
import { queue } from "@/features/sourcing/mockApprovalQueue";
import { vendorList } from "@/features/vendors/data";

// Prototype aggregation over the mock data — replace with database queries.
const TODAY = new Date("2026-10-17T09:00:00");

export function parseValue(v: string) {
  const n = parseFloat(v.replace(/[^0-9.]/g, ""));
  return v.endsWith("M") ? n * 1_000_000 : v.endsWith("K") ? n * 1_000 : n;
}

export function formatMoney(n: number) {
  return n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : `$${Math.round(n / 1_000)}K`;
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

export const pendingApprovals = queue.filter((q) => q.status === "Pending");

export function ageInDays(stamp: string) {
  return Math.floor((TODAY.getTime() - new Date(stamp.replace(" ", "T")).getTime()) / 86_400_000);
}

const levelOrder: Priority["level"][] = ["Urgent", "High", "Medium"];
export const attentionItems = [...priorities].sort(
  (a, b) => levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level),
);

// Prototype: when each attention item last changed. Replace with the real "updated at" from the event or approval.
export const attentionUpdatedAt: Record<string, string> = {
  p1: "2026-10-17T08:40:00",
  p2: "2026-10-16T19:20:00",
  p3: "2026-10-15T10:05:00",
  p4: "2026-10-14T16:30:00",
  p5: "2026-10-14T09:10:00",
  p6: "2026-10-13T11:45:00",
};
/** What a first-time visitor is treated as having seen. Anything updated after this is new. */
export const ATTENTION_BASELINE = "2026-10-16T18:00:00";

export function getKpis() {
  const active = events.filter((e) => e.status !== "Awarded");
  const awarded = events.filter((e) => e.status === "Awarded");
  const evaluating = events.filter((e) => e.status === "Evaluation");
  const approved = vendorList.filter((v) => v.status === "Approved");
  const review = vendorList.filter((v) => v.status === "Under review").length;
  const blocked = vendorList.filter((v) => v.status === "Blocked").length;
  const oldest = Math.max(0, ...pendingApprovals.map((q) => ageInDays(q.submittedAt)));
  const avgScore = sum(vendorList.map((v) => v.score)) / vendorList.length;

  return [
    { label: "Active events", value: String(active.length), sub: `${events.length} events in total` },
    { label: "Pipeline value", value: formatMoney(sum(active.map((e) => parseValue(e.value)))), sub: "Open events, not yet awarded" },
    { label: "Awarded value", value: formatMoney(sum(awarded.map((e) => parseValue(e.value)))), sub: `${awarded.length} events awarded` },
    { label: "Urgent items", value: String(priorities.filter((p) => p.level === "Urgent").length), sub: `of ${priorities.length} needing attention`, tone: "bad" as const },
    { label: "Pending approvals", value: String(pendingApprovals.length), sub: `Oldest waiting ${oldest} days`, tone: oldest >= 3 ? ("warn" as const) : undefined },
    { label: "In evaluation", value: String(evaluating.length), sub: formatMoney(sum(evaluating.map((e) => parseValue(e.value)))) + " in value" },
    { label: "Approved vendors", value: `${approved.length}/${vendorList.length}`, sub: `${review} under review · ${blocked} blocked` },
    { label: "Avg vendor score", value: avgScore.toFixed(0), sub: "Out of 100, from past events" },
  ];
}

export function getPipeline() {
  return statuses.map((s) => ({
    name: s.name,
    dot: s.dot,
    count: events.filter((e) => e.status === s.name).length,
  }));
}
