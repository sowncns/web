import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export const getCurrentUser = cache(async () => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
});

export const getCurrentProfile = cache(async () => {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id,email,username,full_name,balance,role,status,created_at,updated_at")
    .eq("id", user.id)
    .single();
  return data;
});

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
  const { data: profile } = await supabase.from("profiles").select("id,role,status").eq("id", user.id).single();
  return { ok: profile?.role === "ADMIN" && profile?.status === "ACTIVE", user, profile };
}
