import { getSession } from "@/lib/session";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import type { NavItem } from "./nav";

export async function PortalShell({
  root,
  workspace,
  nav,
  children,
}: {
  root: string;
  workspace: string;
  nav: NavItem[];
  children: React.ReactNode;
}) {
  const session = await getSession();
  const userName = session?.role === "VENDOR" ? "Demo Vendor" : "Admin";

  return (
    <div className="shell">
      <Sidebar nav={nav} root={root} workspace={workspace} />
      <div className="shell-body">
        <Topbar nav={nav} root={root} userName={userName} />
        <main className="shell-content">{children}</main>
      </div>
    </div>
  );
}
