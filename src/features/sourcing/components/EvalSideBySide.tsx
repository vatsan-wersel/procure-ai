"use client";

import { useState } from "react";
import { Icon } from "@/components/layout/icons";
import { forRequirement, forScore, type Inspection } from "../evalInspect";
import { gateItems, scoreGroups, scored, type ScoreGroup, type ScoreItem } from "../mockEvaluation";
import { EvalInspector } from "./EvalInspector";

const tones = { Compliant: "is-ok", Partial: "is-warn", "Non-compliant": "is-bad" } as const;
const LABEL_W = 300;
const COL_W = 280;
const cols = {
  gridTemplateColumns: `${LABEL_W}px repeat(${scored.length}, minmax(${COL_W}px, 1fr))`,
  minWidth: LABEL_W + scored.length * COL_W,
};

function Head({ first }: { first: string }) {
  return (
    <div role="row" className="sbs-row sbs-head" style={cols}>
      <span role="columnheader">{first}</span>
      {scored.map((v) => (
        <span key={v.id} role="columnheader">
          {v.name}
        </span>
      ))}
    </div>
  );
}

function ItemRow({ item, group, showPts, open }: { item: ScoreItem; group?: ScoreGroup; showPts: boolean; open: (i: Inspection) => void }) {
  const isReq = /^R\d+$/.test(item.id) && group?.key !== "local";
  return (
    <div role="row" className="sbs-row" style={cols}>
      <span role="cell" className="sbs-label">
        {/^R\d+$/.test(item.id) && <em>{item.id}</em>}
        {item.label}
      </span>
      {scored.map((v) => {
        const c = item.cells[v.id];
        return (
          <button
            key={v.id}
            type="button"
            role="cell"
            className="sbs-cell"
            aria-label={`${item.label}, ${v.name}. Show reasoning`}
            onClick={() => open(isReq ? forRequirement(item.id, v.id) : forScore(group?.key ?? "tech", v.id))}
          >
            <span className="sbs-note">{c.note}</span>
            <span className={`sbs-meta ${c.status ? tones[c.status] : ""}`}>
              {c.status && <i />}
              {c.status ?? "Assessed"}
              {showPts && <b>{c.pts} pts</b>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Section({
  title,
  sub,
  open,
  onToggle,
  children,
}: {
  title: string;
  sub: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className={open ? "eval-card sbs-card is-open" : "eval-card sbs-card"}>
      <button type="button" className="sbs-toggle" aria-expanded={open} onClick={onToggle}>
        <span className="sbs-section-head">
          <h3>{title}</h3>
          <p>{sub}</p>
        </span>
        <Icon name={open ? "up" : "down"} size={18} />
      </button>
      {open && <div className="sbs-body">{children}</div>}
    </section>
  );
}

function GroupBody({ g, open }: { g: ScoreGroup; open: (i: Inspection) => void }) {
  return (
    <>
      <div role="table" className="sbs-table" aria-label={g.name}>
        <Head first="Evaluated" />
        {g.items.map((it) => (
          <ItemRow key={it.id} item={it} group={g} showPts open={open} />
        ))}
        <div role="row" className="sbs-row sbs-total" style={cols}>
          <span role="cell" className="sbs-label">
            Score
          </span>
          {scored.map((v) => (
            <span key={v.id} role="cell" className="sbs-score">
              {v.scores[g.key]}
              <small> / 100 · {v.points[g.key].toFixed(1)} pts</small>
            </span>
          ))}
        </div>
      </div>

      {g.adjustments && (
        <ul className="sbs-adjust">
          {Object.entries(g.adjustments).map(([id, a]) => (
            <li key={id}>
              <b>{scored.find((v) => v.id === id)!.name}</b> {a.pts} points: {a.reason.toLowerCase()}.
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export function EvalSideBySide() {
  const [closed, setClosed] = useState<Set<string>>(new Set());
  const [item, setItem] = useState<Inspection | null>(null);

  const isOpen = (id: string) => !closed.has(id);
  const toggle = (id: string) =>
    setClosed((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  return (
    <div className="sbs">
      {scoreGroups.map((g) => (
        <Section
          key={g.key}
          title={g.name}
          sub={`${g.weight}% of the score · ${g.basis}`}
          open={isOpen(g.key)}
          onToggle={() => toggle(g.key)}
        >
          <GroupBody g={g} open={setItem} />
        </Section>
      ))}

      <Section
        title="Financial gates"
        sub="Pass/fail checks. Flagged for review, but they do not change the score."
        open={isOpen("gates")}
        onToggle={() => toggle("gates")}
      >
        <div role="table" className="sbs-table" aria-label="Financial gates">
          <Head first="Evaluated" />
          {gateItems.map((it) => (
            <ItemRow key={it.id} item={it} showPts={false} open={setItem} />
          ))}
        </div>
      </Section>

      <Section
        title="Summary"
        sub="Weighted points from each criterion, added together."
        open={isOpen("summary")}
        onToggle={() => toggle("summary")}
      >
        <div role="table" className="sbs-table" aria-label="Summary">
          <Head first="Criterion" />
          {scoreGroups.map((g) => (
            <div key={g.key} role="row" className="sbs-row" style={cols}>
              <span role="cell" className="sbs-label">
                {g.name}
                <small>{g.weight}%</small>
              </span>
              {scored.map((v) => (
                <span key={v.id} role="cell" className="sbs-score is-plain">
                  {v.points[g.key].toFixed(1)}
                </span>
              ))}
            </div>
          ))}
          <div role="row" className="sbs-row sbs-total" style={cols}>
            <span role="cell" className="sbs-label">Total</span>
            {scored.map((v) => (
              <span key={v.id} role="cell" className="sbs-score">
                {v.total.toFixed(1)}
                <small> · rank {v.rank}</small>
              </span>
            ))}
          </div>
        </div>
      </Section>

      {item && <EvalInspector item={item} onClose={() => setItem(null)} />}
    </div>
  );
}
