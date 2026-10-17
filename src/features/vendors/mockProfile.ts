// Prototype data — replace with the vendor's contacts, risks, scorecards and audit trail.
import { getTrackRecord, type Vendor } from "./data";

export type Contact = { name: string; role: string; email: string; phone: string; address: string; website: string };

export function getContact(vendor: Vendor): Contact {
  const slug = vendor.name.toLowerCase().replace(/[^a-z]+/g, "");
  return {
    name: "Elena Marsh",
    role: "Key Account Director",
    email: `elena.marsh@${slug}.com`,
    phone: "+47 22 55 01 40",
    address: `Harbour Road 12, ${vendor.country}`,
    website: `www.${slug}.com`,
  };
}

export type Health = "good" | "watch" | "bad";
export type ReasoningStep = { title: string; detail: string };
export type PerformanceMetric = {
  id: string;
  label: string;
  /** Headline figure, already formatted. */
  value: string;
  /** What the figure measures, in one line. */
  caption: string;
  health: Health;
  verdict: string;
  /** Evidence, then inference, then conclusion. */
  steps: ReasoningStep[];
};

/** Overall record across every event the vendor has bid on. Prototype figures derived from the vendor score. */
export function getPerformance(vendor: Vendor): { summary: string; metrics: PerformanceMetric[]; events: number } {
  const record = getTrackRecord(vendor.id);
  const bids = record.filter((r) => r.outcome !== "Declined");
  const won = record.filter((r) => r.outcome === "Awarded").length;
  const declined = record.length - bids.length;
  const blocked = vendor.status === "Blocked";
  const review = vendor.status === "Under review";

  const winPct = bids.length ? Math.round((won / bids.length) * 100) : 0;
  const deviation = blocked ? 14.2 : review ? 7.8 : Math.round((100 - vendor.score) * 0.3 * 10) / 10 + 1.2;
  const flags = blocked ? 2 : review ? 1 : 0;
  const falseClaims = blocked ? 18 : review ? 9 : Math.max(0, Math.round((90 - vendor.score) / 3));
  const claimsChecked = 24 + bids.length * 3;
  const claimsWrong = Math.round((falseClaims / 100) * claimsChecked);

  const metrics: PerformanceMetric[] = [
    {
      id: "win",
      label: "Bidding win rate",
      value: `${winPct}%`,
      caption: `${won} won of ${bids.length} bids`,
      health: winPct >= 30 ? "good" : winPct >= 15 ? "watch" : "bad",
      verdict: winPct >= 30 ? "Competitive bidder" : "Wins few of the bids it submits",
      steps: [
        { title: "Counted the bids", detail: `${record.length} invitations in the record. ${declined} declined, ${bids.length} bids submitted.` },
        { title: "Counted the awards", detail: `${won} of those ${bids.length} bids ended Awarded; the rest were ranked second or lower.` },
        { title: "Compared with the portfolio", detail: "The average vendor in this category wins about 3 in 10 bids it submits." },
        { title: "Conclusion", detail: `${winPct}% is ${winPct >= 30 ? "at or above" : "below"} that average. ${declined > 1 ? "Frequent declines also reduce the invitations it converts." : "Decline rate is low."}` },
      ],
    },
    {
      id: "deviation",
      label: "Price deviation",
      value: `${deviation.toFixed(1)}%`,
      caption: "Average gap to the estimate",
      health: deviation <= 5 ? "good" : deviation <= 10 ? "watch" : "bad",
      verdict: deviation <= 5 ? "Prices track the estimate" : deviation <= 10 ? "Prices drift from the estimate" : "Prices are far from the estimate",
      steps: [
        { title: "Took each submitted bid", detail: `${bids.length} bids compared with the buyer's estimate for the same event.` },
        { title: "Measured the gap", detail: `Absolute difference averaged ${deviation.toFixed(1)}%, in either direction.` },
        { title: "Checked for a pattern", detail: deviation > 10 ? "Most of the gap is on the low side, which suggests under-pricing to win and claim variations later." : "Gaps are spread on both sides with no consistent under-pricing." },
        { title: "Conclusion", detail: deviation <= 5 ? "Low deviation. Bids are reliable inputs for budgeting." : "Review line-item pricing on the next bid before ranking on total price." },
      ],
    },
    {
      id: "fraud",
      label: "Fraud and integrity flags",
      value: String(flags),
      caption: flags ? `${flags} open ${flags === 1 ? "flag" : "flags"}` : "No flags raised",
      health: flags === 0 ? "good" : flags === 1 ? "watch" : "bad",
      verdict: flags === 0 ? "Clean record" : "Needs investigation",
      steps: [
        { title: "Screened the bids", detail: "Checked for matching bid text, shared contact details and shared bank accounts with other bidders." },
        { title: "Screened the documents", detail: blocked ? "The trade licence and bank letter failed verification. The licence expired on 30 Jun 2026." : "Documents were verified against issuing records with no mismatches." },
        { title: "Screened the pattern", detail: flags ? "Bid price landed within 0.5% of another bidder on two events, which is unlikely by chance." : "No collusion or bid-rigging signals across the events it joined." },
        { title: "Conclusion", detail: flags ? `${flags} ${flags === 1 ? "flag stays" : "flags stay"} open. Do not award new work until procurement closes them.` : "No action needed." },
      ],
    },
    {
      id: "misinfo",
      label: "Misinformation rate",
      value: `${falseClaims}%`,
      caption: `${claimsWrong} of ${claimsChecked} claims wrong`,
      health: falseClaims <= 5 ? "good" : falseClaims <= 12 ? "watch" : "bad",
      verdict: falseClaims <= 5 ? "Claims hold up" : falseClaims <= 12 ? "Some claims did not hold up" : "Claims often wrong",
      steps: [
        { title: "Collected the claims", detail: `${claimsChecked} statements in its bids and questionnaires could be checked against evidence.` },
        { title: "Checked each against evidence", detail: `${claimsChecked - claimsWrong} matched certificates, references or delivery records. ${claimsWrong} did not.` },
        { title: "Looked at what was wrong", detail: falseClaims > 5 ? "Mostly out-of-date certificates and capacity overstated in the technical response, rather than invented documents." : "Only small date and wording differences." },
        { title: "Conclusion", detail: falseClaims > 5 ? "Ask for evidence for every technical claim before scoring it." : "Technical responses can be scored as submitted." },
      ],
    },
  ];

  const bad = metrics.filter((m) => m.health === "bad").length;
  const watch = metrics.filter((m) => m.health === "watch").length;
  const summary =
    bad > 0
      ? `${bad} of 4 measures need action. Treat bids from this vendor with extra checks.`
      : watch > 0
        ? `${watch} of 4 measures are worth watching. No blocking issues.`
        : "All four measures are healthy. This vendor is reliable to invite.";

  return { summary, metrics, events: record.length };
}

export type VendorRisk = { id: string; severity: "High" | "Medium" | "Low"; title: string; detail: string; eventId: string };

export function getRisks(vendor: Vendor): VendorRisk[] {
  if (vendor.status === "Blocked")
    return [
      { id: "VR-1", severity: "High", title: "Trade licence expired", detail: "Expired on 30 Jun 2026 and has not been renewed.", eventId: "SE-1043" },
      { id: "VR-2", severity: "High", title: "Bank account letter missing", detail: "Payment details cannot be verified.", eventId: "SE-1043" },
      { id: "VR-3", severity: "Medium", title: "Late delivery on previous award", detail: "Delivered 18 days after the agreed date.", eventId: "SE-1038" },
    ];
  if (vendor.status === "Under review")
    return [
      { id: "VR-1", severity: "Medium", title: "ISO 14001 certificate not provided", detail: "Required for offshore events.", eventId: "SE-1051" },
      { id: "VR-2", severity: "Low", title: "Insurance certificate under review", detail: "Cover renewal date is being confirmed.", eventId: "SE-1051" },
    ];
  return [{ id: "VR-1", severity: "Low", title: "Insurance renews in 3 months", detail: "Cover ends 19 Jan 2027.", eventId: "SE-1047" }];
}

export type VendorActivityCategory = "Status" | "Bidding" | "Compliance" | "Onboarding";

export type VendorActivity = {
  id: string;
  at: string;
  action: string;
  detail?: string;
  actor: string;
  role: string;
  category: VendorActivityCategory;
};

export const vendorActivityCategories: VendorActivityCategory[] = ["Status", "Bidding", "Compliance", "Onboarding"];

/** Newest first. */
export function getActivity(vendor: Vendor): VendorActivity[] {
  const v = "Vendor";
  return [
    { id: "VA-10", at: "2026-10-16 09:12", actor: "Leo Torres", role: "Procurement Lead", category: "Bidding", action: "Invited the vendor to Marine Logistics Framework", detail: "SE-1051" },
    { id: "VA-09", at: "2026-10-14 14:20", actor: vendor.name, role: v, category: "Bidding", action: "Submitted a bid", detail: "SE-1047, Pipeline Inspection Services" },
    { id: "VA-08", at: "2026-10-14 09:02", actor: vendor.name, role: v, category: "Bidding", action: "Asked a clarification question", detail: "SE-1047, scope of the inspection interval" },
    { id: "VA-07", at: "2026-10-02 10:05", actor: "Aisha Okafor", role: "Category Manager", category: "Status", action: `Set the status to ${vendor.status}` },
    { id: "VA-06", at: "2026-09-30 16:20", actor: "Priya Shah", role: "Category Manager", category: "Onboarding", action: "Completed procurement verification", detail: "Sanctions screening clear, 2 of 2 references positive" },
    { id: "VA-05", at: "2026-09-28 16:40", actor: vendor.name, role: v, category: "Compliance", action: "Uploaded the insurance certificate", detail: "Insurance_certificate.pdf" },
    { id: "VA-04", at: "2026-09-27 11:15", actor: "Priya Shah", role: "Category Manager", category: "Compliance", action: "Verified the trade licence", detail: "Trade_licence.pdf" },
    { id: "VA-03", at: "2026-09-25 10:50", actor: vendor.name, role: v, category: "Onboarding", action: "Submitted the compliance questionnaire" },
    { id: "VA-02", at: "2026-09-22 14:05", actor: vendor.name, role: v, category: "Onboarding", action: "Submitted the bank details" },
    { id: "VA-01", at: "2026-09-20 09:30", actor: vendor.name, role: v, category: "Onboarding", action: "Completed the company profile" },
  ];
}

export type Submitted = { label: string; value: string }[];

/** What the vendor entered at an onboarding stage. KYC documents are shown from the document list instead. */
export function getSubmission(vendor: Vendor, step: string): { submitted?: string; fields: Submitted } {
  const slug = vendor.name.toLowerCase().replace(/[^a-z]+/g, "");
  const pending = vendor.status !== "Approved";
  const blocked = vendor.status === "Blocked";
  switch (step) {
    case "Company profile":
      return {
        submitted: "2026-09-20 09:30",
        fields: [
          { label: "Legal company name", value: `${vendor.name} Ltd` },
          { label: "Trading name", value: vendor.name },
          { label: "Business type", value: "Private limited company" },
          { label: "Registration no.", value: "REG-884213" },
          { label: "Tax / VAT no.", value: "VAT-0049-8821" },
          { label: "Date of incorporation", value: "12 Apr 2011" },
          { label: "Country of incorporation", value: vendor.country },
          { label: "Registered address", value: `Harbour Road 12, ${vendor.country}` },
          { label: "Operating countries", value: `${vendor.country}, Oman, United Kingdom` },
          { label: "Business phone", value: "+47 22 55 01 40" },
          { label: "Website", value: `www.${slug}.com` },
        ],
      };
    case "Bank details":
      return {
        submitted: blocked ? undefined : "2026-09-22 14:05",
        fields: blocked
          ? []
          : [
              { label: "Account holder", value: `${vendor.name} Ltd` },
              { label: "Bank name", value: "Northern Commerce Bank" },
              { label: "Bank country", value: vendor.country },
              { label: "Currency", value: "USD" },
              { label: "Account no. / IBAN", value: "•••• •••• •••• 4821" },
              { label: "SWIFT / BIC", value: "NCBKNO22" },
            ],
      };
    case "Compliance questionnaire":
      return {
        submitted: blocked ? undefined : "2026-09-25 10:50",
        fields: blocked
          ? []
          : [
              { label: "Sanctioned parties or jurisdictions?", value: "No" },
              { label: "Conflicts of interest with the buyer?", value: "None declared" },
              { label: "Anti-bribery policy in place?", value: "Yes" },
              { label: "Modern slavery statement published?", value: "Yes" },
              { label: "Reportable safety incidents, last 3 years", value: pending ? "1" : "0" },
              { label: "Subcontractors used on contracts?", value: "Yes, with prior approval" },
            ],
      };
    case "Procurement verification":
      return {
        submitted: vendor.status === "Approved" ? "2026-09-30 16:20" : undefined,
        fields:
          vendor.status === "Approved"
            ? [
                { label: "Verified by", value: "Priya Shah, Category Manager" },
                { label: "Sanctions screening", value: "Clear" },
                { label: "Adverse media check", value: "No findings" },
                { label: "Reference checks", value: "2 of 2 positive" },
                { label: "Decision", value: "Approved for all categories" },
              ]
            : [],
      };
    default:
      return { fields: [] };
  }
}
