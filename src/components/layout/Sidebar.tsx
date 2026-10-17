"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./icons";
import { isActive, type NavItem } from "./nav";

export function Sidebar({
  nav,
  root,
  workspace,
}: {
  nav: NavItem[];
  root: string;
  workspace: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-logo" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
            <path d="M12 2c1.2 3.6 2.4 4.8 6 6-3.6 1.2-4.8 2.4-6 6-1.2-3.6-2.4-4.8-6-6 3.6-1.2 4.8-2.4 6-6Zm6 10c.7 2.1 1.4 2.8 3.5 3.5-2.1.7-2.8 1.4-3.5 3.5-.7-2.1-1.4-2.8-3.5-3.5 2.1-.7 2.8-1.4 3.5-3.5Z" />
          </svg>
        </span>
        <span className="brand-name">Procure AI</span>
      </div>

      <button type="button" className="workspace">
        <span className="workspace-avatar">{workspace.charAt(0).toUpperCase()}</span>
        <span className="workspace-name">{workspace}</span>
        <Icon name="updown" size={16} />
      </button>

      <p className="sidebar-section">Main</p>
      <nav className="sidebar-nav">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={isActive(pathname, item.href, root) ? "nav-link is-active" : "nav-link"}
          >
            <Icon name={item.icon} />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
