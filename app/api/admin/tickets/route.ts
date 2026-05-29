import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const admin = await isAdminRequest();
  if (!admin.ok) return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  const { data } = await supabaseAdmin.from("support_tickets").select("*, profiles(email), orders(order_code)").order("created_at", { ascending: false });
  return NextResponse.json(data);
}
