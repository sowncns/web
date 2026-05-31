import { NextResponse } from "next/server";
import { normalizeUsername } from "@/lib/account";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function getSafeNext(request: Request) {
  const { searchParams } = new URL(request.url);
  const next = searchParams.get("next") || "/account";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/account";
}

function makeGoogleUsername(user: { id: string; email?: string; user_metadata?: Record<string, unknown> }) {
  const source = String(user.user_metadata?.name || user.user_metadata?.full_name || user.email || user.id);
  const base = normalizeUsername(source.split("@")[0]).replace(/[^a-z0-9._-]/g, "").slice(0, 24);
  const fallback = `google${user.id.replace(/-/g, "").slice(0, 8)}`;
  const username = base.length >= 6 ? base : fallback;
  return username;
}

async function ensureGoogleProfile() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id,username,full_name,email")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.username) return;

  const username = makeGoogleUsername(user);
  const fullName = String(user.user_metadata?.full_name || user.user_metadata?.name || profile?.full_name || "");
  const update = {
    id: user.id,
    email: user.email,
    username,
    full_name: fullName,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabaseAdmin.from("profiles").upsert(update, { onConflict: "id" });
  if (!error) return;

  await supabaseAdmin.from("profiles").upsert({
    ...update,
    username: `${username.slice(0, 20)}${user.id.replace(/-/g, "").slice(0, 8)}`
  }, { onConflict: "id" });
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const oauthError = requestUrl.searchParams.get("error_description") || requestUrl.searchParams.get("error");
  const next = getSafeNext(request);

  if (oauthError) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(oauthError)}`, request.url));
  }

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      await ensureGoogleProfile();
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  return NextResponse.redirect(new URL("/login?error=Không thể đăng nhập bằng Google", request.url));
}
