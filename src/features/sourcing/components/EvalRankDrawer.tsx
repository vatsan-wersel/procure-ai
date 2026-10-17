"use client";

import { useEffect, useRef } from "react";
import { Icon } from "@/components/layout/icons";
import { criteria, estimate, money, recommendedId, requirements, risks, scoreWhy, scored, type Scored } from "../mockEvaluation";

const sevClass = { High: "is-bad", Medium: "is-warn", Low: "is-ok" } as const;
const critColor: Record<string, string> = { tech: "#2f6bf0", comm: "#7a5af8", hse: "#12a594", local: "#e08a00" };
const ordinal = ["", "first", "second", "third"];

export function EvalRankDrawer({ vendor, onClose }: { vendor: Scored; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const leader = scored[0];
  const misses = requirements.filter((r) => r.responses[vendor.id].status !== "Compliant");
  const vRisks = risks.filter((r) => r.vendorId === vendor.id);
  const rows = criteria.map((c) => ({ ...c, score: vendor.scores[c.key], points: vendor.points[c.key] }));
  const best = [...rows].sort((a, b) => b.score - a.score)[0];
  const worst = [...rows].sort((a, b) => a.score - b.score)[0];
  const recommended = scored.find((s) => s.id === recommendedId)!;

  const headline =
    vendor.rank === 1
      ? `Ranked first, ${(vendor.total - scored[1].total).toFixed(1)} points ahead of ${scored[1].name}.`
      : `Ranked ${ordinal[vendor.rank]}, ${(leader.total - vendor.total).toFixed(1)} points behind ${leader.name}.`;

  const facts = [
    { label: "Bid price", value: money(vendor.bid), sub: `${Math.abs(vendor.deltaVsEstimate * 100).toFixed(1)}% ${vendor.deltaVsEstimate < 0 ? "under" : "over"} estimate` },
    { label: "Requirements", value: `${requirements.length - misses.length}/${requirements.length}`, sub: misses.length ? `${misses.length} not fully met` : "All met" },
    { label: "Open risks", value: String(vRisks.length), sub: `${vRisks.filter((r) => r.severity === "High").length} high` },
  ];

  return (
    <div className="drawer-root">
      <div className="drawer-scrim" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={`Why ${vendor.name} scored ${vendor.total.toFixed(1)}`}>
        <header className="drawer-head">
          <div>
            <p className="drawer-eyebrow">
              Rank {vendor.rank} of {scored.length}
              {vendor.id === recommendedId && <span className="eval-tag is-good">Recommended</span>}
            </p>
            <h2 className="drawer-title">{vendor.name}</h2>
          </div>
          <button ref={closeRef} type="button" className="icon-action" aria-label="Close" onClick={onClose}>
            <Icon name="close" size={18} />
          </button>
        </header>

        <div className="drawer-body">
          <section className="drawer-score">
            <div className="drawer-score-top">
              <strong>{vendor.total.toFixed(1)}</strong>
              <span>out of 100</span>
            </div>
            <p>{headline}</p>
            <div className="drawer-stack" role="img" aria-label="Points contributed by each criterion">
              {rows.map((r) => (
                <span key={r.key} style={{ width: `${r.points}%`, background: critColor[r.key] }} title={`${r.name}: ${r.points.toFixed(1)}`} />
              ))}
            </div>
            <ul className="drawer-legend">
              {rows.map((r) => (
                <li key={r.key}>
                  <i style={{ background: critColor[r.key] }} />
                  {r.name.split(" ")[0]} <b>{r.points.toFixed(1)}</b>
                </li>
              ))}
            </ul>
          </section>

          <dl className="drawer-facts">
            {facts.map((f) => (
              <div key={f.label}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
                <small>{f.sub}</small>
              </div>
            ))}
          </dl>

          <section>
            <h3 className="drawer-h">How the score adds up</h3>
            <p className="drawer-lede">
              Strongest on <b>{best.name.toLowerCase()}</b> ({best.score}), weakest on <b>{worst.name.toLowerCase()}</b> ({worst.score}).
              {vendor.id !== recommendedId && vendor.bid < recommended.bid && " Cheaper than the recommended bid, but price is only 35% of the score."}
            </p>
            <ul className="drawer-crit">
              {rows.map((r) => (
                <li key={r.key} className="crit-card">
                  <div className="crit-top">
                    <span className="crit-name">
                      <i style={{ background: critColor[r.key] }} />
                      {r.name}
                    </span>
                    <span className="crit-weight">{r.weight}% weight</span>
                  </div>
                  <div className="crit-score">
                    <strong>{r.score}</strong>
                    <span>/ 100</span>
                    <em>
                      {r.score} × {r.weight}% = <b>{r.points.toFixed(1)}</b> points
                    </em>
                  </div>
                  <div className="eval-bar">
                    <span className="eval-bar-fill" style={{ width: `${r.score}%`, background: critColor[r.key] }} />
                  </div>
                  <p className="crit-why">{scoreWhy[vendor.id][r.key]}</p>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="drawer-h">
              Price against the estimate
            </h3>
            <p className="drawer-p">
              {money(vendor.bid)} is {Math.abs(vendor.deltaVsEstimate * 100).toFixed(1)}% {vendor.deltaVsEstimate < 0 ? "under" : "over"} the{" "}
              {money(estimate)} estimate.
            </p>
          </section>

          <section>
            <h3 className="drawer-h">Requirements not fully met</h3>
            {misses.length === 0 ? (
              <p className="drawer-ok">
                <Icon name="check" size={16} />
                Meets every requirement.
              </p>
            ) : (
              <ul className="drawer-list">
                {misses.map((r) => (
                  <li key={r.id}>
                    <span className={`eval-pill ${r.responses[vendor.id].status === "Partial" ? "is-warn" : "is-bad"}`}>
                      {r.responses[vendor.id].status}
                    </span>
                    <span>
                      <b>{r.id}</b> {r.text}
                      <small>{r.responses[vendor.id].note}</small>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {vRisks.length > 0 && (
            <section>
              <h3 className="drawer-h">Risks that affected the ranking</h3>
              <ul className="drawer-list">
                {vRisks.map((r) => (
                  <li key={r.risk}>
                    <span className={`eval-pill ${sevClass[r.severity]}`}>{r.severity}</span>
                    <span>
                      {r.risk}
                      <small>Mitigation: {r.mitigation}</small>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </aside>
    </div>
  );
}
