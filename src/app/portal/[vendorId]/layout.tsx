import Link from "next/link";
import { notFound } from "next/navigation";
import "@/styles/sourcing.css";
import { PortalShell } from "@/components/layout/PortalShell";
import type { NavItem } from "@/components/layout/nav";
import { vendorList } from "@/features/vendors/data";

export default async function PortalPreviewLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ vendorId: string }>;
}) {
  const { vendorId } = await params;
  const vendor = vendorList.find((v) => v.id === vendorId);
  if (!vendor) notFound();

  const root = `/portal/${vendor.id}`;
  const nav: NavItem[] = [
    { href: `${root}/onboarding`, label: "Onboarding and KYC", icon: "shield" },
    { href: `${root}/dashboard`, label: "Dashboard", icon: "dashboard" },
    { href: `${root}/sourcing-events`, label: "Sourcing events", icon: "sourcing" },
  ];

  return (
    <PortalShell root={root} workspace="Vendor Portal" nav={nav}>
      <div className="vp-banner">
        <p>
          Previewing the vendor portal as <strong>{vendor.name}</strong>
        </p>
        <Link href="/admin/vendors">Exit preview</Link>
      </div>
      {children}
    </PortalShell>
  );
}
