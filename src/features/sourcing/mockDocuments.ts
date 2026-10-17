// Prototype data — replace with documents and OCR output from the backend.
// In paragraph text, ⟦word⟧ marks a word the OCR engine was not confident about.

export type OcrBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "fields"; items: { label: string; value: string }[] }
  | { type: "table"; columns: string[]; rows: string[][] }
  | {
      type: "image";
      /** Which placeholder illustration to draw (no real image in the prototype). */
      kind: "vessel" | "certificate";
      caption: string;
      /** What the LLM says the image shows. */
      summary: string;
      detected: { label: string; value: string }[];
      checks: { ok: boolean; text: string }[];
    };

export type OcrPage = { n: number; confidence: number; blocks: OcrBlock[] };

export type OcrDoc = { language: string; pages: OcrPage[] };

export type MockDocument = {
  id: string;
  name: string;
  /** "Tender" or a vendor name from `vendors`. */
  group: string;
  bytes: number;
  ocr: OcrDoc;
};

export const mockDocuments: MockDocument[] = [
  {
    id: "d1",
    name: "RFP_Marine_Logistics_Framework.pdf",
    group: "Tender",
    bytes: 2_480_000,
    ocr: {
      language: "English",
      pages: [
        {
          n: 1,
          confidence: 99,
          blocks: [
            { type: "heading", text: "Request for Proposal — Marine Logistics Framework" },
            {
              type: "fields",
              items: [
                { label: "Reference", value: "SE-1051" },
                { label: "Issued by", value: "Fleet & Logistics" },
                { label: "Issue date", value: "12 Oct 2026" },
                { label: "Bid closing date", value: "20 Nov 2026, 17:00 GST" },
                { label: "Estimated value", value: "USD 2.2M" },
              ],
            },
            { type: "heading", text: "1. Background" },
            {
              type: "paragraph",
              text: "The Company seeks qualified marine logistics providers to enter a three-year framework agreement covering vessel chartering, port handling and offshore supply runs for its drilling program.",
            },
          ],
        },
        {
          n: 2,
          confidence: 98,
          blocks: [
            { type: "heading", text: "2. Scope of work" },
            {
              type: "paragraph",
              text: "The successful bidder shall provide offshore supply vessels, crew and port handling services as called off under the framework. All vessels must hold valid class certification and comply with the Company's HSE standards.",
            },
            { type: "heading", text: "3. Mandatory requirements" },
            {
              type: "table",
              columns: ["#", "Requirement", "Type"],
              rows: [
                ["R1", "Valid ISO 9001 and ISO 14001 certification", "Mandatory"],
                ["R2", "Minimum 5 years of offshore supply experience", "Mandatory"],
                ["R3", "Fleet of at least 4 vessels with DP2 capability", "Mandatory"],
                ["R4", "24/7 operations desk with 2-hour response time", "Mandatory"],
                ["R5", "Local content plan for crew and port services", "Scored"],
              ],
            },
          ],
        },
        {
          n: 3,
          confidence: 96,
          blocks: [
            { type: "heading", text: "4. Evaluation criteria" },
            {
              type: "table",
              columns: ["Criterion", "Weight"],
              rows: [
                ["Technical compliance", "40%"],
                ["Commercial offer", "35%"],
                ["HSE and quality record", "15%"],
                ["Local content", "10%"],
              ],
            },
            { type: "heading", text: "5. Terms" },
            {
              type: "paragraph",
              text: "Bids remain valid for 120 days from the closing date. The Company is not bound to accept the lowest or any bid and may ⟦negotiate⟧ with shortlisted bidders before award.",
            },
          ],
        },
      ],
    },
  },
  {
    id: "d2",
    name: "Technical_Specification_Rev3.pdf",
    group: "Tender",
    bytes: 1_120_000,
    ocr: {
      language: "English",
      pages: [
        {
          n: 1,
          confidence: 97,
          blocks: [
            { type: "heading", text: "Technical Specification — Offshore Supply Vessels" },
            {
              type: "fields",
              items: [
                { label: "Document", value: "TS-MLF-003" },
                { label: "Revision", value: "3" },
                { label: "Approved by", value: "Leo Torres" },
              ],
            },
            {
              type: "table",
              columns: ["Parameter", "Minimum"],
              rows: [
                ["Deadweight", "3,000 t"],
                ["Deck area", "800 m²"],
                ["Dynamic positioning", "DP2"],
                ["Bollard pull", "120 t"],
                ["Class", "DNV or equivalent"],
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "d3",
    name: "Aker_Technical_Proposal.pdf",
    group: "Aker Marine Services",
    bytes: 4_960_000,
    ocr: {
      language: "English",
      pages: [
        {
          n: 1,
          confidence: 98,
          blocks: [
            { type: "heading", text: "Technical Proposal — Aker Marine Services" },
            {
              type: "paragraph",
              text: "Aker Marine Services is pleased to submit its proposal for the Marine Logistics Framework (SE-1051). We operate a fleet of 7 DP2 offshore supply vessels and have delivered offshore logistics for over 12 years.",
            },
            {
              type: "fields",
              items: [
                { label: "Vessels offered", value: "5 of 7 fleet" },
                { label: "Certifications", value: "ISO 9001, ISO 14001, ISO 45001" },
                { label: "Operations desk", value: "24/7, 1-hour response" },
              ],
            },
            {
              type: "image",
              kind: "vessel",
              caption: "Figure 1 — General arrangement, MV Aker Horizon",
              summary:
                "Side-profile general arrangement drawing of an offshore supply vessel with the bridge forward, an open aft cargo deck and a deck crane. Dimensions and performance values are printed on the drawing.",
              detected: [
                { label: "Length overall", value: "82.4 m" },
                { label: "Beam", value: "17.0 m" },
                { label: "Deck area", value: "820 m²" },
                { label: "Deadweight", value: "3,200 t" },
                { label: "Bollard pull", value: "120 t" },
              ],
              checks: [
                { ok: true, text: "Deck area 820 m² meets the 800 m² minimum (TS-MLF-003)" },
                { ok: true, text: "Deadweight 3,200 t meets the 3,000 t minimum" },
                { ok: true, text: "Bollard pull 120 t meets the 120 t minimum" },
              ],
            },          ],
        },
        {
          n: 2,
          confidence: 95,
          blocks: [
            { type: "heading", text: "Compliance matrix" },
            {
              type: "table",
              columns: ["Req.", "Response", "Status"],
              rows: [
                ["R1", "Certificates attached (Annex A)", "Compliant"],
                ["R2", "12 years of offshore supply experience", "Compliant"],
                ["R3", "7 DP2 vessels, 5 offered", "Compliant"],
                ["R4", "24/7 desk, 1-hour response", "Compliant"],
                ["R5", "62% local crew commitment", "Compliant"],
              ],
            },
            {
              type: "image",
              kind: "certificate",
              caption: "Figure 2 — Class certificate (Annex A, scanned)",
              summary:
                "Scanned class certificate with a society seal, a signature block and a validity stamp. The text on the certificate was read from the image and the seal was identified as a DNV mark.",
              detected: [
                { label: "Class society", value: "DNV" },
                { label: "Vessel", value: "MV Aker Horizon" },
                { label: "Notation", value: "1A1 Offshore Support Vessel, DPS 2" },
                { label: "Valid until", value: "02 Feb 2027" },
              ],
              checks: [
                { ok: true, text: "DPS 2 notation supports requirement R3 (DP2 capability)" },
                { ok: false, text: "Expires 02 Feb 2027, inside the 3-year framework term; ask for renewal evidence" },
              ],
            },          ],
        },
      ],
    },
  },
  {
    id: "d4",
    name: "BlueWave_Bid_Response.pdf",
    group: "BlueWave Logistics",
    bytes: 3_310_000,
    ocr: {
      language: "English",
      pages: [
        {
          n: 1,
          confidence: 93,
          blocks: [
            { type: "heading", text: "Bid Response — BlueWave Logistics" },
            {
              type: "paragraph",
              text: "BlueWave Logistics confirms it can ⟦mobilise⟧ four vessels within 45 days of award. Our proposal covers chartering, port handling and ⟦stevedoring⟧ for the full framework term.",
            },
            {
              type: "fields",
              items: [
                { label: "Total bid value", value: "USD 1.74M" },
                { label: "Validity", value: "120 days" },
                { label: "Payment terms", value: "Net 45" },
              ],
            },
          ],
        },
        {
          n: 2,
          confidence: 88,
          blocks: [
            { type: "heading", text: "Exceptions and deviations" },
            {
              type: "paragraph",
              text: "BlueWave does not hold DP2 class on two of the offered vessels and ⟦proposes⟧ a ⟦phased⟧ upgrade by Q2 2027. The 24/7 desk is staffed from 06:00 to 22:00, with on-call cover overnight.",
            },
            {
              type: "table",
              columns: ["Req.", "Response", "Status"],
              rows: [
                ["R1", "ISO 9001 only; ISO 14001 in progress", "Partial"],
                ["R2", "7 years of experience", "Compliant"],
                ["R3", "2 of 4 vessels DP2", "Non-compliant"],
                ["R4", "On-call overnight, 4-hour response", "Non-compliant"],
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "d5",
    name: "BlueWave_ISO_Certificate_Scan.pdf",
    group: "BlueWave Logistics",
    bytes: 860_000,
    ocr: {
      language: "English",
      pages: [
        {
          n: 1,
          confidence: 84,
          blocks: [
            { type: "heading", text: "Certificate of Registration" },
            {
              type: "fields",
              items: [
                { label: "Certificate no.", value: "QMS-2291847" },
                { label: "Standard", value: "ISO 9001:2015" },
                { label: "Issued to", value: "BlueWave Logistics FZE" },
                { label: "Valid until", value: "14 Mar 2028" },
              ],
            },
            {
              type: "paragraph",
              text: "This is to certify that the ⟦quality⟧ management system of the above organisation has been ⟦assessed⟧ and found to comply with the requirements of ISO 9001:2015 for the provision of marine ⟦logistics⟧ services.",
            },
          ],
        },
      ],
    },
  },
];
