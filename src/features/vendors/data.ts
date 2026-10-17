// Prototype data — replace with database queries.
export type VendorStatus = "Approved" | "Under review" | "Blocked";

export const vendorStatuses: VendorStatus[] = ["Approved", "Under review", "Blocked"];

export type Vendor = {
  id: string;
  name: string;
  status: VendorStatus;
  category: string;
  country: string;
  /** Performance score out of 100 from past events. */
  score: number;
};

export const vendorList: Vendor[] = [
  { id: "VN-1001", name: "Aker Marine Services", status: "Approved", category: "Offshore supply", country: "Norway", score: 91 },
  { id: "VN-1002", name: "Atlas Offshore Supply", status: "Approved", category: "Offshore supply", country: "United Arab Emirates", score: 84 },
  { id: "VN-1003", name: "BlueWave Logistics", status: "Under review", category: "Marine logistics", country: "United Arab Emirates", score: 62 },
  { id: "VN-1004", name: "Cobalt Industrial Co.", status: "Blocked", category: "Industrial equipment", country: "Singapore", score: 41 },
  { id: "VN-1005", name: "Delta Freight Partners", status: "Approved", category: "Freight forwarding", country: "Netherlands", score: 88 },
  { id: "VN-1006", name: "Horizon Shipping Ltd.", status: "Approved", category: "Marine logistics", country: "United Kingdom", score: 86 },
  { id: "VN-1007", name: "Meridian Port Services", status: "Approved", category: "Port services", country: "Oman", score: 79 },
  { id: "VN-1008", name: "NorthStar Maritime", status: "Approved", category: "Marine logistics", country: "Norway", score: 90 },
  { id: "VN-1009", name: "Oceanic Cargo Systems", status: "Approved", category: "Freight forwarding", country: "Singapore", score: 82 },
  { id: "VN-1010", name: "Pacific Bulk Carriers", status: "Under review", category: "Bulk shipping", country: "Japan", score: 67 },
  { id: "VN-1011", name: "Sterling Marine Equipment", status: "Approved", category: "Marine equipment", country: "United Kingdom", score: 85 },
  { id: "VN-1012", name: "Triton Fleet Management", status: "Approved", category: "Fleet management", country: "Greece", score: 89 },
];

/** Every category a vendor can be filed under. */
export const vendorCategories = Array.from(new Set(vendorList.map((v) => v.category))).sort();

export type TrackOutcome = "Awarded" | "Not awarded" | "Declined" | "Bid submitted";

export type TrackRecordEntry = {
  eventId: string;
  title: string;
  outcome: TrackOutcome;
  bid: string;
  rank: string;
  date: string;
};

// Prototype history pool — replace with bids joined to sourcing events.
const historyPool: Omit<TrackRecordEntry, "outcome" | "rank">[] = [
  { eventId: "SE-1044", title: "Drilling Fluids Framework Agreement", bid: "$4.5M", date: "Sep 22, 2026" },
  { eventId: "SE-1041", title: "Compliance Audit Software", bid: "$372K", date: "Aug 29, 2026" },
  { eventId: "SE-1047", title: "Pipeline Inspection Services", bid: "$905K", date: "Oct 14, 2026" },
  { eventId: "SE-1043", title: "Branch Security Systems Upgrade", bid: "$598K", date: "Oct 02, 2026" },
  { eventId: "SE-1038", title: "Port Equipment Maintenance 2026", bid: "$1.2M", date: "Jul 11, 2026" },
  { eventId: "SE-1032", title: "Crew Transfer Vessel Charter", bid: "$2.8M", date: "May 20, 2026" },
];

const outcomes: { outcome: TrackOutcome; rank: string }[] = [
  { outcome: "Awarded", rank: "#1" },
  { outcome: "Not awarded", rank: "#2" },
  { outcome: "Bid submitted", rank: "—" },
  { outcome: "Not awarded", rank: "#3" },
  { outcome: "Declined", rank: "—" },
  { outcome: "Awarded", rank: "#1" },
];

export function getTrackRecord(vendorId: string): TrackRecordEntry[] {
  const seed = Number(vendorId.replace(/\D/g, "")) || 0;
  const count = 4 + (seed % 3);
  return Array.from({ length: count }, (_, i) => ({
    ...historyPool[(seed + i) % historyPool.length],
    ...outcomes[(seed + i * 2) % outcomes.length],
  }));
}
