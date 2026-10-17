// Prototype data — replace with database queries.
export type EventStatus = "Draft" | "Pending approval" | "Evaluation" | "Awarded";

export const statuses: { name: EventStatus; dot: string }[] = [
  { name: "Draft", dot: "#8b9099" },
  { name: "Pending approval", dot: "#a35f00" },
  { name: "Evaluation", dot: "#2f6bf0" },
  { name: "Awarded", dot: "#17753a" },
];

export type SourcingEvent = {
  id: string;
  title: string;
  status: EventStatus;
  project: string;
  creator: string;
  value: string;
  updatedAt: string;
};

export const events: SourcingEvent[] = [
  { id: "SE-1051", title: "Marine Logistics Framework", status: "Pending approval", project: "Fleet & Logistics", creator: "Leo Torres", value: "$2.2M", updatedAt: "Oct 16, 2026 · 09:12 AM" },
  { id: "SE-1049", title: "Fuel Logistics Tender", status: "Draft", project: "Fleet & Logistics", creator: "Maya Khan", value: "$740K", updatedAt: "Oct 15, 2026 · 05:40 PM" },
  { id: "SE-1048", title: "Offshore Valve Supply FY27", status: "Pending approval", project: "Offshore Drilling Program", creator: "Maya Khan", value: "$1.8M", updatedAt: "Oct 15, 2026 · 11:05 AM" },
  { id: "SE-1047", title: "Pipeline Inspection Services", status: "Evaluation", project: "Pipeline Integrity 2026", creator: "Jonas Reid", value: "$920K", updatedAt: "Oct 14, 2026 · 03:30 PM" },
  { id: "SE-1046", title: "Core Banking Hardware Refresh", status: "Pending approval", project: "Digital Banking Core", creator: "Priya Shah", value: "$2.4M", updatedAt: "Oct 14, 2026 · 10:18 AM" },
  { id: "SE-1045", title: "Data Center Colocation 2027", status: "Draft", project: "Digital Banking Core", creator: "Priya Shah", value: "$3.1M", updatedAt: "Oct 12, 2026 · 04:55 PM" },
  { id: "SE-1044", title: "Drilling Fluids Framework Agreement", status: "Awarded", project: "Offshore Drilling Program", creator: "Jonas Reid", value: "$4.6M", updatedAt: "Sep 22, 2026 · 01:20 PM" },
  { id: "SE-1043", title: "Branch Security Systems Upgrade", status: "Evaluation", project: "Branch Modernization", creator: "Aisha Okafor", value: "$610K", updatedAt: "Oct 02, 2026 · 12:02 PM" },
  { id: "SE-1041", title: "Compliance Audit Software", status: "Awarded", project: "Compliance & Risk", creator: "Aisha Okafor", value: "$380K", updatedAt: "Aug 29, 2026 · 09:47 AM" },
];

export type Priority = {
  id: string;
  /** The sourcing event this item is about. */
  eventId: string;
  level: "Urgent" | "High" | "Medium";
  title: string;
  reason: string;
  action: string;
};

export const priorities: Priority[] = [
  {
    id: "p1",
    eventId: "SE-1048",
    level: "Urgent",
    title: "Offshore Valve Supply is stuck in approval",
    reason: "Pending for 3 days; bidding is due to open on Oct 20.",
    action: "Nudge approver",
  },
  {
    id: "p2",
    eventId: "SE-1047",
    level: "High",
    title: "Pipeline Inspection Services is awaiting scoring",
    reason: "All 5 bids are in; evaluation has been pending for 7 days.",
    action: "Start evaluation",
  },
  {
    id: "p3",
    eventId: "SE-1046",
    level: "Medium",
    title: "Core Banking Hardware Refresh is over budget",
    reason: "Lowest bid so far is 12% above the approved budget.",
    action: "Review bids",
  },
  {
    id: "p4",
    eventId: "SE-1049",
    level: "High",
    title: "Fuel Logistics Tender draft is 2 days late",
    reason: "The draft hasn't been sent for approval; target launch was Oct 14.",
    action: "Open draft",
  },
  {
    id: "p5",
    eventId: "SE-1045",
    level: "Medium",
    title: "Data Center Colocation 2027 has no vendors invited",
    reason: "The draft is ready but the vendor shortlist is still empty.",
    action: "Invite vendors",
  },
  {
    id: "p6",
    eventId: "SE-1043",
    level: "Medium",
    title: "Branch Security Systems Upgrade has tied scores",
    reason: "Two bids scored 84/100; a tie-break criterion is needed.",
    action: "Resolve tie",
  },
];


export const vendors = [
  "Aker Marine Services",
  "Atlas Offshore Supply",
  "BlueWave Logistics",
  "Cobalt Industrial Co.",
  "Delta Freight Partners",
  "Horizon Shipping Ltd.",
  "Meridian Port Services",
  "NorthStar Maritime",
  "Oceanic Cargo Systems",
  "Pacific Bulk Carriers",
  "Sterling Marine Equipment",
  "Triton Fleet Management",
];
