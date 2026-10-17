"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/features/auth/actions/login";
import { Icon } from "./icons";
import { pageTitle, type NavItem } from "./nav";

export function Topbar({
  nav,
  root,
  userName,
}: {
  nav: NavItem[];
  root: string;
  userName: string;
}) {
  const pathname = usePathname();
  const searchRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const initials = userName
    .split(" ")
    .map((w) => w.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, []);

  return (
    <header className="topbar">
      <h2 className="topbar-title">{pageTitle(pathname, nav, root)}</h2>

      <div className="topbar-right">
        <label className="search">
          <Icon name="search" size={16} />
          <input ref={searchRef} type="search" placeholder="Search events, vendors…" />
          <span className="keys" aria-hidden="true">
            <kbd>⌘</kbd>
            <kbd>K</kbd>
          </span>
        </label>

        <span className="topbar-divider" aria-hidden="true" />

        <button type="button" className="icon-btn" aria-label="Notifications">
          <Icon name="bell" size={18} />
          <span className="notif-dot" />
        </button>

        <div className="user" ref={menuRef}>
          <button type="button" className="user-btn" onClick={() => setOpen((o) => !o)}>
            <span className="user-avatar">{initials}</span>
            <span className="user-name">{userName}</span>
            <Icon name="down" size={14} />
          </button>
          {open && (
            <form action={logoutAction} className="user-menu">
              <button type="submit">
                <Icon name="logout" size={16} />
                Sign out
              </button>
            </form>
          )}
        </div>
      </div>
    </header>
  );
}
