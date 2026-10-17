"use server";

import { redirect } from "next/navigation";
import { createSession, destroySession } from "@/lib/session";

// Prototype: no validation — any click on Login signs in as the demo admin.
export async function loginAction(_prev: string | null, _formData: FormData): Promise<string | null> {
  await createSession({ userId: "demo", role: "ADMIN" });
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
