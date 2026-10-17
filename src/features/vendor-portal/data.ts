// Prototype data — replace with the vendor's real onboarding records and invitations.
import type { Vendor } from "@/features/vendors/data";

export type KycStatus = "Verified" | "In review" | "Missing" | "Expired";

export type KycDoc = { name: string; note: string; status: KycStatus; expiry: string };

const docNames: { name: string; note: string; expiry: string }[] = [
  { name: "Trade licence", note: "Issued by the local authority", expiry: "14 Mar 2028" },
  { name: "ISO 9001 certificate", note: "Quality management", expiry: "14 Mar 2028" },
  { name: "ISO 14001 certificate", note: "Environmental management", expiry: "02 Nov 2028" },
  { name: "Insurance certificate", note: "P&I and liability cover", expiry: "19 Jan 2027" },
  { name: "Bank account letter", note: "Issued by your bank in the last 3 months", expiry: "No expiry" },
  { name: "Sanctions and conflict declaration", note: "Signed by an authorised signatory", expiry: "No expiry" },
  { name: "Beneficial ownership declaration", note: "All owners above 10%", expiry: "No expiry" },
];

export function kycDocs(vendor: Vendor): KycDoc[] {
  return docNames.map((d) => {
    let status: KycStatus = "Verified";
    let expiry = d.expiry;
    if (vendor.status === "Under review") {
      if (d.name === "ISO 14001 certificate") {
        status = "Missing";
        expiry = "Not provided";
      }
      if (d.name === "Insurance certificate") status = "In review";
    }
    if (vendor.status === "Blocked") {
      if (d.name === "Trade licence") {
        status = "Expired";
        expiry = "30 Jun 2026";
      }
      if (d.name === "Bank account letter") {
        status = "Missing";
        expiry = "Not provided";
      }
    }
    return { name: d.name, note: d.note, status, expiry };
  });
}

export type StepState = "Complete" | "In progress" | "Action needed" | "Not started";

export function onboardingSteps(vendor: Vendor): { name: string; state: StepState }[] {
  const names = ["Company profile", "KYC documents", "Bank details", "Compliance questionnaire", "Procurement verification"];
  const states: StepState[] =
    vendor.status === "Approved"
      ? ["Complete", "Complete", "Complete", "Complete", "Complete"]
      : vendor.status === "Under review"
        ? ["Complete", "Action needed", "Complete", "Complete", "In progress"]
        : ["Complete", "Action needed", "Action needed", "Not started", "Not started"];
  return names.map((name, i) => ({ name, state: states[i] }));
}

export type PortalEvent = {
  id: string;
  title: string;
  project: string;
  status: "Invited" | "Bid submitted" | "Awarded" | "Closed";
  closing: string;
};

export const portalEvents: PortalEvent[] = [
  { id: "SE-1051", title: "Marine Logistics Framework", project: "Fleet & Logistics", status: "Invited", closing: "Nov 20, 2026" },
  { id: "SE-1047", title: "Pipeline Inspection Services", project: "Pipeline Integrity 2026", status: "Bid submitted", closing: "Oct 30, 2026" },
  { id: "SE-1044", title: "Drilling Fluids Framework Agreement", project: "Offshore Drilling Program", status: "Awarded", closing: "Sep 22, 2026" },
  { id: "SE-1041", title: "Compliance Audit Software", project: "Compliance & Risk", status: "Closed", closing: "Aug 29, 2026" },
];

export type TenderDoc = { name: string; bytes: number };

/** Documents the buyer published for an event (prototype names). */
export function tenderDocs(event: PortalEvent): TenderDoc[] {
  if (event.id === "SE-1051") {
    return [
      { name: "RFP_Marine_Logistics_Framework.pdf", bytes: 2_480_000 },
      { name: "Technical_Specification_Rev3.pdf", bytes: 1_120_000 },
      { name: "Terms_and_Conditions.pdf", bytes: 640_000 },
      { name: "Pricing_Template.xlsx", bytes: 58_000 },
    ];
  }
  const slug = event.title.replace(/[^A-Za-z0-9]+/g, "_");
  return [
    { name: `RFP_${slug}.pdf`, bytes: 1_900_000 },
    { name: "Technical_Specification.pdf", bytes: 980_000 },
    { name: "Terms_and_Conditions.pdf", bytes: 640_000 },
  ];
}

export type BidSlot = { id: string; name: string; note: string; required: boolean };

export const bidSlots: BidSlot[] = [
  { id: "tech", name: "Technical proposal", note: "How you will deliver the scope", required: true },
  { id: "matrix", name: "Compliance matrix", note: "Your response to each mandatory requirement", required: true },
  { id: "price", name: "Pricing schedule", note: "Use the pricing template", required: true },
  { id: "certs", name: "Certificates", note: "ISO, class and licence certificates", required: true },
  { id: "ins", name: "Insurance certificate", note: "P&I and liability cover", required: true },
  { id: "dev", name: "Exceptions and deviations", note: "Anything you cannot meet as written", required: false },
];

/** What a vendor sees after submitting, keyed by bid slot id (prototype). */
export const submittedBid: Record<string, { name: string; bytes: number; at: string }> = {
  tech: { name: "Technical_Proposal.pdf", bytes: 4_960_000, at: "Oct 12, 2026" },
  matrix: { name: "Compliance_Matrix.xlsx", bytes: 210_000, at: "Oct 12, 2026" },
  price: { name: "Pricing_Schedule.xlsx", bytes: 96_000, at: "Oct 12, 2026" },
  certs: { name: "Certificates_Annex_A.pdf", bytes: 860_000, at: "Oct 12, 2026" },
  ins: { name: "Insurance_Certificate.pdf", bytes: 340_000, at: "Oct 12, 2026" },
};
