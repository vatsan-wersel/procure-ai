"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSession, destroySession } from "@/lib/session";

// Prototype: no validation — any click on Login signs in as the seeded admin.
export async function loginAction(_prev: string | null, _formData: FormData): Promise<string | null> {
  const admin = await db.user.findFirst({ where: { role: "ADMIN" } });
  await createSession({ userId: admin?.id ?? "demo", role: "ADMIN" });
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
