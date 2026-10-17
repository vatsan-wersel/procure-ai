export const SESSION_COOKIE = "session";

export type Role = "ADMIN" | "VENDOR";

export const HOME_BY_ROLE: Record<Role, string> = {
  ADMIN: "/admin",
  VENDOR: "/vendor",
};
