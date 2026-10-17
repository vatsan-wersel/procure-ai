"use client";

import { useState } from "react";
import { Icon } from "@/components/layout/icons";
import type { SourcingEvent } from "../data";
import { approvals, auditLog, fmtDate, fmtTime, type AuditCategory } from "../mockApproval";

type Filter = "All" | AuditCategory;
const filters: Filter[] = ["All", "Approval", "Evaluation", "Documents", "Event", "AI"];

const csvCell = (v: string) => `"${v.replace(/"/g, '""')}"`;

export function ApprovalTab({ event }: { event: SourcingEvent }) {
  const [filter, setFilter] = useState<Filter>("All");
  const [query, setQuery] = useState("");
  const log = auditLog(event.creator);
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const matches = (e: (typeof log)[number]) => {
    const text = [e.id, e.actor, e.role, e.category, e.action, e.detail ?? "", fmtDate(e.at), fmtTime(e.at)].join(" ").toLowerCase();
    return terms.every((t) => text.includes(t));
  };
  const shown = log.filter((e) => (filter === "All" || e.category === filter) && matches(e));

  const done = approvals.filter((a) => a.status === "Approved").length;
  const waiting = approvals.filter((a) => a.status === "Pending");

  const days = shown.reduce<Record<string, typeof shown>>((acc, e) => {
    (acc[e.at.slice(0, 10)] ??= []).push(e);
    return acc;
  }, {});

  const exportCsv = () => {
    const rows = [
      ["Entry", "Date", "Time", "Actor", "Role", "Category", "Action", "Detail"],
      ...log.map((e) => [e.id, fmtDate(e.at), fmtTime(e.at), e.actor, e.role, e.category, e.action, e.detail ?? ""]),
    ];
    const url = URL.createObjectURL(new Blob([rows.map((r) => r.map(csvCell).join(",")).join("\n")], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${event.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="apv">
      <section className="apv-card">
        <header className="apv-head">
          <div>
            <h3>Approvals</h3>
            <p>
              {done} of {approvals.length} complete
              {waiting.length > 0 && ` · waiting on ${waiting.map((w) => w.role).join(" and ")}`}
            </p>
          </div>
        </header>

        <div className="apv-table" role="table" aria-label="Approvals">
          <div role="row" className="apv-row apv-cols">
            <span role="columnheader">Approved</span>
            <span role="columnheader">By</span>
            <span role="columnheader">Decision</span>
            <span role="columnheader">When</span>
          </div>
          {approvals.map((a) => (
            <div key={a.id} role="row" className="apv-row apv-cols">
              <span role="cell">
                <strong className="apv-what">{a.what}</strong>
                <small>{a.detail}</small>
              </span>
              <span role="cell">
                <strong className="apv-who">{a.approver}</strong>
                <small>{a.role}</small>
              </span>
              <span role="cell">
                <span className={`apv-status is-${a.status.toLowerCase()}`}>
                  <i />
                  {a.status === "Pending" ? "Awaiting decision" : a.status}
                </span>
                {a.comment && <small className="apv-comment">“{a.comment}”</small>}
              </span>
              <span role="cell">
                <strong className="apv-when">{fmtDate(a.at)}</strong>
                <small>{a.status === "Pending" ? `Sent ${fmtTime(a.at)}` : fmtTime(a.at)}</small>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="apv-card">
        <header className="apv-head">
          <div>
            <h3>Audit log</h3>
            <p>
              Every action on {event.id}, newest first · {log.length} entries
            </p>
          </div>
          <button type="button" className="btn-outline" onClick={exportCsv}>
            <Icon name="download" size={16} />
            Export CSV
          </button>
        </header>

        <div className="apv-toolbar">
          <div className="segments apv-filter" role="tablist" aria-label="Filter audit log">
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                role="tab"
                aria-selected={filter === f}
                className={filter === f ? "segment is-active" : "segment"}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <label className="apv-search">
            <Icon name="search" size={16} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by person, action, file or date"
              aria-label="Search audit log"
            />
            {query && (
              <button type="button" className="apv-clear" aria-label="Clear search" onClick={() => setQuery("")}>
                <Icon name="close" size={14} />
              </button>
            )}
          </label>
        </div>
        {(query || filter !== "All") && (
          <p className="apv-count">
            {shown.length} of {log.length} entries
          </p>
        )}

        {Object.keys(days).length === 0 ? (
          <p className="apv-empty">{query ? `No entries match “${query}”.` : `No ${filter.toLowerCase()} entries.`}</p>
        ) : (
          Object.entries(days).map(([day, entries]) => (
            <div key={day} className="apv-day">
              <h4>{fmtDate(day)}</h4>
              <ul className="apv-log">
                {entries.map((e) => (
                  <li key={e.id}>
                    <span className="apv-time">{fmtTime(e.at)}</span>
                    <div className="apv-entry">
                      <p>
                        <strong>{e.actor}</strong> {e.action.charAt(0).toLowerCase() + e.action.slice(1)}
                      </p>
                      {e.detail && <small>{e.detail}</small>}
                      <small className="apv-sub">
                        {e.role} · {e.id}
                      </small>
                    </div>
                    <span className="apv-cat">{e.category}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
