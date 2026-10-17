import { notFound } from "next/navigation";
import { PortalDashboard } from "@/features/vendor-portal/components/PortalDashboard";
import { vendorList } from "@/features/vendors/data";

export default async function Page({ params }: { params: Promise<{ vendorId: string }> }) {
  const { vendorId } = await params;
  const vendor = vendorList.find((v) => v.id === vendorId);
  if (!vendor) notFound();
  return <PortalDashboard vendor={vendor} />;
}
