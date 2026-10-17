import { redirect } from "next/navigation";

export default async function PortalHome({ params }: { params: Promise<{ vendorId: string }> }) {
  const { vendorId } = await params;
  redirect(`/portal/${vendorId}/onboarding`);
}
