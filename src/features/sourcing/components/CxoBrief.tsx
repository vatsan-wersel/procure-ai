"use client";

import { Icon } from "@/components/layout/icons";
import type { SourcingEvent } from "../data";
import { estimate, evalVendors, money, recommendedId, requirements, risks, scored } from "../mockEvaluation";

// Prototype copy — replace with the AI-generated brief and real approval/timeline data.
const nextSteps = [
  { what: "Record the award recommendation", who: "Procurement", when: "Oct 17" },
  { what: "Obtain CPO and Finance Director approval", who: "Approvers", when: "Oct 20" },
  { what: "Issue award letter with the certificate-renewal condition", who: "Procurement", when: "Oct 22" },
  { what: "Sign the framework agreement", who: "Legal", when: "Nov 5" },
];

const vendorName = (id: string) => evalVendors.find((v) => v.id === id)!.name;
const topRisk = (id: string) => {
  const order = ["High", "Medium", "Low"];
  const mine = risks.filter((r) => r.vendorId === id).sort((a, b) => order.indexOf(a.severity) - order.indexOf(b.severity));
  return mine[0]?.severity ?? "None";
};

function useBrief(event: SourcingEvent) {
  const top = scored.find((v) => v.id === recommendedId)!;
  const next = scored[1];
  const cheapest = [...scored].sort((a, b) => a.bid - b.bid)[0];
  const saving = estimate - top.bid;
  const conditions = risks.filter((r) => r.vendorId === top.id);
  const headline = `Approve award to ${top.name} at ${money(top.bid)}`;
  const reasons = [
    `It is the only bid that meets all ${requirements.length} requirements.`,
    `It has the highest weighted score, ${top.total.toFixed(1)}, which is ${(top.total - next.total).toFixed(1)} points ahead of ${next.name}.`,
    `It is ${Math.abs(top.deltaVsEstimate * 100).toFixed(1)}% under the ${money(estimate)} estimate, a saving of $${Math.round(saving / 1000)}K.`,
  ];
  const notCheapest = `${cheapest.name} is $${Math.round((top.bid - cheapest.bid) / 1000)}K cheaper but misses ${cheapest.mandatoryMisses} of ${requirements.length} requirements, including the DP2 fleet, overnight cover and safety record.`;
  const kpis = [
    { label: "Award value", value: money(top.bid), sub: `${money(estimate)} estimate` },
    { label: "Against estimate", value: `${(top.deltaVsEstimate * 100).toFixed(1)}%`, sub: `$${Math.round(saving / 1000)}K saving` },
    { label: "Weighted score", value: top.total.toFixed(1), sub: "out of 100, rank 1 of 3" },
    { label: "Requirements met", value: `${requirements.length - top.mandatoryMisses}/${requirements.length}`, sub: "Only fully compliant bid" },
  ];
  return { top, headline, reasons, notCheapest, kpis, conditions, event };
}

function toMarkdown(b: ReturnType<typeof useBrief>) {
  const { event } = b;
  const lines = [
    `# CXO brief: ${event.title} (${event.id})`,
    `Prepared Oct 16, 2026 · ${event.project} · Event value ${event.value}`,
    "",
    `## Decision requested`,
    `**${b.headline}.**`,
    "",
    ...b.kpis.map((k) => `- ${k.label}: **${k.value}** (${k.sub})`),
    "",
    `## Why this vendor`,
    ...b.reasons.map((r) => `- ${r}`),
    `- Note: ${b.notCheapest}`,
    "",
    `## Bidders compared`,
    `| Bidder | Rank | Score | Price | vs estimate | Requirements met | Highest risk |`,
    `|---|---|---|---|---|---|---|`,
    ...scored.map(
      (v) =>
        `| ${v.name} | ${v.rank} | ${v.total.toFixed(1)} | ${money(v.bid)} | ${(v.deltaVsEstimate * 100).toFixed(1)}% | ${requirements.length - v.mandatoryMisses}/${requirements.length} | ${topRisk(v.id)} |`,
    ),
    "",
    `## Risks and conditions of award`,
    ...b.conditions.map((r) => `- **${r.severity}:** ${r.risk} Condition: ${r.mitigation}`),
    "",
    `## Approval required`,
    `Awards above USD 1M need CPO and Finance Director approval.`,
    "",
    `## Next steps`,
    ...nextSteps.map((s) => `- ${s.when}: ${s.what} (${s.who})`),
    "",
  ];
  return lines.join("\n");
}

export function CxoBrief({ event }: { event: SourcingEvent }) {
  const b = useBrief(event);

  const downloadMd = () => {
    const url = URL.createObjectURL(new Blob([toMarkdown(b)], { type: "text/markdown" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `CXO-brief-${event.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="cxo">
      <div className="cxo-bar">
        <p>One page for the approver. Export it to share or attach to the approval request.</p>
        <div className="cxo-bar-actions">
          <button type="button" className="btn-outline" onClick={downloadMd}>
            <Icon name="download" size={16} />
            Markdown
          </button>
          <button type="button" className="btn-solid" onClick={() => window.print()}>
            <Icon name="download" size={16} />
            Export PDF
          </button>
        </div>
      </div>

      <article className="cxo-sheet">
        <header className="cxo-head">
          <p className="cxo-eyebrow">CXO brief · {event.id} · Prepared Oct 16, 2026</p>
          <h2 className="cxo-title">{event.title}</h2>
          <p className="cxo-meta">
            {event.project} · Created by {event.creator} · Event value {event.value}
          </p>
        </header>

        <section className="cxo-decision">
          <p className="cxo-label">Decision requested</p>
          <h3>{b.headline}</h3>
          <p>Three-year framework agreement. Requires CPO and Finance Director approval.</p>
        </section>

        <dl className="cxo-kpis">
          {b.kpis.map((k) => (
            <div key={k.label}>
              <dt>{k.label}</dt>
              <dd>{k.value}</dd>
              <small>{k.sub}</small>
            </div>
          ))}
        </dl>

        <section className="cxo-section">
          <h3>Why this vendor</h3>
          <ul className="cxo-list">
            {b.reasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          <p className="cxo-note">{b.notCheapest}</p>
        </section>

        <section className="cxo-section">
          <h3>Bidders compared</h3>
          <table className="cxo-table">
            <thead>
              <tr>
                <th>Bidder</th>
                <th>Score</th>
                <th>Price</th>
                <th>Requirements met</th>
                <th>Highest risk</th>
              </tr>
            </thead>
            <tbody>
              {scored.map((v) => (
                <tr key={v.id} className={v.id === recommendedId ? "is-top" : ""}>
                  <td>
                    <span className="cxo-rank">{v.rank}</span>
                    {v.name}
                  </td>
                  <td>{v.total.toFixed(1)}</td>
                  <td>
                    {money(v.bid)} <small>{(v.deltaVsEstimate * 100).toFixed(1)}%</small>
                  </td>
                  <td>
                    {requirements.length - v.mandatoryMisses}/{requirements.length}
                  </td>
                  <td>{topRisk(v.id)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="cxo-section">
          <h3>Risks and conditions of award</h3>
          <ul className="cxo-risks">
            {b.conditions.map((r) => (
              <li key={r.risk}>
                <span className="cxo-sev">{r.severity}</span>
                <div>
                  <p>{r.risk}</p>
                  <small>Condition: {r.mitigation}</small>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="cxo-section">
          <h3>Next steps</h3>
          <ol className="cxo-steps">
            {nextSteps.map((s) => (
              <li key={s.what}>
                <span className="cxo-when">{s.when}</span>
                <span>{s.what}</span>
                <small>{s.who}</small>
              </li>
            ))}
          </ol>
        </section>

        <footer className="cxo-foot">
          Prepared by Procure AI from the evaluation of {scored.length} bids. Scores and reasoning are available in the Evaluation tab.
          Bidders: {scored.map((v) => vendorName(v.id)).join(", ")}.
        </footer>
      </article>
    </div>
  );
}
