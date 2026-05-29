import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ticketSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("status").eq("id", user.id).single();
  if (profile?.status === "BANNED") return NextResponse.json({ error: "Tài khoản đã bị khóa" }, { status: 403 });
  const body = ticketSchema.parse(await request.json());
  const { data, error } = await supabase.from("support_tickets").insert({ ...body, user_id: user.id }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
