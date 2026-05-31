import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAccountEmail, normalizeUsername } from "@/lib/account";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { registerSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const parsed = registerSchema.parse(await request.json());
    const username = normalizeUsername(parsed.username);
    const email = getAccountEmail(username);

    const { data: existingUsernameProfile, error: usernameProfileError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .ilike("username", username)
      .maybeSingle();

    if (usernameProfileError) throw new Error(usernameProfileError.message);
    if (existingUsernameProfile) {
      return NextResponse.json({ error: "Tài khoản này đã được sử dụng." }, { status: 409 });
    }

    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: parsed.password,
      email_confirm: true,
      user_metadata: {
        username,
        full_name: parsed.fullName
      }
    });

    if (createError || !created.user) {
      return NextResponse.json({ error: createError?.message || "Không thể đăng ký" }, { status: 400 });
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: parsed.password
    });

    if (error || !data.session) {
      return NextResponse.json({ error: error?.message || "Không thể đăng nhập sau khi đăng ký" }, { status: 400 });
    }

    return NextResponse.json({ hasSession: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Không thể đăng ký" }, { status: 400 });
  }
}
