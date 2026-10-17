"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/layout/icons";
import { currentApprover, queue as seed, type QueueItem, type QueueStatus } from "../mockApprovalQueue";
import { fmtDate, fmtTime } from "../mockApproval";

type Segment = "Awaiting me" | "All" | QueueStatus;
const segments: Segment[] = ["Awaiting me", "All", "Approved", "Rejected"];

const stamp = (at: string) => `${fmtDate(at)} · ${fmtTime(at)}`;
const nowStamp = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

const isMine = (a: QueueItem) => a.status === "Pending" && a.approver === currentApprover;
const chipFor = (s: QueueStatus) => (s === "Pending" ? "pending-approval" : s === "Approved" ? "approved" : "blocked");

export function ApprovalsList() {
  const [items, setItems] = useState(seed);
  const [segment, setSegment] = useState<Segment>("Awaiting me");
  const [query, setQuery] = useState("");
  const [rejecting, setRejecting] = useState<QueueItem | null>(null);
  const [reason, setReason] = useState("");

  const q = query.trim().toLowerCase();
  const rows = items.filter(
    (a) =>
      (segment === "All" || (segment === "Awaiting me" ? isMine(a) : a.status === segment)) &&
      (!q || [a.what, a.eventTitle, a.eventId, a.requestedBy, a.approver].some((v) => v.toLowerCase().includes(q))),
  );
  const count = (s: Segment) =>
    s === "All" ? items.length : s === "Awaiting me" ? items.filter(isMine).length : items.filter((a) => a.status === s).length;

  const decide = (id: string, status: QueueStatus, why?: string) =>
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, status, decidedAt: nowStamp(), reason: why } : a)));

  const closeDialog = () => {
    setRejecting(null);
    setReason("");
  };

  useEffect(() => {
    if (!rejecting) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDialog();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [rejecting]);

  return (
    <section className="etable">
      <div className="etable-toolbar">
        <div className="segments" role="tablist">
          {segments.map((s) => (
            <button
              key={s}
              type="button"
              role="tab"
              aria-selected={segment === s}
              className={segment === s ? "segment is-active" : "segment"}
              onClick={() => setSegment(s)}
            >
              {s}
              <span className="segment-count">{count(s)}</span>
            </button>
          ))}
        </div>
        <label className="search etable-search">
          <Icon name="search" size={16} />
          <input type="search" placeholder="Search approvals" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
      </div>

      <div className="apt-wrap">
        <table className="apt">
          <colgroup>
            <col style={{ width: "34%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: 296 }} />
          </colgroup>
          <thead>
            <tr>
              <th>Request</th>
              <th>Requested by</th>
              <th>Approver</th>
              <th>Submitted</th>
              <th className="apt-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id}>
                <td>
                  <div className="apt-cell">
                    <strong className="apt-trunc" title={a.what}>
                      {a.what}
                    </strong>
                    <Link
                      href={`/admin/sourcing-events/${a.eventId}`}
                      className="apl-event apt-trunc"
                      title={`${a.eventTitle} · ${a.eventId} · ${a.value}`}
                    >
                      {a.eventTitle} · {a.eventId} · {a.value}
                    </Link>
                    {a.reason && a.status !== "Pending" && (
                      <span className="apl-reason apt-trunc" title={a.reason}>
                        “{a.reason}”
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <span className="apt-trunc tbl-muted" title={a.requestedBy}>
                    {a.requestedBy}
                  </span>
                </td>
                <td>
                  <div className="apt-cell">
                    <span className="apt-trunc" title={a.approver}>
                      {a.approver}
                    </span>
                    <small className="apt-sub apt-trunc" title={a.approverRole}>
                      {a.approverRole}
                    </small>
                  </div>
                </td>
                <td>
                  <div className="apt-cell">
                    <span className="tbl-muted apt-trunc">{fmtDate(a.submittedAt)}</span>
                    <small className="apt-sub apt-trunc">{fmtTime(a.submittedAt)}</small>
                  </div>
                </td>
                <td>
                  <div className="apl-actions">
                    <Link href={`/admin/sourcing-events/${a.eventId}`} className="btn-outline apl-btn">
                      <Icon name="external" size={14} />
                      Open event
                    </Link>
                    {isMine(a) && (
                      <>
                        <button type="button" className="btn-outline apl-btn apl-reject" onClick={() => setRejecting(a)}>
                          Reject
                        </button>
                        <button type="button" className="btn-solid apl-btn" onClick={() => decide(a.id, "Approved")}>
                          <Icon name="check" size={14} />
                          Approve
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length === 0 && (
          <p className="tbl-empty">
            {segment === "Awaiting me" && !q ? "Nothing is waiting for your approval." : "No approvals match."}
          </p>
        )}
      </div>

      {rejecting && (
        <div className="apl-overlay" onClick={closeDialog}>
          <form
            className="apl-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="apl-title"
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              decide(rejecting.id, "Rejected", reason.trim());
              closeDialog();
            }}
          >
            <h3 id="apl-title">Reject {rejecting.what.toLowerCase()}</h3>
            <p>
              {rejecting.eventTitle} · {rejecting.eventId}. {rejecting.requestedBy} will see your reason.
            </p>
            <label htmlFor="apl-reason">Reason for rejection</label>
            <textarea
              id="apl-reason"
              className="ftext"
              rows={4}
              required
              autoFocus
              placeholder="Explain what needs to change before this can be approved"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="apl-dialog-actions">
              <button type="button" className="btn-outline" onClick={closeDialog}>
                Cancel
              </button>
              <button type="submit" className="btn-solid apl-danger" disabled={!reason.trim()}>
                Reject
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
