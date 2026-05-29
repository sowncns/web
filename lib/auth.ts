import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return data;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireActiveUser() {
  const user = await requireAuth();
  const profile = await getCurrentProfile();
  if (!profile || profile.status !== "ACTIVE") redirect("/login?error=Tài khoản đã bị khóa");
  return { user, profile };
}

export async function requireAdmin() {
  const user = await requireAuth();
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "ADMIN" || profile.status !== "ACTIVE") redirect("/");
  return { user, profile };
}

export async function isAdminRequest() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, user: null, profile: null };
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return { ok: profile?.role === "ADMIN" && profile?.status === "ACTIVE", user, profile };
}
