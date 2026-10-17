import { AiBrief, type BriefPoint } from "@/components/ui/AiBrief";

// Prototype copy — replace with AI-generated briefing for the event.
const points: BriefPoint[] = [
  { short: "Lowest bid misses 8 requirements", detail: "The lowest bidder does not meet 8 of the mandatory requirements, so it cannot be compared like-for-like." },
  { short: "The recommendation is not the cheapest bid", detail: "The recommended vendor scores highest overall; its price is above the lowest bid but it meets every requirement." },
  { short: "Record the award recommendation", detail: "Capture the recommendation and its rationale so approvers can review it before the award." },
];

export function EvaluationBriefing() {
  return <AiBrief title="Status brief" points={points} />;
}
