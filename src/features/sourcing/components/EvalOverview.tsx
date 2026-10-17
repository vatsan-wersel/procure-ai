"use client";

import { useState } from "react";
import { Icon } from "@/components/layout/icons";
import { estimate, money, recommendedId, requirements, scored } from "../mockEvaluation";
import { EvalRankDrawer } from "./EvalRankDrawer";

const pct = (n: number) => `${n > 0 ? "+" : ""}${(n * 100).toFixed(1)}%`;

export function EvalOverview() {
  const [picked, setPicked] = useState<string | null>(null);
  const top = scored.find((v) => v.id === recommendedId)!;
  const cheapest = [...scored].sort((a, b) => a.bid - b.bid)[0];

  const stats = [
    { label: "Recommended bid", value: money(top.bid), sub: `${pct(top.deltaVsEstimate)} vs ${money(estimate)} estimate` },
    { label: "Lowest bid", value: money(cheapest.bid), sub: `${cheapest.name} · misses ${cheapest.mandatoryMisses} of ${requirements.length} requirements` },
  ];

  return (
    <div className="eval-stack">
      <div className="eval-top">
        <dl className="eval-stats">
          {stats.map((s) => (
            <div key={s.label} className="eval-stat">
              <dt>{s.label}</dt>
              <dd>{s.value}</dd>
              <p>{s.sub}</p>
            </div>
          ))}
        </dl>

        <section className="eval-reco">
          <div className="reco-head">
            <div>
              <p className="reco-eyebrow">Recommendation · 92% confidence</p>
              <h2 className="reco-name">{top.name}</h2>
            </div>
            <button type="button" className="btn-outline">
              Record recommendation
            </button>
          </div>
          <ul className="reco-points">
            <li>Meets all {requirements.length} requirements</li>
            <li>
              Highest score: {top.total.toFixed(1)} ({(top.total - scored[1].total).toFixed(1)} ahead)
            </li>
            <li>{Math.abs(top.deltaVsEstimate * 100).toFixed(1)}% under the estimate</li>
            <li>Medium risk: class certificate expires Feb 2027</li>
          </ul>
        </section>
      </div>

      <section className="eval-card">
        <h3 className="eval-card-title">Ranking</h3>
        <p className="eval-card-sub">Select a bidder to see why it got its rank and score.</p>
        <ol className="eval-rank">
          {scored.map((v) => (
            <li key={v.id}>
              <button
                type="button"
                className="eval-rank-row"
                onClick={() => setPicked(v.id)}
                aria-label={`Why ${v.name} ranked ${v.rank}`}
              >
                <span className="eval-rank-n">{v.rank}</span>
                <div className="eval-rank-main">
                  <p className="eval-rank-name">
                    {v.name}
                    {v.id === recommendedId && <span className="eval-tag is-good">Recommended</span>}
                    {v.id === cheapest.id && <span className="eval-tag">Lowest bid</span>}
                  </p>
                  <div className="eval-bar" role="img" aria-label={`Weighted score ${v.total.toFixed(1)} out of 100`}>
                    <span className={v.id === recommendedId ? "eval-bar-fill is-top" : "eval-bar-fill"} style={{ width: `${v.total}%` }} />
                  </div>
                </div>
                <div className="eval-rank-num">
                  <strong>{v.total.toFixed(1)}</strong>
                  <span>/ 100</span>
                </div>
                <div className="eval-rank-num">
                  <strong>{money(v.bid)}</strong>
                  <span>{pct(v.deltaVsEstimate)}</span>
                </div>
                <div className="eval-rank-num">
                  <strong>
                    {requirements.length - v.mandatoryMisses}/{requirements.length}
                  </strong>
                  <span>requirements met</span>
                </div>
                <Icon name="right" size={16} />
              </button>
            </li>
          ))}
        </ol>
      </section>

      {picked && <EvalRankDrawer vendor={scored.find((v) => v.id === picked)!} onClose={() => setPicked(null)} />}
    </div>
  );
}
