"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/layout/icons";
import { criteria, requirements } from "@/features/sourcing/mockEvaluation";
import { bidSlots, submittedBid, tenderDocs, type PortalEvent } from "../data";

const MAX = 10 * 1024 * 1024;
const size = (b: number) => (b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`);
const ext = (n: string) => (n.includes(".") ? n.split(".").pop()!.toUpperCase() : "FILE");
const chipClass = (s: string) => `chip chip-${s.toLowerCase().replace(" ", "-")}`;

type Uploaded = { name: string; bytes: number; at: string; version: number };
type Segment = "Submit bid" | "Documents";

function UploadButton({ label, onFile }: { label: string; onFile: (f: File) => void }) {
  return (
    <label className="btn-outline vp-btn vp-upload">
      <input
        type="file"
        className="vp-file"
        accept=".pdf,.docx,.xlsx,.csv"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
      <Icon name="upload" size={14} />
      {label}
    </label>
  );
}

export function EventBidPortal({ event, vendorId }: { event: PortalEvent; vendorId: string }) {
  const alreadySubmitted = event.status === "Bid submitted";
  const [segment, setSegment] = useState<Segment>("Submit bid");
  const [uploaded, setUploaded] = useState<Record<string, Uploaded>>(
    alreadySubmitted ? Object.fromEntries(Object.entries(submittedBid).map(([id, d]) => [id, { ...d, version: 1 }])) : {},
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(alreadySubmitted);
  const [showEval, setShowEval] = useState(false);

  const isOpen = event.status === "Invited" || event.status === "Bid submitted";
  const required = bidSlots.filter((s) => s.required);
  const ready = required.filter((s) => uploaded[s.id]).length;
  const tender = tenderDocs(event);
  const myCount = Object.keys(uploaded).length;

  const pick = (id: string, f: File) => {
    if (f.size > MAX) {
      setErrors((e) => ({ ...e, [id]: "File is larger than 10 MB." }));
      return;
    }
    setErrors((e) => ({ ...e, [id]: "" }));
    setUploaded((prev) => ({ ...prev, [id]: { name: f.name, bytes: f.size, at: "Just now", version: (prev[id]?.version ?? 0) + 1 } }));
  };
  const remove = (id: string) =>
    setUploaded((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

  return (
    <div className="page">
      <div className="new-page-head">
        <Link href={`/portal/${vendorId}/sourcing-events`} className="btn-outline btn-icon" aria-label="Back to sourcing events">
          <Icon name="back" size={16} />
        </Link>
        <h1 className="new-page-title">{event.title}</h1>
        <span className="tbl-id">{event.id}</span>
        <span className={chipClass(event.status)}>
          <span className="chip-dot" />
          {event.status}
        </span>
        <span className="vp-closing">
          {isOpen ? "Closes" : "Closed"} {event.closing}
        </span>
      </div>

      <div className="segments vp-segments" role="tablist" aria-label="Event sections">
        {(["Submit bid", "Documents"] as const).map((s) => (
          <button
            key={s}
            type="button"
            role="tab"
            aria-selected={segment === s}
            className={segment === s ? "segment is-active" : "segment"}
            onClick={() => setSegment(s)}
          >
            {s}
            {s === "Documents" && <span className="segment-count">{tender.length + myCount}</span>}
          </button>
        ))}
      </div>

      {segment === "Submit bid" ? (
        <>
          <section className="vp-card">
            <header className="vp-head">
              <h2>{submitted ? "Your bid is submitted" : "Upload your bid"}</h2>
              <p>
                {!isOpen
                  ? "This event is no longer open for bids."
                  : submitted
                    ? `You can replace any document until ${event.closing}. Find them all under Documents.`
                    : `Upload each required document · PDF, DOCX, XLSX or CSV · 10 MB max · closes ${event.closing}`}
              </p>
            </header>

            {isOpen && !submitted && (
              <div className="vp-progress" aria-label={`${ready} of ${required.length} required documents uploaded`}>
                <div className="vp-progress-top">
                  <span>
                    {ready} of {required.length} required documents uploaded
                  </span>
                  <button type="button" className="vp-link" onClick={() => setSegment("Documents")}>
                    Read the tender documents
                  </button>
                </div>
                <div className="vp-progress-track">
                  <span style={{ width: `${(ready / required.length) * 100}%` }} />
                </div>
              </div>
            )}

            <ul className="vp-slots">
              {bidSlots.map((s) => {
                const f = uploaded[s.id];
                return (
                  <li key={s.id} className="vp-slot">
                    <div className="vp-slot-main">
                      <p>
                        <strong>{s.name}</strong>
                        <span className={s.required ? "vp-tag is-req" : "vp-tag"}>{s.required ? "Required" : "Optional"}</span>
                      </p>
                      <small>{errors[s.id] ? <span className="vp-err">{errors[s.id]}</span> : f ? `${f.name} · ${size(f.bytes)}` : s.note}</small>
                    </div>
                    {f && (
                      <span className="vp-status is-ok">
                        <i />
                        Uploaded
                      </span>
                    )}
                    {isOpen && (
                      <div className="vp-slot-actions">
                        {f && !submitted && (
                          <button type="button" className="icon-action" aria-label={`Remove ${s.name}`} onClick={() => remove(s.id)}>
                            <Icon name="trash" size={16} />
                          </button>
                        )}
                        <UploadButton label={f ? "Replace" : "Upload"} onFile={(file) => pick(s.id, file)} />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            {isOpen && !submitted && (
              <footer className="vp-submit">
                <p>Review everything before you submit. You can still replace documents afterwards.</p>
                <button type="button" className="btn-solid" disabled={ready < required.length} onClick={() => setSubmitted(true)}>
                  Submit bid
                </button>
              </footer>
            )}
          </section>

          <section className="vp-card vp-collapse">
            <button type="button" className="vp-toggle" aria-expanded={showEval} onClick={() => setShowEval((o) => !o)}>
              <span>
                <h2>What we will evaluate</h2>
                <p>The criteria and mandatory requirements your bid is scored against.</p>
              </span>
              <Icon name={showEval ? "up" : "down"} size={18} />
            </button>
            {showEval && (
              <div className="vp-eval">
                <div>
                  <h3>Criteria and weights</h3>
                  <ul className="vp-weights">
                    {criteria.map((c) => (
                      <li key={c.key}>
                        <span>{c.name}</span>
                        <b>{c.weight}%</b>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3>Mandatory requirements</h3>
                  <ul className="vp-reqs">
                    {requirements.map((r) => (
                      <li key={r.id}>
                        <em>{r.id}</em>
                        {r.text}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </section>
        </>
      ) : (
        <>
          <section className="vp-card">
            <header className="vp-head">
              <h2>Tender documents</h2>
              <p>Published by the buyer. They define the scope, terms and what we will evaluate.</p>
            </header>
            <ul className="vp-docs">
              {tender.map((d) => (
                <li key={d.name}>
                  <span className="doc-ext">{ext(d.name)}</span>
                  <span className="doc-name">{d.name}</span>
                  <span className="doc-size">{size(d.bytes)}</span>
                  <button type="button" className="btn-outline vp-btn">
                    <Icon name="download" size={14} />
                    Download
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="vp-card">
            <header className="vp-head">
              <h2>Your bid documents</h2>
              <p>{isOpen ? "Everything you have uploaded. Replace a document any time before the event closes." : "Everything you uploaded for this event."}</p>
            </header>
            <ul className="vp-docs">
              {bidSlots.map((s) => {
                const f = uploaded[s.id];
                return (
                  <li key={s.id}>
                    <span className={f ? "doc-ext" : "doc-ext is-empty"}>{f ? ext(f.name) : "—"}</span>
                    <span className="vp-doc-text">
                      <span className="doc-name">{s.name}</span>
                      <small>{f ? `${f.name} · ${size(f.bytes)} · v${f.version} · ${f.at}` : "Not uploaded"}</small>
                    </span>
                    {f && (
                      <button type="button" className="btn-outline vp-btn">
                        <Icon name="download" size={14} />
                        Download
                      </button>
                    )}
                    {isOpen && <UploadButton label={f ? "Replace" : "Upload"} onFile={(file) => pick(s.id, file)} />}
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
