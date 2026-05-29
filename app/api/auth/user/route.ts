import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ user: null, profile: null });
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return NextResponse.json({ user, profile });
}

export async function PATCH(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  const body = await request.json();
  const { error } = await supabase.from("profiles").update({
    full_name: String(body.full_name || ""),
    phone: String(body.phone || ""),
    updated_at: new Date().toISOString()
  }).eq("id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
