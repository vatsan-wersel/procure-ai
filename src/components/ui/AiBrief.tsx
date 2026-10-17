"use client";

import { useState } from "react";
import { Icon } from "@/components/layout/icons";

export type BriefPoint = { short: string; detail: string };

export function AiBrief({ title, points }: { title: string; points: BriefPoint[] }) {
  const [open, setOpen] = useState(false);

  return (
    <section className={open ? "briefing is-open" : "briefing"}>
      <div className="briefing-bar">
        <span className="briefing-chip">
          <Icon name="sparkles" size={14} />
        </span>
        <h2 className="briefing-title">{title}</h2>
        {!open && <p className="briefing-summary">{points.map((p) => p.short).join(" · ")}</p>}
        <button
          type="button"
          className="briefing-toggle"
          aria-expanded={open}
          aria-label={open ? `Hide ${title.toLowerCase()}` : `Show ${title.toLowerCase()}`}
          onClick={() => setOpen((o) => !o)}
        >
          <Icon name={open ? "up" : "down"} size={16} />
        </button>
      </div>

      {open && (
        <ul className="briefing-list">
          {points.map((p, i) => (
            <li key={p.short}>
              <span className="briefing-n">{i + 1}</span>
              <div>
                <strong>{p.short}</strong>
                <span>{p.detail}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
