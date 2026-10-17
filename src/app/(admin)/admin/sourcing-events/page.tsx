import "@/styles/sourcing.css";
import { AiZone } from "@/features/sourcing/components/AiZone";
import { EventTable } from "@/features/sourcing/components/EventTable";

export default function SourcingEventsPage() {
  return (
    <div className="page">
      <AiZone />
      <EventTable />
    </div>
  );
}
