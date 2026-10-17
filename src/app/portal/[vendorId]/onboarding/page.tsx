import { notFound } from "next/navigation";
import { OnboardingKyc } from "@/features/vendor-portal/components/OnboardingKyc";
import { vendorList } from "@/features/vendors/data";

export default async function Page({ params }: { params: Promise<{ vendorId: string }> }) {
  const { vendorId } = await params;
  const vendor = vendorList.find((v) => v.id === vendorId);
  if (!vendor) notFound();
  return <OnboardingKyc vendor={vendor} />;
}
