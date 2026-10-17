// Turns a clicked item (requirement answer, deviation, risk, check, score) into
// a chain of thought where every step cites a document or the knowledge graph.
import {
  complianceChecks,
  criteria,
  evalVendors,
  requirements,
  risks,
  scoreWhy,
  scored,
  type ComplianceCheck,
  type Deviation,
  type RiskItem,
  type Status,
} from "./mockEvaluation";
import {
  bidDoc,
  checkEvidence,
  criterionDocs,
  devExtra,
  extraDocs,
  graphFacts,
  riskEvidence,
  tenderRef,
} from "./mockEvidence";

export type Evidence =
  | { kind: "doc"; source: string; page: string; quote: string }
  | { kind: "graph"; edges: [string, string, string][] };

export type Thought = { title: string; text: string; evidence: Evidence[] };

export type Inspection = {
  eyebrow: string;
  title: string;
  pill: { label: string; tone: "is-ok" | "is-warn" | "is-bad" };
  thoughts: Thought[];
};

const vendorName = (id: string) => evalVendors.find((v) => v.id === id)!.name;
const tone = { Compliant: "is-ok", Partial: "is-warn", "Non-compliant": "is-bad", High: "is-bad", Medium: "is-warn", Low: "is-ok", Pass: "is-ok", Review: "is-warn", Fail: "is-bad" } as const;
const graphOf = (list: Evidence[]) => list.filter((e) => e.kind === "graph");
const docsOf = (list: Evidence[]) => list.filter((e) => e.kind === "doc");

const verdict: Record<Status, string> = {
  Compliant: "The offer meets or exceeds the requirement, so it is marked compliant.",
  Partial: "Part of the requirement is met and part is not, so it is marked partial.",
  "Non-compliant": "The offer does not meet the requirement, so it is marked non-compliant.",
};

export function forRequirement(reqId: string, vendorId: string): Inspection {
  const req = requirements.find((r) => r.id === reqId)!;
  const res = req.responses[vendorId];
  const ref = tenderRef[reqId];
  const name = vendorName(vendorId);
  return {
    eyebrow: `${reqId} · ${name}`,
    title: req.text,
    pill: { label: res.status, tone: tone[res.status] },
    thoughts: [
      {
        title: "What the tender requires",
        text: `Read the requirement and its pass mark from the tender: ${req.text.toLowerCase()}.`,
        evidence: [{ kind: "doc", source: ref.source, page: ref.page, quote: req.text }],
      },
      {
        title: `What ${name} offered`,
        text: `Found the bidder's answer in its bid and read it with OCR: ${res.note}.`,
        evidence: [
          { kind: "doc", source: bidDoc[vendorId], page: "p.2, compliance matrix", quote: `${reqId}: ${res.note}` },
          ...(extraDocs[`${reqId}:${vendorId}`] ?? []),
        ],
      },
      {
        title: "Checked against known facts",
        text: "Looked up the claim in the knowledge graph to confirm the answer is backed by certificates, fleet data and records, not just the bid text.",
        evidence: [{ kind: "graph", edges: graphFacts[reqId][vendorId] }],
      },
      { title: "Verdict", text: `${verdict[res.status]} ${res.status === "Compliant" ? "" : `Gap: ${res.note}.`}`.trim(), evidence: [] },
    ],
  };
}

export function forDeviation(d: Deviation): Inspection {
  const name = vendorName(d.vendorId);
  const reqId = /\((R\d+)\)/.exec(d.area)?.[1];
  const extra = devExtra[d.area];
  const reqAnswer = reqId ? forRequirement(reqId, d.vendorId).thoughts : null;
  return {
    eyebrow: `Deviation · ${name}`,
    title: d.area,
    pill: { label: `${d.severity} severity`, tone: tone[d.severity] },
    thoughts: [
      {
        title: "What the tender asked for",
        text: d.tender,
        evidence: reqAnswer ? [reqAnswer[0].evidence[0]] : extra ? [extra.tender] : [],
      },
      {
        title: "What the bidder offered instead",
        text: d.offered,
        evidence: reqAnswer ? reqAnswer[1].evidence : extra ? [extra.bid] : [],
      },
      {
        title: "Confirmed in the knowledge graph",
        text: "Compared the two positions and checked the bidder's record for any supporting fact that would change the picture.",
        evidence: reqAnswer ? reqAnswer[2].evidence : extra ? [extra.graph] : [],
      },
      { title: `Why it is rated ${d.severity.toLowerCase()}`, text: d.impact, evidence: [] },
    ],
  };
}

export function forRisk(r: RiskItem): Inspection {
  const ev = riskEvidence[risks.indexOf(r)] ?? [];
  return {
    eyebrow: `${r.category} risk · ${vendorName(r.vendorId)}`,
    title: r.risk,
    pill: { label: `${r.severity} severity`, tone: tone[r.severity] },
    thoughts: [
      { title: "Where the risk was found", text: "Spotted while reading the bid and comparing it with the tender.", evidence: docsOf(ev) },
      { title: "Related facts in the knowledge graph", text: "Linked the finding to what is already known about the vendor, so the risk is judged in context.", evidence: graphOf(ev) },
      { title: `Why it is rated ${r.severity.toLowerCase()}`, text: `Weighed the likelihood and cost of the issue for a ${r.category.toLowerCase()} risk on this award.`, evidence: [] },
      { title: "Suggested mitigation", text: r.mitigation, evidence: [] },
    ],
  };
}

export function forCheck(c: ComplianceCheck): Inspection {
  const ev = checkEvidence[complianceChecks.indexOf(c)] ?? [];
  return {
    eyebrow: "Compliance check",
    title: c.name,
    pill: { label: c.result, tone: tone[c.result] },
    thoughts: [
      { title: "What was checked", text: c.detail, evidence: docsOf(ev) },
      { title: "Matched against policy and records", text: "Compared the finding with the procurement policy and the facts held in the knowledge graph.", evidence: graphOf(ev) },
      {
        title: "Result",
        text:
          c.result === "Pass"
            ? "The check passed; no action is needed."
            : c.result === "Review"
              ? "The check cannot be closed automatically; a person needs to confirm it before award."
              : "The check failed; this blocks the bid unless the gap is closed.",
        evidence: [],
      },
    ],
  };
}

export function forScore(criterionKey: string, vendorId: string): Inspection {
  const c = criteria.find((x) => x.key === criterionKey)!;
  const v = scored.find((s) => s.id === vendorId)!;
  const score = v.scores[criterionKey];
  return {
    eyebrow: `${c.name} · ${v.name}`,
    title: `Scored ${score} out of 100`,
    pill: { label: `${((score * c.weight) / 100).toFixed(1)} of ${c.weight} points`, tone: score >= 80 ? "is-ok" : score >= 65 ? "is-warn" : "is-bad" },
    thoughts: [
      { title: "How this criterion is scored", text: `${c.name} carries ${c.weight}% of the total. Basis: ${c.basis}.`, evidence: [{ kind: "doc", source: "RFP_Marine_Logistics_Framework.pdf", page: "p.3, §4", quote: `${c.name}: ${c.weight}%` }] },
      { title: "Evidence read from the bid", text: "Pulled the figures that drive this score from the bid documents and the knowledge graph.", evidence: criterionDocs[criterionKey](vendorId) },
      { title: "Why this number", text: scoreWhy[vendorId][criterionKey], evidence: [] },
    ],
  };
}

export { docsOf, graphOf };
