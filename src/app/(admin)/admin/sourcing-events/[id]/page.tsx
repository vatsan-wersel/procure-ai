import Link from "next/link";
import { notFound } from "next/navigation";
import "@/styles/sourcing.css";
import { Icon } from "@/components/layout/icons";
import { EvaluationBriefing } from "@/features/sourcing/components/EvaluationBriefing";
import { EventCopilot } from "@/features/sourcing/components/EventCopilot";
import { EventTabs } from "@/features/sourcing/components/EventTabs";
import { EventActions } from "@/features/sourcing/components/EventActions";
import { events } from "@/features/sourcing/data";

export default async function SourcingEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = events.find((e) => e.id === id);
  if (!event) notFound();

  const chip = `chip chip-${event.status.toLowerCase().replace(" ", "-")}`;
  const details = [
    { label: "Project", value: event.project },
    { label: "Creator", value: event.creator },
    { label: "Event value", value: event.value },
    { label: "Last updated", value: event.updatedAt },
  ];

  return (
    <div className="page event-page">
      <div className="new-page-head">
        <Link href="/admin/sourcing-events" className="btn-outline btn-icon" aria-label="Back to sourcing events">
          <Icon name="back" size={16} />
        </Link>
        <h1 className="new-page-title">{event.title}</h1>
        <span className="tbl-id">{event.id}</span>
        <span className={chip}>
          {event.status !== "Draft" && <span className="chip-dot" />}
          {event.status}
        </span>
        <EventActions status={event.status} />
      </div>

      <section className="kpi-card">
        <dl className="kpi-row">
          {details.map((d) => (
            <div key={d.label} className="kpi">
              <dt>{d.label}</dt>
              <dd>{d.value}</dd>
            </div>
          ))}
        </dl>

        <EvaluationBriefing />
      </section>

      <EventTabs event={event} />

      <EventCopilot eventId={event.id} title={event.title} />
    </div>
  );
}
