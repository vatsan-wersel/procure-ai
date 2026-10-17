import { Icon } from "@/components/layout/icons";
import type { Vendor } from "@/features/vendors/data";
import { kycDocs, portalEvents } from "../data";

export function PortalDashboard({ vendor }: { vendor: Vendor }) {
  const issues = kycDocs(vendor).filter((d) => d.status !== "Verified");
  const count = (s: string) => portalEvents.filter((e) => e.status === s).length;

  const kpis = [
    { label: "Open invitations", value: String(count("Invited")) },
    { label: "Bids submitted", value: String(count("Bid submitted")) },
    { label: "Awards", value: String(count("Awarded")) },
    { label: "Performance score", value: String(vendor.score) },
  ];

  const attention = [
    ...issues.map((d) => ({
      level: d.status === "In review" ? "medium" : "high",
      title: `${d.name}: ${d.status.toLowerCase()}`,
      detail: d.status === "In review" ? "Procurement is checking this document." : "Upload an up-to-date copy to stay eligible to bid.",
      action: d.status === "In review" ? "View" : "Upload",
    })),
    { level: "medium", title: "Marine Logistics Framework closes on Nov 20", detail: "You have been invited to bid. Review the tender documents.", action: "Open event" },
  ];

  return (
    <div className="page">
      <section className="kpi-card">
        <dl className="kpi-row">
          {kpis.map((k) => (
            <div key={k.label} className="kpi">
              <dt>{k.label}</dt>
              <dd>{k.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="attn">
        <header className="attn-head">
          <h2 className="attn-title">Needs your attention</h2>
          <span className="attn-count">{attention.length}</span>
        </header>
        <ul className="attn-list">
          {attention.map((it) => (
            <li key={it.title} className="attn-item">
              <span className={`attn-dot is-${it.level}`} aria-hidden="true" />
              <div className="attn-text">
                <p className="attn-item-title">{it.title}</p>
                <p className="attn-detail">{it.detail}</p>
              </div>
              <button type="button" className="attn-action">
                {it.action}
                <Icon name="arrow" size={14} />
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
