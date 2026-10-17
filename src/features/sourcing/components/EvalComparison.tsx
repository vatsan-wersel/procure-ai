"use client";

import { useState } from "react";
import { Icon } from "@/components/layout/icons";
import { forDeviation, forRequirement, forScore, type Inspection } from "../evalInspect";
import { criteria, deviations, evalVendors, money, requirements, scored, type Severity } from "../mockEvaluation";
import { EvalInspector } from "./EvalInspector";

const vendorName = (id: string) => evalVendors.find((v) => v.id === id)!.name;
const statusClass = { Compliant: "is-ok", Partial: "is-warn", "Non-compliant": "is-bad" } as const;
const sevClass: Record<Severity, string> = { High: "is-bad", Medium: "is-warn", Low: "is-ok" };

type Filter = "All" | Severity;
const filters: Filter[] = ["All", "High", "Medium", "Low"];

export function EvalComparison() {
  const [filter, setFilter] = useState<Filter>("All");
  const [item, setItem] = useState<Inspection | null>(null);
  const shown = deviations.filter((d) => filter === "All" || d.severity === filter);
  const reqCols = {
    gridTemplateColumns: `300px repeat(${scored.length}, minmax(280px, 1fr))`,
    minWidth: 300 + scored.length * 280,
  };
  const cols = { gridTemplateColumns: `minmax(0, 1.4fr) repeat(${scored.length}, minmax(0, 1fr))` };

  return (
    <div className="eval-stack">
      <section className="eval-card">
        <h3 className="eval-card-title">Scorecard</h3>
        <p className="eval-card-sub">Scores out of 100, weighted by the tender criteria. Select a score to see the reasoning and evidence.</p>
        <div className="eval-grid" style={cols} role="table" aria-label="Scorecard">
          <div className="eval-grid-head" role="row" style={{ display: "contents" }}>
            <span role="columnheader">Criterion</span>
            {scored.map((v) => (
              <span key={v.id} role="columnheader">{v.name}</span>
            ))}
          </div>
          {criteria.map((c) => {
            const best = Math.max(...scored.map((s) => s.scores[c.key]));
            return (
              <div key={c.key} role="row" style={{ display: "contents" }}>
                <span role="cell" className="eval-grid-label">
                  {c.name} <em>{c.weight}%</em>
                </span>
                {scored.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    role="cell"
                    className={v.scores[c.key] === best ? "eval-cell eval-click is-best" : "eval-cell eval-click"}
                    aria-label={`${c.name}, ${v.name}: ${v.scores[c.key]}. Show reasoning`}
                    onClick={() => setItem(forScore(c.key, v.id))}
                  >
                    {v.scores[c.key]}
                  </button>
                ))}
              </div>
            );
          })}
          <div role="row" style={{ display: "contents" }}>
            <span role="cell" className="eval-grid-label is-total">Weighted total</span>
            {scored.map((v) => (
              <span key={v.id} role="cell" className="eval-cell is-total">{v.total.toFixed(1)}</span>
            ))}
          </div>
          <div role="row" style={{ display: "contents" }}>
            <span role="cell" className="eval-grid-label">Bid price</span>
            {scored.map((v) => (
              <span key={v.id} role="cell" className="eval-cell">{money(v.bid)}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="eval-card is-spacious">
        <h3 className="eval-card-title">Requirement compliance</h3>
        <p className="eval-card-sub">Bid responses against each requirement. Select an answer to see how it was judged.</p>
        <div role="table" className="sbs-table" aria-label="Requirement compliance">
          <div role="row" className="sbs-row sbs-head" style={reqCols}>
            <span role="columnheader">Requirement</span>
            {scored.map((v) => (
              <span key={v.id} role="columnheader">{v.name}</span>
            ))}
          </div>
          {requirements.map((r) => (
            <div key={r.id} role="row" className="sbs-row" style={reqCols}>
              <span role="cell" className="sbs-label">
                <em>{r.id}</em>
                {r.text}
              </span>
              {scored.map((v) => {
                const res = r.responses[v.id];
                return (
                  <button
                    key={v.id}
                    type="button"
                    role="cell"
                    className="sbs-cell"
                    aria-label={`${r.id}, ${v.name}: ${res.status}. Show reasoning`}
                    onClick={() => setItem(forRequirement(r.id, v.id))}
                  >
                    <span className="sbs-note">{res.note}</span>
                    <span className={`sbs-meta ${statusClass[res.status]}`}>
                      <i />
                      {res.status}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </section>

      <section className="eval-card">
        <div className="eval-card-bar">
          <div>
            <h3 className="eval-card-title">Deviations from the tender</h3>
            <p className="eval-card-sub">Where a bid differs from what the tender asked for. Select one to see the evidence.</p>
          </div>
          <div className="segments" role="tablist" aria-label="Filter deviations by severity">
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                role="tab"
                aria-selected={filter === f}
                className={filter === f ? "segment is-active" : "segment"}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <ul className="eval-devs">
          {shown.map((d) => (
            <li key={d.vendorId + d.area} className="eval-dev is-click">
              <button type="button" className="eval-click eval-dev-btn" onClick={() => setItem(forDeviation(d))}>
                <span className={`eval-pill ${sevClass[d.severity]}`}>{d.severity}</span>
                <div className="eval-dev-main">
                  <p className="eval-dev-title">
                    {d.area} <span>· {vendorName(d.vendorId)}</span>
                  </p>
                  <p className="eval-dev-diff">
                    <span>Tender: {d.tender}</span>
                    <span>Offered: {d.offered}</span>
                  </p>
                  <p className="eval-dev-impact">{d.impact}</p>
                </div>
                <Icon name="right" size={16} />
              </button>
            </li>
          ))}
          {shown.length === 0 && <li className="eval-empty">No {filter.toLowerCase()} deviations.</li>}
        </ul>
      </section>

      {item && <EvalInspector item={item} onClose={() => setItem(null)} />}
    </div>
  );
}
