"use client";

import { useState } from "react";
import { Icon, type IconName } from "@/components/layout/icons";
import { forCheck, forRisk, type Inspection } from "../evalInspect";
import { complianceChecks, evalVendors, risks, type Severity } from "../mockEvaluation";
import { EvalInspector } from "./EvalInspector";

const vendorName = (id: string) => evalVendors.find((v) => v.id === id)!.name;
const sevClass: Record<Severity, string> = { High: "is-bad", Medium: "is-warn", Low: "is-ok" };
const resultClass = { Pass: "is-ok", Review: "is-warn", Fail: "is-bad" } as const;
const resultIcon: Record<string, IconName> = { Pass: "check", Review: "eye", Fail: "close" };

export function EvalRisk() {
  const [item, setItem] = useState<Inspection | null>(null);
  const [vendor, setVendor] = useState<string>("all");
  const scoped = vendor === "all" ? risks : risks.filter((r) => r.vendorId === vendor);
  const count = (s: Severity) => scoped.filter((r) => r.severity === s).length;
  const passed = complianceChecks.filter((c) => c.result === "Pass").length;
  const order: Severity[] = ["High", "Medium", "Low"];
  const sorted = [...scoped].sort((a, b) => order.indexOf(a.severity) - order.indexOf(b.severity));

  return (
    <div className="eval-stack">
      <dl className="eval-stats">
        {order.map((s) => (
          <div key={s} className="eval-stat">
            <dt>{s} risks</dt>
            <dd>{count(s)}</dd>
          </div>
        ))}
        <div className="eval-stat">
          <dt>Compliance checks passed</dt>
          <dd>
            {passed}/{complianceChecks.length}
          </dd>
        </div>
      </dl>

      <section className="eval-card">
        <h3 className="eval-card-title">Risk register</h3>
        <p className="eval-card-sub">Risks the score alone does not show. Select one to see the reasoning and evidence.</p>
        <div className="eval-vendor-filter" role="tablist" aria-label="Filter risks by vendor">
          {[{ id: "all", name: "All vendors", n: risks.length }, ...evalVendors.map((v) => ({ id: v.id, name: v.name, n: risks.filter((r) => r.vendorId === v.id).length }))].map((v) => (
            <button key={v.id} type="button" role="tab" aria-selected={vendor === v.id} className={vendor === v.id ? "eval-vchip is-active" : "eval-vchip"} onClick={() => setVendor(v.id)}>
              {v.name}
              <span>{v.n}</span>
            </button>
          ))}
        </div>
        {sorted.length === 0 && <p className="eval-card-sub">No risks flagged for this vendor.</p>}
        <ul className="eval-devs">
          {sorted.map((r) => (
            <li key={r.vendorId + r.risk} className="eval-dev is-click">
              <button type="button" className="eval-click eval-dev-btn" onClick={() => setItem(forRisk(r))}>
                <span className={`eval-pill ${sevClass[r.severity]}`}>{r.severity}</span>
                <div className="eval-dev-main">
                  <p className="eval-dev-title">{r.risk}</p>
                  <p className="eval-dev-diff">
                    <span>{vendorName(r.vendorId)}</span>
                    <span>{r.category}</span>
                  </p>
                  <p className="eval-dev-impact">
                    <b>Mitigation:</b> {r.mitigation}
                  </p>
                </div>
                <Icon name="right" size={16} />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="eval-card">
        <h3 className="eval-card-title">Compliance checks</h3>
        <p className="eval-card-sub">Policy and process checks for this award. Select one to see how it was checked.</p>
        <ul className="eval-checks">
          {complianceChecks.map((c) => (
            <li key={c.name} className="eval-checkrow is-click">
              <button type="button" className="eval-click eval-dev-btn" onClick={() => setItem(forCheck(c))}>
                <span className={`eval-check-icon ${resultClass[c.result]}`}>
                  <Icon name={resultIcon[c.result]} size={14} />
                </span>
                <div className="eval-dev-main">
                  <p className="eval-dev-title">{c.name}</p>
                  <p className="eval-dev-impact">{c.detail}</p>
                </div>
                <span className={`eval-pill ${resultClass[c.result]}`}>{c.result}</span>
                <Icon name="right" size={16} />
              </button>
            </li>
          ))}
        </ul>
      </section>

      {item && <EvalInspector item={item} onClose={() => setItem(null)} />}
    </div>
  );
}
