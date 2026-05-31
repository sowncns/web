import { NextResponse } from "next/server";
import { getAccountEmail, normalizeUsername } from "@/lib/account";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { loginSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const parsed = loginSchema.parse(await request.json());
    const username = normalizeUsername(parsed.username);

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id,email,status,role")
      .ilike("username", username)
      .maybeSingle();

    if (profileError) throw new Error(profileError.message);
    if (!profile) return NextResponse.json({ error: "Tài khoản hoặc mật khẩu không đúng" }, { status: 401 });
    if (profile.status === "BANNED") return NextResponse.json({ error: "Tài khoản đã bị khóa" }, { status: 403 });

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: profile.email || getAccountEmail(username),
      password: parsed.password
    });

    if (error) return NextResponse.json({ error: "Tài khoản hoặc mật khẩu không đúng" }, { status: 401 });
    return NextResponse.json({ role: profile.role });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Không thể đăng nhập" }, { status: 400 });
  }
}
