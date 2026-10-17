"use client";

import { useState } from "react";
import "@/styles/evaluation.css";
import { EvalComparison } from "./EvalComparison";
import { EvalOverview } from "./EvalOverview";
import { EvalRisk } from "./EvalRisk";
import { EvalSideBySide } from "./EvalSideBySide";

const segments = ["Overview", "Comparison and deviation", "Side by side", "Risk and compliance"] as const;
type Segment = (typeof segments)[number];

export function EvaluationTab() {
  const [active, setActive] = useState<Segment>("Overview");

  return (
    <div className="eval">
      <div className="segments eval-segments" role="tablist" aria-label="Evaluation">
        {segments.map((s) => (
          <button
            key={s}
            type="button"
            role="tab"
            aria-selected={active === s}
            className={active === s ? "segment is-active" : "segment"}
            onClick={() => setActive(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {active === "Overview" ? (
        <EvalOverview />
      ) : active === "Comparison and deviation" ? (
        <EvalComparison />
      ) : active === "Side by side" ? (
        <EvalSideBySide />
      ) : (
        <EvalRisk />
      )}
    </div>
  );
}
