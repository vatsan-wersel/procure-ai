"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/layout/icons";
import { events, statuses, type EventStatus } from "../data";

const chipClass = (status: EventStatus) => `chip chip-${status.toLowerCase().replace(" ", "-")}`;

export function EventTable() {
  const [segment, setSegment] = useState<"All" | EventStatus>("All");
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const rows = events.filter(
    (e) =>
      (segment === "All" || e.status === segment) &&
      (!q || [e.title, e.id, e.project, e.creator].some((v) => v.toLowerCase().includes(q))),
  );

  return (
    <section className="etable">
      <div className="etable-toolbar">
        <div className="segments" role="tablist">
          {(["All", ...statuses.map((s) => s.name)] as const).map((name) => {
            const count = name === "All" ? events.length : events.filter((e) => e.status === name).length;
            return (
              <button
                key={name}
                type="button"
                role="tab"
                aria-selected={segment === name}
                className={segment === name ? "segment is-active" : "segment"}
                onClick={() => setSegment(name)}
              >
                {name}
                <span className="segment-count">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="etable-actions">
          <label className="search etable-search">
            <Icon name="search" size={16} />
            <input
              type="search"
              placeholder="Search events"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <button type="button" className="btn-outline">
            <Icon name="filter" size={16} />
            Filter
          </button>
          <Link href="/admin/sourcing-events/new" className="btn-solid">
            <Icon name="plus" size={16} />
            New
          </Link>
        </div>
      </div>

      <div className="tbl">
        <div className="tbl-row tbl-head" role="row">
          <span>Event title</span>
          <span>Status</span>
          <span>Project</span>
          <span>Creator</span>
          <span>Event value</span>
          <span className="tbl-actions-col">Actions</span>
        </div>

        {rows.map((e) => (
          <div key={e.id} className="tbl-row" role="row">
            <span className="tbl-title">
              <Link href={`/admin/sourcing-events/${e.id}`} className="tbl-name tbl-link">
                {e.title}
              </Link>
              <span className="tbl-id">{e.id}</span>
            </span>
            <span>
              <span className={chipClass(e.status)}>
                {e.status !== "Draft" && <span className="chip-dot" />}
                {e.status}
              </span>
            </span>
            <span className="tbl-muted">{e.project}</span>
            <span className="tbl-muted">{e.creator}</span>
            <span>{e.value}</span>
            <span className="tbl-actions-col tbl-actions">
              <Link href={`/admin/sourcing-events/${e.id}`} className="icon-action" aria-label="View event">
                <Icon name="eye" size={16} />
              </Link>
              <button type="button" className="icon-action" aria-label="Edit event">
                <Icon name="pencil" size={16} />
              </button>
            </span>
          </div>
        ))}

        {rows.length === 0 && <p className="tbl-empty">No events match your search.</p>}
      </div>
    </section>
  );
}
