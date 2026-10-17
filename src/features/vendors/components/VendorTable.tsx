"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/layout/icons";
import { vendorList, vendorStatuses, type VendorStatus } from "../data";

const chipClass = (status: VendorStatus) => `chip chip-${status.toLowerCase().replace(" ", "-")}`;

export function VendorTable() {
  const [segment, setSegment] = useState<"All" | VendorStatus>("All");
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const rows = vendorList.filter(
    (v) =>
      (segment === "All" || v.status === segment) &&
      (!q || [v.name, v.id, v.category, v.country].some((x) => x.toLowerCase().includes(q))),
  );

  return (
    <section className="etable">
      <div className="etable-toolbar">
        <div className="segments" role="tablist">
          {(["All", ...vendorStatuses] as const).map((name) => {
            const count = name === "All" ? vendorList.length : vendorList.filter((v) => v.status === name).length;
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
            <input type="search" placeholder="Search vendors" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
          <button type="button" className="btn-outline">
            <Icon name="filter" size={16} />
            Filter
          </button>
          <Link href="/admin/vendors/new" className="btn-solid">
            <Icon name="plus" size={16} />
            New vendor
          </Link>
        </div>
      </div>

      <div className="tbl">
        <div className="tbl-row tbl-head tbl-vendors" role="row">
          <span>Vendor</span>
          <span>Status</span>
          <span>Category</span>
          <span>Country</span>
          <span>Score</span>
          <span className="tbl-actions-col">Actions</span>
        </div>

        {rows.map((v) => (
          <div key={v.id} className="tbl-row tbl-vendors" role="row">
            <span className="tbl-title">
              <Link href={`/admin/vendors/${v.id}`} className="tbl-name tbl-link">
                {v.name}
              </Link>
              <span className="tbl-id">{v.id}</span>
            </span>
            <span>
              <span className={chipClass(v.status)}>
                <span className="chip-dot" />
                {v.status}
              </span>
            </span>
            <span className="tbl-muted">{v.category}</span>
            <span className="tbl-muted">{v.country}</span>
            <span>{v.score}</span>
            <span className="tbl-actions-col tbl-actions">
              <Link
                href={`/portal/${v.id}/onboarding`}
                target="_blank"
                rel="noopener"
                className="icon-action"
                aria-label={`Open portal for ${v.name}`}
                title="Open portal"
              >
                <Icon name="external" size={16} />
              </Link>
              <Link href={`/admin/vendors/${v.id}`} className="icon-action" aria-label={`View ${v.name}`} title="View vendor">
                <Icon name="eye" size={16} />
              </Link>
              <button type="button" className="icon-action" aria-label={`Edit ${v.name}`}>
                <Icon name="pencil" size={16} />
              </button>
            </span>
          </div>
        ))}

        {rows.length === 0 && <p className="tbl-empty">No vendors match your search.</p>}
      </div>
    </section>
  );
}
