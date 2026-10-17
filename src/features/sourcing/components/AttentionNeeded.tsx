import { Icon } from "@/components/layout/icons";

// Prototype data — replace with items derived from the event.
const items = [
  {
    level: "urgent",
    label: "Urgent",
    title: "Approval pending for 3 days",
    detail: "Bidding is due to open on Oct 20.",
    action: "Nudge approver",
  },
  {
    level: "high",
    label: "High",
    title: "Lowest bid misses 8 requirements",
    detail: "It cannot be compared like-for-like with the other bids.",
    action: "Review bids",
  },
  {
    level: "medium",
    label: "Medium",
    title: "Award recommendation not recorded",
    detail: "Approvers need the rationale before the award.",
    action: "Record",
  },
] as const;

export function AttentionNeeded() {
  return (
    <section className="attn">
      <header className="attn-head">
        <h2 className="attn-title">Attention needed</h2>
        <span className="attn-count">{items.length}</span>
      </header>

      <ul className="attn-list">
        {items.map((it) => (
          <li key={it.title} className="attn-item">
            <div className="attn-text">
              <p className="attn-item-title">
                {it.title}
                <span className={`attn-tag is-${it.level}`}>{it.label}</span>
              </p>
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
  );
}
