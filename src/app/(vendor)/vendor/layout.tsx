import { PortalShell } from "@/components/layout/PortalShell";
import type { NavItem } from "@/components/layout/nav";

const nav: NavItem[] = [
  { href: "/vendor", label: "Dashboard", icon: "dashboard" },
  { href: "/vendor/rfqs", label: "RFQs", icon: "rfqs" },
  { href: "/vendor/bids", label: "My Bids", icon: "bids" },
  { href: "/vendor/profile", label: "Profile", icon: "profile" },
];

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell root="/vendor" workspace="Vendor Portal" nav={nav}>
      {children}
    </PortalShell>
  );
}
