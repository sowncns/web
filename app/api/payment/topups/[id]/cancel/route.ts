import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });

  const { error } = await supabaseAdmin
    .from("wallet_topups")
    .update({ payment_status: "CANCELLED", updated_at: new Date().toISOString() })
    .eq("id", params.id)
    .eq("user_id", user.id)
    .eq("payment_status", "PENDING");

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
