import { PortalEvents } from "@/features/vendor-portal/components/PortalEvents";

export default async function Page({ params }: { params: Promise<{ vendorId: string }> }) {
  const { vendorId } = await params;
  return <PortalEvents vendorId={vendorId} />;
}
