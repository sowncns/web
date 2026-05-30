import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getAppUrl } from "@/lib/url";
import { registerSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const parsed = registerSchema.parse(await request.json());
    const email = parsed.email.trim().toLowerCase();

    const { data: existingProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .ilike("email", email)
      .maybeSingle();

    if (profileError) throw new Error(profileError.message);
    if (existingProfile) {
      return NextResponse.json({ error: "Email này đã được đăng ký. Vui lòng đăng nhập." }, { status: 409 });
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password: parsed.password,
      options: {
        emailRedirectTo: `${getAppUrl(request)}/account`,
        data: { full_name: parsed.fullName, phone: parsed.phone }
      }
    });

    if (error || !data.user) {
      return NextResponse.json({ error: error?.message || "Không thể đăng ký" }, { status: 400 });
    }

    return NextResponse.json({ hasSession: Boolean(data.session) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Không thể đăng ký" }, { status: 400 });
  }
}
