"use client";

import { useState } from "react";
import { Icon } from "@/components/layout/icons";
import { Dropdown } from "@/components/ui/Dropdown";
import type { SourcingEvent } from "../data";
import { fmtDate, fmtTime } from "../mockApproval";
import { agents, decisions } from "../mockDecisions";

const ALL = "All agents";
const csvCell = (v: string) => `"${v.replace(/"/g, '""')}"`;
const agentName = (id: string) => agents.find((a) => a.id === id)!.name;
const reviewTone = { Reviewed: "is-ok", "Auto-accepted": "is-ok", "Awaiting review": "is-warn", Flagged: "is-bad" } as const;

export function DecisionLogTab({ event }: { event: SourcingEvent }) {
  const [agent, setAgent] = useState(ALL);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Set<string>>(new Set());

  const all = decisions(event.creator);
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const shown = all.filter((d) => {
    if (agent !== ALL && agentName(d.agentId) !== agent) return false;
    const text = [d.id, agentName(d.agentId), d.did, d.result, d.trigger.type, d.trigger.detail, d.inputs.join(" "), d.review.status, d.review.note, fmtDate(d.at)]
      .join(" ")
      .toLowerCase();
    return terms.every((t) => text.includes(t));
  });

  const days = shown.reduce<Record<string, typeof shown>>((acc, d) => {
    (acc[d.at.slice(0, 10)] ??= []).push(d);
    return acc;
  }, {});

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  const exportCsv = () => {
    const rows = [
      ["Run", "Date", "Time", "Agent", "Model", "Did", "Result", "Trigger type", "Trigger", "Inputs", "Confidence", "Seconds", "Review", "Review note"],
      ...all.map((d) => {
        const a = agents.find((x) => x.id === d.agentId)!;
        return [d.id, fmtDate(d.at), fmtTime(d.at), a.name, a.model, d.did, d.result, d.trigger.type, d.trigger.detail, d.inputs.join("; "), `${d.confidence}%`, String(d.seconds), d.review.status, d.review.note];
      }),
    ];
    const url = URL.createObjectURL(new Blob([rows.map((r) => r.map(csvCell).join(",")).join("\n")], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `decision-log-${event.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="apv">
      <section className="apv-card">
        <header className="apv-head">
          <div>
            <h3>AI agents on this event</h3>
            <p>{agents.length} agents ran, each with a single job. Every run is recorded below.</p>
          </div>
        </header>
        <div className="dlog-agents" role="table" aria-label="AI agents">
          <div role="row" className="dlog-agent dlog-agent-head">
            <span role="columnheader">Agent</span>
            <span role="columnheader">What it does</span>
            <span role="columnheader">Model</span>
            <span role="columnheader">Runs</span>
          </div>
          {agents.map((a) => (
            <div key={a.id} role="row" className="dlog-agent">
              <strong role="cell">{a.name}</strong>
              <span role="cell">{a.role}</span>
              <span role="cell" className="dlog-model">{a.model}</span>
              <span role="cell">{all.filter((d) => d.agentId === a.id).length}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="apv-card">
        <header className="apv-head">
          <div>
            <h3>Decision log</h3>
            <p>
              What each AI agent did, how it was triggered and who reviewed it · {all.length} runs
            </p>
          </div>
          <div className="dlog-actions">
            <button type="button" className="btn-outline" onClick={() => setOpen(open.size === shown.length ? new Set() : new Set(shown.map((d) => d.id)))}>
              {open.size === shown.length && shown.length > 0 ? "Collapse all" : "Expand all"}
            </button>
            <button type="button" className="btn-outline" onClick={exportCsv}>
              <Icon name="download" size={16} />
              Export CSV
            </button>
          </div>
        </header>

        <div className="apv-toolbar">
          <div className="dlog-agent-filter">
            <Dropdown value={agent} onChange={setAgent} options={[ALL, ...agents.map((a) => a.name)]} placeholder={ALL} />
          </div>
          <label className="apv-search">
            <Icon name="search" size={16} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by agent, action, trigger or file"
              aria-label="Search decision log"
            />
            {query && (
              <button type="button" className="apv-clear" aria-label="Clear search" onClick={() => setQuery("")}>
                <Icon name="close" size={14} />
              </button>
            )}
          </label>
        </div>
        {(query || agent !== ALL) && (
          <p className="apv-count">
            {shown.length} of {all.length} runs
          </p>
        )}

        {shown.length === 0 ? (
          <p className="apv-empty">No runs match.</p>
        ) : (
          Object.entries(days).map(([day, runs]) => (
            <div key={day} className="apv-day">
              <h4>{fmtDate(day)}</h4>
              <ul className="dlog-list">
                {runs.map((d) => {
                  const isOpen = open.has(d.id);
                  const a = agents.find((x) => x.id === d.agentId)!;
                  return (
                    <li key={d.id}>
                      <button type="button" className="dlog-head" aria-expanded={isOpen} onClick={() => toggle(d.id)}>
                        <span className="apv-time">{fmtTime(d.at)}</span>
                        <span className="dlog-main">
                          <span className="dlog-title">
                            <strong>{a.name}</strong> {d.did.charAt(0).toLowerCase() + d.did.slice(1)}
                          </span>
                          <small>
                            Triggered by {d.trigger.detail.charAt(0).toLowerCase() + d.trigger.detail.slice(1)}
                          </small>
                        </span>
                        <span className={`dlog-review ${reviewTone[d.review.status]}`}>
                          <i />
                          {d.review.status}
                        </span>
                        <Icon name={isOpen ? "up" : "down"} size={16} />
                      </button>

                      {isOpen && (
                        <dl className="dlog-detail">
                          <div>
                            <dt>Result</dt>
                            <dd>{d.result}</dd>
                          </div>
                          <div>
                            <dt>How it was triggered</dt>
                            <dd>
                              {d.trigger.type}: {d.trigger.detail}
                            </dd>
                          </div>
                          <div>
                            <dt>What it used</dt>
                            <dd>
                              <ul>
                                {d.inputs.map((i) => (
                                  <li key={i}>{i}</li>
                                ))}
                              </ul>
                            </dd>
                          </div>
                          <div>
                            <dt>Human review</dt>
                            <dd>{d.review.note}</dd>
                          </div>
                          <div>
                            <dt>Run details</dt>
                            <dd className="dlog-meta">
                              {d.id} · {a.model} · {d.confidence}% confidence · {d.seconds} s
                            </dd>
                          </div>
                        </dl>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
