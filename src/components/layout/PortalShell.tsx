import { db } from "@/lib/db";
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
  const user = session
    ? await db.user.findUnique({ where: { id: session.userId }, select: { name: true } })
    : null;

  return (
    <div className="shell">
      <Sidebar nav={nav} root={root} workspace={workspace} />
      <div className="shell-body">
        <Topbar nav={nav} root={root} userName={user?.name ?? "User"} />
        <main className="shell-content">{children}</main>
      </div>
    </div>
  );
}
