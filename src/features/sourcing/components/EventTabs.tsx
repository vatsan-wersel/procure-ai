"use client";

import { useState } from "react";
import type { SourcingEvent } from "../data";
import { ApprovalTab } from "./ApprovalTab";
import { AttentionNeeded } from "./AttentionNeeded";
import { CxoBrief } from "./CxoBrief";
import { DecisionLogTab } from "./DecisionLogTab";
import { DocumentsTab } from "./DocumentsTab";
import { EvaluationTab } from "./EvaluationTab";
import { StageTracker } from "./StageTracker";

const tabs = ["Overview", "Documents", "Evaluation", "CXO brief", "Approval", "Decision Log"] as const;
type Tab = (typeof tabs)[number];

export function EventTabs({ event }: { event: SourcingEvent }) {
  const status = event.status;
  const [active, setActive] = useState<Tab>("Overview");

  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = tabs[(i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
    setActive(next);
    document.getElementById(`tab-${next}`)?.focus();
  };

  return (
    <section className="etabs">
      <div className="etabs-list" role="tablist">
        {tabs.map((t, i) => (
          <button
            key={t}
            id={`tab-${t}`}
            type="button"
            role="tab"
            aria-selected={active === t}
            tabIndex={active === t ? 0 : -1}
            className={active === t ? "etab is-active" : "etab"}
            onClick={() => setActive(t)}
            onKeyDown={(e) => onKey(e, i)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="etabs-panel" role="tabpanel" aria-labelledby={`tab-${active}`}>
        {active === "Overview" ? (
          <div className="overview-grid">
            <AttentionNeeded />
            <StageTracker status={status} />
          </div>
        ) : active === "Documents" ? (
          <DocumentsTab />
        ) : active === "Evaluation" ? (
          <EvaluationTab />
        ) : active === "CXO brief" ? (
          <CxoBrief event={event} />
        ) : active === "Approval" ? (
          <ApprovalTab event={event} />
        ) : active === "Decision Log" ? (
          <DecisionLogTab event={event} />
        ) : (
          <p className="etabs-empty">{active} will appear here.</p>
        )}
      </div>
    </section>
  );
}
