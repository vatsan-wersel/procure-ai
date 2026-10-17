import { notFound } from "next/navigation";
import { EventBidPortal } from "@/features/vendor-portal/components/EventBidPortal";
import { portalEvents } from "@/features/vendor-portal/data";

export default async function Page({ params }: { params: Promise<{ vendorId: string; eventId: string }> }) {
  const { vendorId, eventId } = await params;
  const event = portalEvents.find((e) => e.id === eventId);
  if (!event) notFound();
  return <EventBidPortal event={event} vendorId={vendorId} />;
}
