// Prototype data — replace with real citations from the OCR output and the knowledge graph.
import type { Evidence } from "./evalInspect";

const doc = (source: string, page: string, quote: string): Evidence => ({ kind: "doc", source, page, quote });
const graph = (...edges: [string, string, string][]): Evidence => ({ kind: "graph", edges });

export const RFP = "RFP_Marine_Logistics_Framework.pdf";
export const SPEC = "Technical_Specification_Rev3.pdf";

export const bidDoc: Record<string, string> = {
  aker: "Aker_Technical_Proposal.pdf",
  atlas: "Atlas_Bid_Response.pdf",
  bluewave: "BlueWave_Bid_Response.pdf",
};

/** Where in the tender each requirement is defined. */
export const tenderRef: Record<string, { source: string; page: string }> = {
  R1: { source: RFP, page: "p.2, §3" },
  R2: { source: RFP, page: "p.2, §3" },
  R3: { source: RFP, page: "p.2, §3" },
  R4: { source: RFP, page: "p.2, §3" },
  R5: { source: RFP, page: "p.2, §3" },
  R6: { source: SPEC, page: "p.1" },
  R7: { source: RFP, page: "p.3, §4" },
  R8: { source: RFP, page: "p.3, §5" },
  R9: { source: RFP, page: "p.3, §5" },
  R10: { source: RFP, page: "p.3, §5" },
};

/** Knowledge-graph facts behind each vendor's answer, per requirement. */
export const graphFacts: Record<string, Record<string, [string, string, string][]>> = {
  R1: {
    aker: [["Aker Marine Services", "holds", "ISO 9001, 14001, 45001"], ["ISO 14001", "valid until", "Nov 2028"]],
    atlas: [["Atlas Offshore Supply", "holds", "ISO 9001, 14001"], ["Both certificates", "valid until", "2028"]],
    bluewave: [["BlueWave Logistics FZE", "holds", "ISO 9001:2015 (QMS-2291847)"], ["BlueWave Logistics FZE", "has no record of", "ISO 14001"]],
  },
  R2: {
    aker: [["Aker Marine Services", "founded", "2014"], ["Aker Marine Services", "delivered", "12 years of offshore supply"]],
    atlas: [["Atlas Offshore Supply", "delivered", "9 years of offshore supply"]],
    bluewave: [["BlueWave Logistics", "delivered", "7 years of offshore supply"]],
  },
  R3: {
    aker: [["Aker Marine Services", "operates", "7 vessels"], ["7 vessels", "have notation", "DPS 2"], ["MV Aker Horizon", "offered in", "SE-1051"]],
    atlas: [["Atlas Offshore Supply", "operates", "6 DP2 vessels"], ["4 vessels", "offered in", "SE-1051"]],
    bluewave: [["BlueWave Logistics", "operates", "4 offered vessels"], ["2 vessels", "lack", "DP2 notation"]],
  },
  R4: {
    aker: [["Aker Marine Services", "runs", "24/7 operations desk"], ["Operations desk", "responds within", "1 hour"]],
    atlas: [["Atlas Offshore Supply", "runs", "24/7 operations desk"], ["Overnight shift", "responds within", "3 hours"]],
    bluewave: [["BlueWave Logistics", "staffs desk", "06:00–22:00"], ["Overnight cover", "is", "on-call, 4 hours"]],
  },
  R5: {
    aker: [["Aker Marine Services", "commits", "62% local crew"]],
    atlas: [["Atlas Offshore Supply", "commits", "45% local crew"]],
    bluewave: [["BlueWave Logistics", "commits", "38% local crew"]],
  },
  R6: {
    aker: [["MV Aker Horizon", "classed by", "DNV"], ["DNV certificate", "valid until", "02 Feb 2027"]],
    atlas: [["Atlas fleet", "classed by", "DNV and ABS"]],
    bluewave: [["BlueWave offered fleet", "classed by", "DNV (3 of 4 vessels)"], ["4th vessel", "has no", "class certificate on file"]],
  },
  R7: {
    aker: [["Aker Marine Services", "reported LTIFR", "0.21 (3-year average)"]],
    atlas: [["Atlas Offshore Supply", "reported LTIFR", "0.38 (3-year average)"]],
    bluewave: [["BlueWave Logistics", "reported LTIFR", "0.74 in 2025"], ["0.74", "exceeds limit", "0.5"]],
  },
  R8: {
    aker: [["Aker Marine Services", "insured for", "USD 100M P&I"]],
    atlas: [["Atlas Offshore Supply", "insured for", "USD 75M P&I"]],
    bluewave: [["BlueWave Logistics", "insured for", "USD 30M P&I"], ["USD 30M", "below minimum", "USD 50M"]],
  },
  R9: {
    aker: [["Aker Marine Services", "files", "IMO DCS reports for all vessels"]],
    atlas: [["Atlas Offshore Supply", "files reports for", "2 of 4 vessels"]],
    bluewave: [["BlueWave Logistics", "has no", "emissions reports on file"]],
  },
  R10: {
    aker: [["Aker Marine Services", "parent", "Aker Holding"], ["Aker Holding", "signed", "parent company guarantee"]],
    atlas: [["Atlas Offshore Supply", "parent", "Atlas Group"], ["Atlas Group", "signed", "parent company guarantee"]],
    bluewave: [["BlueWave Logistics FZE", "parent", "BlueWave Holdings"], ["BlueWave Holdings", "offered", "bank guarantee only"]],
  },
};

/** Extra document excerpts for specific answers (certificates, drawings). */
export const extraDocs: Record<string, Evidence[]> = {
  "R1:bluewave": [doc("BlueWave_ISO_Certificate_Scan.pdf", "p.1", "Standard: ISO 9001:2015 · Valid until 14 Mar 2028 · OCR confidence 84%")],
  "R3:aker": [doc("Aker_Technical_Proposal.pdf", "Figure 1", "General arrangement, MV Aker Horizon: deck area 820 m², deadweight 3,200 t, bollard pull 120 t.")],
  "R6:aker": [doc("Aker_Technical_Proposal.pdf", "Figure 2", "Class society DNV · Notation 1A1 Offshore Support Vessel, DPS 2 · Valid until 02 Feb 2027")],
  "R3:bluewave": [doc("BlueWave_Bid_Response.pdf", "p.2", "BlueWave does not hold DP2 class on two of the offered vessels and proposes a phased upgrade by Q2 2027.")],
  "R4:bluewave": [doc("BlueWave_Bid_Response.pdf", "p.2", "The 24/7 desk is staffed from 06:00 to 22:00, with on-call cover overnight.")],
};

/** Evidence for deviations that are not tied to one numbered requirement. */
export const devExtra: Record<string, { tender: Evidence; bid: Evidence; graph: Evidence }> = {
  "Payment terms": {
    tender: doc(RFP, "p.3, §5", "Payment terms: Net 30 from receipt of a valid invoice."),
    bid: doc(bidDoc.bluewave, "p.1", "Payment terms: Net 45"),
    graph: graph(["BlueWave Logistics", "offers", "Net 45"], ["Net 45", "later than tender", "Net 30"]),
  },
  "Class certificate validity": {
    tender: doc(RFP, "p.1, §1", "Three-year framework agreement covering vessel chartering, port handling and offshore supply runs."),
    bid: doc(bidDoc.aker, "Figure 2", "Valid until 02 Feb 2027"),
    graph: graph(["MV Aker Horizon", "class valid until", "02 Feb 2027"], ["Framework term", "ends", "2029"]),
  },
  "Fleet offered": {
    tender: doc(SPEC, "p.1", "Dynamic positioning: DP2 minimum."),
    bid: doc(bidDoc.aker, "p.1", "Vessels offered: 5 of 7 fleet"),
    graph: graph(["Aker Marine Services", "operates", "7 DP2 vessels"], ["Offered", "5 vessels, above minimum", "4"]),
  },
};

/** Parallel to `risks` in mockEvaluation.ts. */
export const riskEvidence: Evidence[][] = [
  [doc(bidDoc.aker, "Figure 2", "Valid until 02 Feb 2027"), graph(["MV Aker Horizon", "class valid until", "02 Feb 2027"], ["Framework term", "runs to", "2029"])],
  [doc(bidDoc.aker, "p.1", "Vessels offered: 5 of 7 fleet"), graph(["Aker Marine Services", "operates", "7 vessels"], ["Surge capacity", "available from", "2 spare vessels"])],
  [doc(bidDoc.atlas, "p.2", "24/7 desk, 3-hour response overnight"), graph(["Atlas Offshore Supply", "overnight response", "3 hours"], ["Tender", "requires", "2 hours"])],
  [doc(bidDoc.bluewave, "p.2", "BlueWave does not hold DP2 class on two of the offered vessels and proposes a phased upgrade by Q2 2027."), graph(["BlueWave Logistics", "operates", "2 DP2 vessels"], ["Upgrade", "planned for", "Q2 2027"])],
  [doc(bidDoc.bluewave, "p.2", "R1: ISO 9001 only; ISO 14001 in progress. LTIFR 0.74 in 2025."), graph(["BlueWave Logistics", "reported LTIFR", "0.74"], ["Company HSE standard", "limit", "0.5"])],
  [doc(bidDoc.bluewave, "p.2", "Insurance: USD 30M; parent guarantee not offered, bank guarantee proposed."), graph(["BlueWave Logistics", "insured for", "USD 30M"], ["BlueWave Holdings", "offered", "bank guarantee only"])],
  [doc("BlueWave_ISO_Certificate_Scan.pdf", "p.1", "Certificate no. QMS-2291847 · overall OCR confidence 84% (4 low-confidence words)"), graph(["QMS-2291847", "issued to", "BlueWave Logistics FZE"], ["Certificate", "not yet verified with", "issuing body"])],
];

/** Parallel to `complianceChecks` in mockEvaluation.ts. */
export const checkEvidence: Evidence[][] = [
  [doc("Bid register", "entry list", "3 sealed bids opened on 20 Nov 2026: Aker, Atlas, BlueWave."), graph(["Procurement policy 4.2", "requires", "3 bids minimum"], ["SE-1051", "received", "3 bids"])],
  [graph(["Aker Marine Services", "screened against", "OFAC, UN, EU lists"], ["Atlas Offshore Supply", "screened against", "OFAC, UN, EU lists"], ["BlueWave Logistics", "screened against", "OFAC, UN, EU lists"]), doc("Screening report", "summary", "No matches for any bidder, owner or parent company.")],
  [doc("Evaluator declarations", "all", "Signed by 4 of 4 evaluators; no conflicts declared."), graph(["SE-1051 evaluators", "declared", "no conflicts"])],
  [doc(RFP, "p.3, §4", "Technical compliance 40% · Commercial offer 35% · HSE and quality record 15% · Local content 10%"), graph(["Evaluation model", "weights", "40 / 35 / 15 / 10"], ["RFP §4", "matches", "Evaluation model"])],
  [doc(bidDoc.aker, "Figure 2", "Valid until 02 Feb 2027"), graph(["MV Aker Horizon", "class valid until", "02 Feb 2027"], ["Framework term", "runs to", "2029"])],
  [doc(bidDoc.bluewave, "p.2", "Insurance: USD 30M; top-up offered at extra cost."), graph(["BlueWave Logistics", "insured for", "USD 30M"], ["Tender", "requires", "USD 50M"])],
  [graph(["SE-1051", "estimated value", "USD 2.2M"], ["Approval matrix", "above USD 1M", "CPO and Finance"]), doc("Delegation of authority", "table 2", "Awards above USD 1M require CPO and Finance Director approval.")],
  [doc(RFP, "p.3, §5", "Bids remain valid for 120 days from the closing date."), graph(["All 3 bids", "valid for", "120 days"])],
];

/** Evidence behind a scorecard number, per criterion. */
export const criterionDocs: Record<string, (vendorId: string) => Evidence[]> = {
  tech: (v) => [doc(bidDoc[v], "p.2", "Compliance matrix: responses to R1 to R10 read by OCR and checked against the tender."), graph([v === "aker" ? "Aker Marine Services" : v === "atlas" ? "Atlas Offshore Supply" : "BlueWave Logistics", "responded to", "10 requirements"])],
  comm: (v) => [doc(bidDoc[v], "pricing schedule", "Total bid value as stated in the pricing schedule."), graph(["Lowest bid", "is", "USD 1.74M"], ["Price score", "=", "lowest ÷ bid × 100"])],
  hse: (v) => [doc(bidDoc[v], "p.2", "HSE record, certificates and incident rates as declared in the bid."), graph(["Company HSE standard", "LTIFR limit", "0.5"])],
  local: (v) => [doc(bidDoc[v], "p.2", "Local content plan: share of local crew and port services."), graph(["Tender R5", "scored under", "Local content (10%)"])],
};
