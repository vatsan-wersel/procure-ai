import { PortalShell } from "@/components/layout/PortalShell";
import type { NavItem } from "@/components/layout/nav";

const nav: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/copilot", label: "Copilot", icon: "sparkles" },
  { href: "/admin/sourcing-events", label: "Sourcing Event", icon: "sourcing" },
  { href: "/admin/vendors", label: "Vendors", icon: "vendors" },
  { href: "/admin/approvals", label: "Approvals", icon: "approvals" },
  { href: "/admin/onboarding-flow", label: "Onboarding flow", icon: "shield" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell root="/admin" workspace="Admin Portal" nav={nav}>
      {children}
    </PortalShell>
  );
}
