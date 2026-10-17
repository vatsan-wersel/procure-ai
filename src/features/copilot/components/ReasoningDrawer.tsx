"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Icon } from "@/components/layout/icons";
import type { Answer, Citation } from "@/features/dashboard/ask";
import "@/styles/evaluation.css";

/** The side panel that explains how an answer was built: the chain of thought, then the records behind it. */
export function ReasoningDrawer({ question, answer, onClose }: { question: string; answer: Answer; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const byId = new Map(answer.citations.map((c, i) => [c.id, { c, n: i + 1 }]));

  return (
    <div className="drawer-root">
      <div className="drawer-scrim" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label="How this answer was built">
        <header className="drawer-head">
          <div>
            <p className="drawer-eyebrow">How this answer was built</p>
            <h2 className="drawer-title cpl-drawer-q">{question}</h2>
          </div>
          <button ref={closeRef} type="button" className="icon-action" aria-label="Close" onClick={onClose}>
            <Icon name="close" size={18} />
          </button>
        </header>

        <div className="drawer-body">
          <section className="drawer-score">
            <p className="cpl-drawer-answer">{answer.text}</p>
          </section>

          <section>
            <h3 className="drawer-h">Chain of thought</h3>
            <ol className="vt-chain">
              {answer.steps.map((s, i) => (
                <li key={s.title} className={i === answer.steps.length - 1 ? "is-last" : undefined}>
                  <span className="vt-chain-n">{i + 1}</span>
                  <div>
                    <strong>{s.title}</strong>
                    <p>{s.detail}</p>
                    {s.cites && s.cites.length > 0 && (
                      <div className="cpl-step-cites">
                        {s.cites.map((id) => {
                          const hit = byId.get(id);
                          return hit ? (
                            <Link key={id} href={hit.c.href} className="cpl-chip" title={hit.c.label}>
                              <b>{hit.n}</b>
                              {id}
                            </Link>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {answer.citations.length > 0 && (
            <section>
              <h3 className="drawer-h">Sources</h3>
              <ul className="cpl-sources-list">
                {answer.citations.map((c, i) => (
                  <li key={c.id}>
                    <SourceCard cite={c} n={i + 1} />
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

function SourceCard({ cite, n }: { cite: Citation; n: number }) {
  return (
    <Link href={cite.href} className="cpl-source">
      <span className="cpl-source-n">{n}</span>
      <span className="cpl-source-text">
        <strong>
          {cite.id} · {cite.label}
        </strong>
        <small>{cite.detail}</small>
      </span>
      <span className="cpl-source-go">
        Open {cite.kind.toLowerCase()}
        <Icon name="arrow" size={14} />
      </span>
    </Link>
  );
}
