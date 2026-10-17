// Prototype config — replace with the saved onboarding flow from the database.
// Each step has a type; the type decides HOW its data is collected and seeds the step's fields.
import { vendorCategories } from "@/features/vendors/data";

export { vendorCategories };

export type FieldKind = "text" | "textarea" | "select" | "date" | "yesno" | "file";

export type FieldDef = {
  key: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  placeholder?: string;
  options?: readonly string[];
  pattern?: string;
  hint?: string;
  wide?: boolean;
  /** Vendor categories this field applies to. Empty or missing means every category. */
  categories?: string[];
  /** file: also ask for the document's expiry date. */
  expiry?: boolean;
  /** yesno: this answer sends the vendor to procurement for review. */
  flagOn?: "Yes" | "No";
  /** Added by an admin rather than seeded from the step type. */
  custom?: boolean;
};

export type StepTypeId =
  | "REGISTRATION"
  | "COUNTRY_DETAILS"
  | "BANK_ACCOUNT"
  | "CONTACTS"
  | "OWNERS"
  | "DOCUMENTS"
  | "QUESTIONNAIRE"
  | "VERIFICATION";

export type StepType = {
  id: StepTypeId;
  label: string;
  summary: string;
  /**
   * "form" collects one record, "list" collects one or more records (e.g. several bank accounts),
   * "internal" is completed by procurement and never shown to the vendor.
   */
  mode: "form" | "list" | "internal";
  itemLabel?: string;
  /** What an admin adds to this step: "field", "document", "question" or "check". */
  fieldNoun: string;
  fields: FieldDef[];
};

export const countries = [
  "Malaysia",
  "Singapore",
  "United Arab Emirates",
  "Oman",
  "Norway",
  "Netherlands",
  "United Kingdom",
  "Greece",
  "Japan",
  "India",
] as const;

export const currencies = ["USD", "EUR", "GBP", "AED", "MYR", "SGD", "NOK", "JPY", "INR"] as const;

export const reviewerRoles = ["Category Manager", "Procurement Lead", "Compliance Officer", "Finance Controller"] as const;

const offshore = ["Offshore supply", "Marine logistics", "Marine equipment"];

export const stepTypes: Record<StepTypeId, StepType> = {
  REGISTRATION: {
    id: "REGISTRATION",
    label: "Registration details",
    summary: "Legal entity name, registration and tax numbers",
    mode: "form",
    fieldNoun: "field",
    fields: [
      { key: "legalName", label: "Legal company name", kind: "text", required: true, placeholder: "As on your registration certificate" },
      { key: "tradeName", label: "Trading name", kind: "text", placeholder: "If different from legal name" },
      {
        key: "businessType",
        label: "Business type",
        kind: "select",
        required: true,
        options: ["Private limited", "Public limited", "Partnership", "Sole proprietorship", "Branch of foreign company"],
      },
      { key: "registrationNo", label: "Company registration no.", kind: "text", required: true },
      { key: "taxId", label: "Tax / VAT identification no.", kind: "text", required: true },
      { key: "incorporatedOn", label: "Date of incorporation", kind: "date", required: true },
      { key: "registeredAddress", label: "Registered address", kind: "textarea", required: true, wide: true },
    ],
  },
  COUNTRY_DETAILS: {
    id: "COUNTRY_DETAILS",
    label: "Country details",
    summary: "Where you are based and operate",
    mode: "form",
    fieldNoun: "field",
    fields: [
      { key: "country", label: "Country of incorporation", kind: "select", required: true, options: countries },
      { key: "taxResidency", label: "Tax residency", kind: "select", required: true, options: countries },
      { key: "operatingCountries", label: "Countries you operate in", kind: "text", placeholder: "e.g. Oman, UAE, Norway", wide: true },
      { key: "currency", label: "Preferred invoicing currency", kind: "select", required: true, options: currencies },
      { key: "phone", label: "Business phone", kind: "text", required: true, placeholder: "+971 4 123 4567" },
    ],
  },
  BANK_ACCOUNT: {
    id: "BANK_ACCOUNT",
    label: "Bank accounts",
    summary: "One or more accounts we pay invoices into",
    mode: "list",
    itemLabel: "Bank account",
    fieldNoun: "field",
    fields: [
      { key: "holder", label: "Account holder name", kind: "text", required: true, hint: "Must match the legal company name" },
      { key: "bankName", label: "Bank name", kind: "text", required: true },
      { key: "bankCountry", label: "Bank country", kind: "select", required: true, options: countries },
      { key: "currency", label: "Account currency", kind: "select", required: true, options: currencies },
      { key: "accountNo", label: "Account no. / IBAN", kind: "text", required: true, pattern: "[A-Za-z0-9 \\-]{6,34}" },
      { key: "swift", label: "SWIFT / BIC", kind: "text", required: true, pattern: "[A-Za-z]{6}[A-Za-z0-9]{2}([A-Za-z0-9]{3})?", hint: "8 or 11 characters" },
      { key: "branch", label: "Branch (optional)", kind: "text" },
    ],
  },
  CONTACTS: {
    id: "CONTACTS",
    label: "Contacts and key people",
    summary: "Who we deal with day to day",
    mode: "list",
    itemLabel: "Contact",
    fieldNoun: "field",
    fields: [
      { key: "name", label: "Full name", kind: "text", required: true },
      {
        key: "role",
        label: "Role",
        kind: "select",
        required: true,
        options: ["Key account director", "Commercial manager", "Finance contact", "HSE manager", "Authorised signatory"],
      },
      { key: "email", label: "Work email", kind: "text", required: true, pattern: "[^@\\s]+@[^@\\s]+\\.[^@\\s]+", hint: "We send bid invitations here" },
      { key: "phone", label: "Phone", kind: "text", required: true },
      { key: "primary", label: "Primary contact?", kind: "yesno", required: true },
    ],
  },
  OWNERS: {
    id: "OWNERS",
    label: "Directors and beneficial owners",
    summary: "Directors and everyone who owns more than 10%",
    mode: "list",
    itemLabel: "Person",
    fieldNoun: "field",
    fields: [
      { key: "name", label: "Full name", kind: "text", required: true },
      { key: "capacity", label: "Capacity", kind: "select", required: true, options: ["Director", "Shareholder", "Ultimate beneficial owner"] },
      { key: "ownership", label: "Ownership %", kind: "text", pattern: "(100|[0-9]{1,2})(\\.[0-9]+)?", hint: "Leave blank for directors who own nothing" },
      { key: "nationality", label: "Nationality", kind: "select", required: true, options: countries },
      { key: "idNo", label: "Passport or national ID no.", kind: "text", required: true },
      { key: "pep", label: "Politically exposed person?", kind: "yesno", required: true, flagOn: "Yes" },
    ],
  },
  DOCUMENTS: {
    id: "DOCUMENTS",
    label: "Document upload",
    summary: "Licences, certificates and declarations we verify",
    mode: "form",
    fieldNoun: "document",
    fields: [
      { key: "tradeLicence", label: "Trade licence", kind: "file", required: true, expiry: true, hint: "Issued by the local authority", wide: true },
      { key: "iso9001", label: "ISO 9001 certificate", kind: "file", required: true, expiry: true, hint: "Quality management", wide: true },
      { key: "iso14001", label: "ISO 14001 certificate", kind: "file", required: true, expiry: true, hint: "Environmental management. Needed for offshore events.", categories: offshore, wide: true },
      { key: "insurance", label: "Insurance certificate", kind: "file", required: true, expiry: true, hint: "P&I and liability cover", wide: true },
      { key: "bankLetter", label: "Bank account letter", kind: "file", required: true, hint: "Issued by your bank in the last 3 months", wide: true },
      { key: "sanctions", label: "Sanctions and conflict declaration", kind: "file", required: true, hint: "Signed by an authorised signatory", wide: true },
      { key: "ownership", label: "Beneficial ownership declaration", kind: "file", required: true, hint: "All owners above 10%", wide: true },
    ],
  },
  QUESTIONNAIRE: {
    id: "QUESTIONNAIRE",
    label: "Compliance questionnaire",
    summary: "Yes or no questions on sanctions, conduct and safety",
    mode: "form",
    fieldNoun: "question",
    fields: [
      { key: "sanctioned", label: "Is the company, an owner or a director on a sanctions list, or based in a sanctioned jurisdiction?", kind: "yesno", required: true, flagOn: "Yes", wide: true },
      { key: "conflict", label: "Does anyone in the company have a conflict of interest with the buyer?", kind: "yesno", required: true, flagOn: "Yes", wide: true },
      { key: "antiBribery", label: "Do you have an anti-bribery and corruption policy in place?", kind: "yesno", required: true, flagOn: "No", wide: true },
      { key: "slavery", label: "Do you publish a modern slavery statement?", kind: "yesno", required: true, flagOn: "No", wide: true },
      { key: "incidents", label: "Have you had a reportable safety incident in the last 3 years?", kind: "yesno", required: true, flagOn: "Yes", categories: offshore, wide: true },
      { key: "subcontract", label: "Do you use subcontractors on contracts?", kind: "yesno", wide: true },
    ],
  },
  VERIFICATION: {
    id: "VERIFICATION",
    label: "Procurement verification",
    summary: "Checks our team completes before approving the vendor",
    mode: "internal",
    fieldNoun: "check",
    fields: [
      { key: "sanctionsScreen", label: "Sanctions screening is clear", kind: "yesno", required: true, wide: true },
      { key: "adverseMedia", label: "Adverse media check has no findings", kind: "yesno", required: true, wide: true },
      { key: "references", label: "Reference checks are positive", kind: "yesno", required: true, wide: true },
      { key: "docsVerified", label: "All documents verified against the issuer", kind: "yesno", required: true, wide: true },
      { key: "decision", label: "Decision", kind: "select", required: true, options: ["Approve for all categories", "Approve for some categories", "Reject"], wide: true },
    ],
  },
};

export const stepTypeList = Object.values(stepTypes);

export type FlowStep = {
  id: string;
  title: string;
  description: string;
  type: StepTypeId;
  required: boolean;
  /** This step's fields. Seeded from the step type, then edited by the admin. */
  fields: FieldDef[];
  /** Vendor categories that see this step. Empty or missing means every category. */
  categories?: string[];
  /** internal steps: who completes it. */
  reviewer?: string;
};

export const newStep = (type: StepTypeId): FlowStep => {
  const t = stepTypes[type];
  return {
    id: `s-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`,
    title: t.label,
    description: defaultDescription[type],
    type,
    required: true,
    fields: t.fields.map((f) => ({ ...f })),
    ...(t.mode === "internal" ? { reviewer: reviewerRoles[0] } : {}),
  };
};

export const defaultDescription: Record<StepTypeId, string> = {
  REGISTRATION: "Tell us about your legal entity.",
  COUNTRY_DETAILS: "Where you are based and operate.",
  BANK_ACCOUNT: "Add the account(s) you want to be paid into.",
  CONTACTS: "Add the people we should contact.",
  OWNERS: "List your directors and everyone who owns more than 10%.",
  DOCUMENTS: "Upload each document. We check them against the issuer.",
  QUESTIONNAIRE: "Answer honestly. Some answers send your application for extra review.",
  VERIFICATION: "Our team completes these checks before approving you.",
};

export const defaultFlow: FlowStep[] = (
  ["REGISTRATION", "COUNTRY_DETAILS", "BANK_ACCOUNT", "CONTACTS", "OWNERS", "DOCUMENTS", "QUESTIONNAIRE", "VERIFICATION"] as StepTypeId[]
).map((type) => ({ ...newStep(type), id: `s-${type.toLowerCase()}` }));

export type Record_ = Record<string, string>;
/** Saved answers per step id: one record for "form" steps, a list for "list" steps. */
export type StepAnswers = Record<string, Record_ | Record_[]>;

/** Steps and fields a vendor of this category sees. Internal steps are never shown to the vendor. */
export function flowForVendor(flow: FlowStep[], category?: string): FlowStep[] {
  const applies = (c?: string[]) => !c || c.length === 0 || (!!category && c.includes(category));
  return flow
    .filter((s) => stepTypes[s.type].mode !== "internal" && applies(s.categories))
    .map((s) => ({ ...s, fields: s.fields.filter((f) => applies(f.categories)) }));
}

/** Problems that stop a flow being saved. */
export function validateFlow(flow: FlowStep[]): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  flow.forEach((s, i) => {
    const name = s.title.trim() || `Step ${i + 1}`;
    if (!s.title.trim()) errors.push(`Step ${i + 1} needs a title.`);
    else if (seen.has(s.title.trim().toLowerCase())) errors.push(`More than one step is called "${s.title.trim()}".`);
    seen.add(s.title.trim().toLowerCase());
    if (!s.description.trim() && stepTypes[s.type].mode !== "internal") errors.push(`"${name}" needs an instruction for the vendor.`);
    if (s.fields.length === 0) errors.push(`"${name}" has no ${stepTypes[s.type].fieldNoun}s.`);
    const labels = new Set<string>();
    s.fields.forEach((f) => {
      const l = f.label.trim().toLowerCase();
      if (!l) errors.push(`"${name}" has a ${stepTypes[s.type].fieldNoun} with no label.`);
      else if (labels.has(l)) errors.push(`"${name}" has two ${stepTypes[s.type].fieldNoun}s called "${f.label.trim()}".`);
      labels.add(l);
      if (f.kind === "select" && (f.options?.length ?? 0) < 2) errors.push(`"${f.label || "A dropdown"}" in "${name}" needs at least two options.`);
    });
  });
  if (flow.length === 0) errors.push("Add at least one step.");
  else if (!flow.some((s) => s.required && stepTypes[s.type].mode !== "internal")) errors.push("Make at least one vendor step required.");
  return errors;
}
