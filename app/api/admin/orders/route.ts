import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const admin = await isAdminRequest();
  if (!admin.ok) return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  const { searchParams } = new URL(request.url);
  let query = supabaseAdmin.from("orders").select("*, products(name)").order("created_at", { ascending: false });
  if (searchParams.get("payment_status")) query = query.eq("payment_status", searchParams.get("payment_status"));
  if (searchParams.get("order_status")) query = query.eq("order_status", searchParams.get("order_status"));
  if (searchParams.get("orderCode")) query = query.eq("order_code", Number(searchParams.get("orderCode")));
  const search = searchParams.get("search");
  if (search) query = /^\d+$/.test(search)
    ? query.or(`customer_email.ilike.%${search}%,customer_phone.ilike.%${search}%,order_code.eq.${search}`)
    : query.or(`customer_email.ilike.%${search}%,customer_phone.ilike.%${search}%`);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
