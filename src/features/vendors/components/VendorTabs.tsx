"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/layout/icons";
import "@/styles/evaluation.css";
import { events } from "@/features/sourcing/data";
import { fmtDate, fmtTime } from "@/features/sourcing/mockApproval";
import { kycDocs, onboardingSteps, type KycStatus, type StepState } from "@/features/vendor-portal/data";
import { getTrackRecord, type TrackOutcome, type Vendor } from "../data";
import { mockPdf } from "../mockPdf";
import { getActivity, getContact, getPerformance, getRisks, getSubmission, vendorActivityCategories, type Health, type PerformanceMetric, type VendorActivityCategory } from "../mockProfile";

const tabs = ["Overview", "Compliance", "Track record", "Performance", "Risks", "Documents", "Activity"] as const;
type Tab = (typeof tabs)[number];

const kycChip: Record<KycStatus, string> = {
  Verified: "chip-approved",
  "In review": "chip-pending-approval",
  Missing: "chip-draft",
  Expired: "chip-blocked",
};
const stepChip: Record<StepState, string> = {
  Complete: "chip-approved",
  "In progress": "chip-evaluation",
  "Action needed": "chip-blocked",
  "Not started": "chip-draft",
};
const outcomeChip = (o: TrackOutcome) => `chip-${o.toLowerCase().replace(" ", "-")}`;
const sevChip = { High: "chip-blocked", Medium: "chip-pending-approval", Low: "chip-draft" } as const;

const Chip = ({ cls, children }: { cls: string; children: React.ReactNode }) => (
  <span className={`chip ${cls}`}>
    <span className="chip-dot" />
    {children}
  </span>
);

const Empty = ({ children }: { children: React.ReactNode }) => <p className="tbl-empty">{children}</p>;

export function VendorTabs({ vendor }: { vendor: Vendor }) {
  const [active, setActive] = useState<Tab>("Overview");

  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = tabs[(i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
    setActive(next);
    document.getElementById(`vtab-${next}`)?.focus();
  };

  return (
    <section className="etabs">
      <div className="etabs-list" role="tablist">
        {tabs.map((t, i) => (
          <button
            key={t}
            id={`vtab-${t}`}
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

      <div className="etabs-panel" role="tabpanel" aria-labelledby={`vtab-${active}`}>
        {active === "Overview" && <Overview vendor={vendor} goTo={setActive} />}
        {active === "Compliance" && <Compliance vendor={vendor} />}
        {active === "Track record" && <TrackRecord vendor={vendor} />}
        {active === "Performance" && <Performance vendor={vendor} />}
        {active === "Risks" && <Risks vendor={vendor} />}
        {active === "Documents" && <Documents vendor={vendor} />}
        {active === "Activity" && <Activity vendor={vendor} />}
      </div>
    </section>
  );
}

function Overview({ vendor, goTo }: { vendor: Vendor; goTo: (t: Tab) => void }) {
  const c = getContact(vendor);
  const flagged = kycDocs(vendor).filter((d) => d.status !== "Verified");
  const risks = getRisks(vendor).filter((r) => r.severity !== "Low");
  const steps = onboardingSteps(vendor);
  const done = steps.filter((s) => s.state === "Complete").length;

  return (
    <div className="overview-grid">
      <section className="vt-card">
        <h3 className="vt-title">Needs attention</h3>
        {flagged.length + risks.length === 0 ? (
          <p className="vt-muted">Nothing needs attention for this vendor.</p>
        ) : (
          <ul className="vt-list">
            {flagged.map((d) => (
              <li key={d.name}>
                <span>
                  <strong>{d.name}</strong>
                  <small>{d.status === "Expired" ? `Expired ${d.expiry}` : d.status === "Missing" ? "Not provided" : "Waiting for review"}</small>
                </span>
                <button type="button" className="vt-link" onClick={() => goTo("Compliance")}>
                  Review
                </button>
              </li>
            ))}
            {risks.map((r) => (
              <li key={r.id}>
                <span>
                  <strong>{r.title}</strong>
                  <small>{r.detail}</small>
                </span>
                <button type="button" className="vt-link" onClick={() => goTo("Risks")}>
                  View
                </button>
              </li>
            ))}
          </ul>
        )}

        <h3 className="vt-title vt-gap">Onboarding</h3>
        <p className="vt-muted">
          {done} of {steps.length} steps complete
        </p>
        <ul className="vt-steps">
          {steps.map((s) => (
            <li key={s.name}>
              <span>{s.name}</span>
              <Chip cls={stepChip[s.state]}>{s.state}</Chip>
            </li>
          ))}
        </ul>
      </section>

      <section className="vt-card">
        <h3 className="vt-title">Contact</h3>
        <dl className="vt-dl">
          <div>
            <dt>Primary contact</dt>
            <dd>
              {c.name}
              <small>{c.role}</small>
            </dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{c.email}</dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>{c.phone}</dd>
          </div>
          <div>
            <dt>Address</dt>
            <dd>{c.address}</dd>
          </div>
          <div>
            <dt>Website</dt>
            <dd>{c.website}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

function Compliance({ vendor }: { vendor: Vendor }) {
  const docs = kycDocs(vendor);
  const steps = onboardingSteps(vendor);
  const [stage, setStage] = useState("KYC documents");
  const current = steps.find((s) => s.name === stage) ?? steps[0];
  const sub = getSubmission(vendor, current.name);

  return (
    <div className="vt-stack">
      <div className="vt-steprow" role="tablist" aria-label="Onboarding stages">
        {steps.map((s, i) => (
          <button
            key={s.name}
            type="button"
            role="tab"
            aria-selected={current.name === s.name}
            className={current.name === s.name ? "vt-step is-on" : "vt-step"}
            onClick={() => setStage(s.name)}
          >
            <span className="vt-step-n">{i + 1}</span>
            <strong>{s.name}</strong>
            <Chip cls={stepChip[s.state]}>{s.state}</Chip>
          </button>
        ))}
      </div>

      {current.name !== "KYC documents" && (
        <section className="vt-card">
          <div className="vt-card-head">
            <h3 className="vt-title">{current.name}</h3>
            {sub.submitted && (
              <span className="vt-muted">
                Submitted {fmtDate(sub.submitted)} · {fmtTime(sub.submitted)}
              </span>
            )}
          </div>
          {sub.fields.length === 0 ? (
            <p className="vt-muted">
              {current.state === "Not started" ? "The vendor has not started this stage." : "Nothing has been submitted for this stage yet."}
            </p>
          ) : (
            <dl className="vt-fields">
              {sub.fields.map((f) => (
                <div key={f.label}>
                  <dt>{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </section>
      )}

      <div className="apt-wrap" hidden={current.name !== "KYC documents"}>
        <table className="apt apt-sm">
          <colgroup>
            <col style={{ width: "40%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "20%" }} />
          </colgroup>
          <thead>
            <tr>
              <th>Document</th>
              <th>Status</th>
              <th>Expiry</th>
              <th className="apt-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((d) => (
              <tr key={d.name}>
                <td>
                  <div className="apt-cell">
                    <strong className="apt-trunc" title={d.name}>
                      {d.name}
                    </strong>
                    <small className="apt-sub apt-trunc" title={d.note}>
                      {d.note}
                    </small>
                  </div>
                </td>
                <td>
                  <Chip cls={kycChip[d.status]}>{d.status}</Chip>
                </td>
                <td className="tbl-muted">{d.expiry}</td>
                <td>
                  <div className="apl-actions">
                    {d.status === "In review" && (
                      <button type="button" className="btn-solid apl-btn">
                        <Icon name="check" size={14} />
                        Verify
                      </button>
                    )}
                    {d.status === "Verified" ? (
                      <button type="button" className="btn-outline apl-btn">
                        <Icon name="eye" size={14} />
                        View
                      </button>
                    ) : (
                      <button type="button" className="btn-outline apl-btn">
                        Request update
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TrackRecord({ vendor }: { vendor: Vendor }) {
  const record = getTrackRecord(vendor.id);
  return (
    <div className="apt-wrap">
      <table className="apt apt-sm">
        <colgroup>
          <col style={{ width: "36%" }} />
          <col style={{ width: "18%" }} />
          <col style={{ width: "14%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "22%" }} />
        </colgroup>
        <thead>
          <tr>
            <th>Sourcing event</th>
            <th>Outcome</th>
            <th>Bid</th>
            <th>Rank</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {record.map((r) => (
            <tr key={r.eventId}>
              <td>
                <div className="apt-cell">
                  {events.some((e) => e.id === r.eventId) ? (
                    <Link href={`/admin/sourcing-events/${r.eventId}`} className="apl-event apt-trunc" title={r.title}>
                      {r.title}
                    </Link>
                  ) : (
                    <span className="apt-trunc" title={r.title}>
                      {r.title}
                    </span>
                  )}
                  <small className="apt-sub">{r.eventId}</small>
                </div>
              </td>
              <td>
                <Chip cls={outcomeChip(r.outcome)}>{r.outcome}</Chip>
              </td>
              <td>{r.bid}</td>
              <td className="tbl-muted">{r.rank}</td>
              <td className="tbl-muted">{r.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const healthLabel: Record<Health, string> = { good: "Healthy", watch: "Watch", bad: "Action needed" };
const healthPill: Record<Health, string> = { good: "is-ok", watch: "is-warn", bad: "is-bad" };

function Performance({ vendor }: { vendor: Vendor }) {
  const { summary, metrics, events } = getPerformance(vendor);
  const [openId, setOpenId] = useState<string | null>(null);
  const open = metrics.find((m) => m.id === openId) ?? null;

  return (
    <div className="vt-stack">
      <section className="vt-card vt-overall">
        <div>
          <h3 className="vt-title">Overall performance</h3>
          <p className="vt-score">
            {vendor.score}
            <span> out of 100</span>
          </p>
        </div>
        <p className="vt-muted vt-overall-note">
          Across {events} sourcing events. {summary}
        </p>
      </section>

      <div className="vt-metrics">
        {metrics.map((m) => (
          <button key={m.id} type="button" className="vt-metric" onClick={() => setOpenId(m.id)}>
            <span className="vt-metric-top">
              <span>{m.label}</span>
              <span className={`eval-pill ${healthPill[m.health]}`}>{healthLabel[m.health]}</span>
            </span>
            <strong className="vt-metric-val">{m.value}</strong>
            <small>{m.caption}</small>
            <span className="vt-link vt-metric-go">
              See how this was worked out
              <Icon name="right" size={14} />
            </span>
          </button>
        ))}
      </div>

      {open && <MetricDrawer vendor={vendor} metric={open} onClose={() => setOpenId(null)} />}
    </div>
  );
}

function MetricDrawer({ vendor, metric, onClose }: { vendor: Vendor; metric: PerformanceMetric; onClose: () => void }) {
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
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={`How ${metric.label} was worked out`}>
        <header className="drawer-head">
          <div>
            <p className="drawer-eyebrow">{vendor.name}</p>
            <h2 className="drawer-title">{metric.label}</h2>
          </div>
          <button ref={closeRef} type="button" className="icon-action" aria-label="Close" onClick={onClose}>
            <Icon name="close" size={18} />
          </button>
        </header>

        <div className="drawer-body">
          <section className="drawer-score">
            <div className="drawer-score-top">
              <strong>{metric.value}</strong>
              <span>{metric.caption}</span>
            </div>
            <p>{metric.verdict}</p>
          </section>

          <section>
            <h3 className="drawer-h">How this was worked out</h3>
            <ol className="vt-chain">
              {metric.steps.map((s, i) => (
                <li key={s.title} className={i === metric.steps.length - 1 ? "is-last" : undefined}>
                  <span className="vt-chain-n">{i + 1}</span>
                  <div>
                    <strong>{s.title}</strong>
                    <p>{s.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </aside>
    </div>
  );
}

function Risks({ vendor }: { vendor: Vendor }) {
  const risks = getRisks(vendor);
  return (
    <div className="apt-wrap">
      <table className="apt apt-sm">
        <colgroup>
          <col style={{ width: "14%" }} />
          <col style={{ width: "58%" }} />
          <col style={{ width: "28%" }} />
        </colgroup>
        <thead>
          <tr>
            <th>Severity</th>
            <th>Risk</th>
            <th>Event</th>
          </tr>
        </thead>
        <tbody>
          {risks.map((r) => (
            <tr key={r.id}>
              <td>
                <Chip cls={sevChip[r.severity]}>{r.severity}</Chip>
              </td>
              <td>
                <div className="apt-cell">
                  <strong className="apt-trunc" title={r.title}>
                    {r.title}
                  </strong>
                  <small className="apt-sub apt-trunc" title={r.detail}>
                    {r.detail}
                  </small>
                </div>
              </td>
              <td>
                <Link href={`/admin/sourcing-events/${r.eventId}`} className="apl-event">
                  {r.eventId}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {risks.length === 0 && <Empty>No open risks.</Empty>}
    </div>
  );
}

function Documents({ vendor }: { vendor: Vendor }) {
  const docs = kycDocs(vendor).filter((d) => d.status !== "Missing");
  const bids = getTrackRecord(vendor.id).filter((r) => r.outcome !== "Declined");
  const file = (n: string) => `${n.replace(/[^A-Za-z0-9]+/g, "_")}.pdf`;
  const blob = (name: string, meta: string) =>
    mockPdf(name, [vendor.name, meta, "", "Prototype placeholder. The stored original will open here once it is connected."]);
  const view = (name: string, meta: string) => {
    const url = URL.createObjectURL(blob(name, meta));
    window.open(url, "_blank", "noopener");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };
  const download = (name: string, meta: string) => {
    const url = URL.createObjectURL(blob(name, meta));
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };
  const Row = ({ name, meta }: { name: string; meta: string }) => (
    <li className="file-item">
      <span className="chip chip-evaluation">PDF</span>
      <span className="file-name">{name}</span>
      <span className="vt-muted">{meta}</span>
      <div className="apl-actions">
        <button type="button" className="icon-action" aria-label={`View ${name}`} title="View" onClick={() => view(name, meta)}>
          <Icon name="eye" size={18} />
        </button>
        <button type="button" className="icon-action" aria-label={`Download ${name}`} title="Download" onClick={() => download(name, meta)}>
          <Icon name="download" size={18} />
        </button>
      </div>
    </li>
  );
  return (
    <div className="vt-stack">
      <section>
        <h3 className="vt-title">Onboarding documents</h3>
        <ul className="file-list">
          {docs.map((d) => (
            <Row key={d.name} name={file(d.name)} meta={d.status} />
          ))}
        </ul>
      </section>
      <section>
        <h3 className="vt-title">Bid documents</h3>
        <ul className="file-list">
          {bids.map((b) => (
            <Row key={b.eventId} name={file(`${vendor.name.split(" ")[0]} Bid ${b.eventId}`)} meta={b.title} />
          ))}
        </ul>
      </section>
    </div>
  );
}

type ActivityFilter = "All" | VendorActivityCategory;
const activityFilters: ActivityFilter[] = ["All", ...vendorActivityCategories];
const csvCell = (v: string) => `"${v.replace(/"/g, '""')}"`;

function Activity({ vendor }: { vendor: Vendor }) {
  const [filter, setFilter] = useState<ActivityFilter>("All");
  const [query, setQuery] = useState("");
  const log = getActivity(vendor);
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const matches = (e: (typeof log)[number]) => {
    const text = [e.id, e.actor, e.role, e.category, e.action, e.detail ?? "", fmtDate(e.at), fmtTime(e.at)].join(" ").toLowerCase();
    return terms.every((t) => text.includes(t));
  };
  const shown = log.filter((e) => (filter === "All" || e.category === filter) && matches(e));
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
    a.download = `activity-log-${vendor.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="apv">
      <section className="apv-card">
        <header className="apv-head">
          <div>
            <h3>Audit log</h3>
            <p>
              Every action on {vendor.name}, newest first · {log.length} entries
            </p>
          </div>
          <button type="button" className="btn-outline" onClick={exportCsv}>
            <Icon name="download" size={16} />
            Export CSV
          </button>
        </header>

        <div className="apv-toolbar">
          <div className="segments apv-filter" role="tablist" aria-label="Filter audit log">
            {activityFilters.map((f) => (
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

const primary: Record<Vendor["status"], string> = {
  Approved: "Invite to event",
  "Under review": "Approve vendor",
  Blocked: "Re-activate",
};

export function VendorActions({ vendor }: { vendor: Vendor }) {
  const [blocking, setBlocking] = useState(false);
  const [reason, setReason] = useState("");
  const close = () => {
    setBlocking(false);
    setReason("");
  };

  return (
    <div className="event-actions">
      <button type="button" className="btn-solid">
        {primary[vendor.status]}
      </button>
      <Link href={`/portal/${vendor.id}/onboarding`} target="_blank" rel="noopener" className="btn-outline">
        <Icon name="external" size={16} />
        Open portal
      </Link>
      {vendor.status !== "Blocked" && (
        <button type="button" className="btn-outline apl-reject" onClick={() => setBlocking(true)}>
          Block
        </button>
      )}

      {blocking && (
        <div className="apl-overlay" onClick={close}>
          <form
            className="apl-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="vb-title"
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              close();
            }}
          >
            <h3 id="vb-title">Block {vendor.name}</h3>
            <p>A blocked vendor cannot be invited to sourcing events.</p>
            <label htmlFor="vb-reason">Reason</label>
            <textarea
              id="vb-reason"
              className="ftext"
              rows={4}
              required
              autoFocus
              placeholder="Why is this vendor being blocked?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="apl-dialog-actions">
              <button type="button" className="btn-outline" onClick={close}>
                Cancel
              </button>
              <button type="submit" className="btn-solid apl-danger" disabled={!reason.trim()}>
                Block vendor
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
