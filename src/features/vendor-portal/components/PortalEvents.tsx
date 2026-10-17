import Link from "next/link";
import { Icon } from "@/components/layout/icons";
import { portalEvents } from "../data";

const chipClass = (s: string) => `chip chip-${s.toLowerCase().replace(" ", "-")}`;

export function PortalEvents({ vendorId }: { vendorId: string }) {
  return (
    <div className="page">
      <section className="etable">
        <div className="tbl">
          <div className="tbl-row tbl-head vp-events" role="row">
            <span>Event title</span>
            <span>Status</span>
            <span>Project</span>
            <span>Bid closing</span>
            <span className="tbl-actions-col">Actions</span>
          </div>
          {portalEvents.map((e) => (
            <div key={e.id} className="tbl-row vp-events" role="row">
              <span className="tbl-title">
                <Link href={`/portal/${vendorId}/sourcing-events/${e.id}`} className="tbl-name tbl-link">
                  {e.title}
                </Link>
                <span className="tbl-id">{e.id}</span>
              </span>
              <span>
                <span className={chipClass(e.status)}>
                  <span className="chip-dot" />
                  {e.status}
                </span>
              </span>
              <span className="tbl-muted">{e.project}</span>
              <span className="tbl-muted">{e.closing}</span>
              <span className="tbl-actions-col tbl-actions">
                <Link href={`/portal/${vendorId}/sourcing-events/${e.id}`} className="icon-action" aria-label={`View ${e.title}`}>
                  <Icon name="eye" size={16} />
                </Link>
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
