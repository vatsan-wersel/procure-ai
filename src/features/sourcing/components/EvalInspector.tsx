"use client";

import { useEffect, useRef } from "react";
import { Icon } from "@/components/layout/icons";
import type { Evidence, Inspection } from "../evalInspect";

function EvidenceItem({ e }: { e: Evidence }) {
  if (e.kind === "doc") {
    return (
      <li className="ev ev-doc">
        <p className="ev-label">
          <Icon name="file" size={13} />
          Document · {e.source} · {e.page}
        </p>
        <blockquote>{e.quote}</blockquote>
      </li>
    );
  }
  return (
    <li className="ev ev-graph">
      <p className="ev-label">
        <Icon name="sparkles" size={13} />
        Knowledge graph
      </p>
      <ul className="ev-edges">
        {e.edges.map(([from, rel, to]) => (
          <li key={from + rel + to}>
            <span className="ev-node">{from}</span>
            <span className="ev-rel">{rel}</span>
            <span className="ev-node">{to}</span>
          </li>
        ))}
      </ul>
    </li>
  );
}

export function EvalInspector({ item, onClose }: { item: Inspection; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="drawer-root">
      <div className="drawer-scrim" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={item.title}>
        <header className="drawer-head">
          <div>
            <p className="drawer-eyebrow">{item.eyebrow}</p>
            <h2 className="drawer-title">{item.title}</h2>
            <span className={`eval-pill ${item.pill.tone} drawer-pill`}>{item.pill.label}</span>
          </div>
          <button ref={closeRef} type="button" className="icon-action" aria-label="Close" onClick={onClose}>
            <Icon name="close" size={18} />
          </button>
        </header>

        <div className="drawer-body">
          <h3 className="drawer-h">Chain of thought</h3>
          <ol className="eval-steps">
            {item.thoughts.map((t, i) => (
              <li key={t.title} className="eval-step">
                <span className="eval-step-node">{i + 1}</span>
                <div className="eval-step-body">
                  <p className="eval-step-title">{t.title}</p>
                  <p className="eval-step-outcome">{t.text}</p>
                  {t.evidence.length > 0 && (
                    <ul className="ev-list">
                      {t.evidence.map((e, j) => (
                        <EvidenceItem key={j} e={e} />
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </aside>
    </div>
  );
}
