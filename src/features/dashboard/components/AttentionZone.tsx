import Link from "next/link";
import { Icon } from "@/components/layout/icons";
import { attentionItems } from "../queries";

/** `newIds` are items that changed since the admin last looked. */
export function AttentionZone({ newIds }: { newIds: ReadonlySet<string> }) {
  const fresh = attentionItems.filter((p) => newIds.has(p.id)).length;

  return (
    <section id="attention" className="attn dash-section" aria-label="Immediate attention">
      <header className="attn-head">
        <h2 className="attn-title">Immediate attention</h2>
        <span className="attn-count">{attentionItems.length}</span>
        {fresh > 0 && (
          <span className="attn-new-pill">
            <i />
            {fresh} updated since your last visit
          </span>
        )}
      </header>

      <ul className="attn-list">
        {attentionItems.map((p) => (
          <li key={p.id} className={`attn-item is-${p.level.toLowerCase()}${newIds.has(p.id) ? " is-new" : ""}`}>
            <div className="attn-text">
              <p className="attn-item-title">
                {p.title}
                <span className={`attn-tag is-${p.level.toLowerCase()}`}>{p.level}</span>
                {newIds.has(p.id) && <span className="attn-tag is-fresh">Updated</span>}
              </p>
              <p className="attn-detail">{p.reason}</p>
            </div>
            <Link href={`/admin/sourcing-events/${p.eventId}`} className="attn-action">
              {p.action}
              <Icon name="arrow" size={14} />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
