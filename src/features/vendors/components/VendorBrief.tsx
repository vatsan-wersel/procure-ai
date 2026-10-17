import { AiBrief, type BriefPoint } from "@/components/ui/AiBrief";

// Prototype copy — replace with an AI-generated brief of the vendor base.
const points: BriefPoint[] = [
  { short: "3 vendor certificates expire within 60 days", detail: "Atlas Offshore Supply, BlueWave Logistics and Aker Marine Services need renewed documents before their next sourcing event." },
  { short: "BlueWave Logistics is under review", detail: "Its ISO 14001 is still in progress and its safety record is above the limit. It missed 8 requirements in SE-1051." },
  { short: "2 vendors have had no activity in 12 months", detail: "Consider archiving them or inviting them to a new event to keep the vendor base current." },
];

export function VendorBrief() {
  return <AiBrief title="Vendor brief" points={points} />;
}
