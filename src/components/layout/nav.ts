import type { IconName } from "./icons";

export type NavItem = { href: string; label: string; icon: IconName };

export function isActive(pathname: string, href: string, root: string) {
  return href === root ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export function pageTitle(pathname: string, nav: NavItem[], root: string) {
  const match = nav
    .filter((n) => isActive(pathname, n.href, root))
    .sort((a, b) => b.href.length - a.href.length)[0];
  return match?.label ?? nav[0].label;
}
