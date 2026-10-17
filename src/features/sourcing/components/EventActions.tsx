"use client";

import { useEffect, useRef, useState } from "react";
import { Icon, type IconName } from "@/components/layout/icons";
import { BarsLoader } from "@/components/ui/BarsLoader";
import type { EventStatus } from "../data";

// One primary action per lifecycle stage.
const primaryAction: Record<EventStatus, string> = {
  Draft: "Submit for approval",
  "Pending approval": "Approve",
  Evaluation: "Award event",
  Awarded: "Create contract",
};

type Item = { label: string; icon: IconName; tone?: "muted" | "danger"; submenu?: string[] };

const groups: { label?: string; items: Item[] }[] = [
  {
    label: "Event",
    items: [
      { label: "Export", icon: "download", submenu: ["Excel", "PDF", "Word"] },
      { label: "RFP factsheet", icon: "file" },
    ],
  },
  { items: [{ label: "Archive", icon: "archive", tone: "muted" }] },
  { items: [{ label: "Delete", icon: "trash", tone: "danger" }] },
];

export function EventActions({ status }: { status: EventStatus }) {
  const [open, setOpen] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  // Prototype: stands in for the evaluation job; replace with the real request.
  const evaluate = () => {
    setEvaluating(true);
    setTimeout(() => setEvaluating(false), 4000);
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="event-actions">
      <button type="button" className="btn-solid">
        {primaryAction[status]}
      </button>

      <button type="button" className="btn-outline btn-ai" disabled={evaluating} aria-busy={evaluating} onClick={evaluate}>
        {evaluating ? <BarsLoader size={16} /> : <Icon name="sparkles" size={16} />}
        {evaluating ? "Evaluating…" : "Evaluate"}
      </button>

      <div className="dd event-menu" ref={root}>
        <div className={open ? "split-btn is-open" : "split-btn"}>
          <button
            type="button"
            className="split-main"
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <span className="split-chip">
              <Icon name="more" size={16} />
            </span>
            Actions
          </button>
          <button
            type="button"
            className="split-caret"
            aria-label={open ? "Close actions menu" : "Open actions menu"}
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <Icon name={open ? "up" : "down"} size={16} />
          </button>
        </div>

        {open && (
          <div className="dd-menu event-menu-panel" role="menu">
            {groups.map((g, gi) => (
              <div key={gi} className="menu-group">
                {g.label && <p className="menu-label">{g.label}</p>}
                {g.items.map((it) =>
                  it.submenu ? (
                    <div key={it.label} className="menu-sub">
                      <button type="button" role="menuitem" aria-haspopup="menu" className="menu-item">
                        <Icon name={it.icon} size={16} />
                        {it.label}
                        <span className="menu-chevron">
                          <Icon name="right" size={16} />
                        </span>
                      </button>
                      <div className="menu-sub-panel" role="menu">
                        {it.submenu.map((s) => (
                          <button
                            key={s}
                            type="button"
                            role="menuitem"
                            className="menu-item"
                            onClick={() => setOpen(false)}
                          >
                            <Icon name="file" size={16} />
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <button
                      key={it.label}
                      type="button"
                      role="menuitem"
                      className={`menu-item${it.tone ? ` is-${it.tone}` : ""}`}
                      onClick={() => setOpen(false)}
                    >
                      <Icon name={it.icon} size={16} />
                      {it.label}
                    </button>
                  ),
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
