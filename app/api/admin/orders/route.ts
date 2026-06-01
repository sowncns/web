import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const admin = await isAdminRequest();
  if (!admin.ok) return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") || 50)));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  let query = supabaseAdmin
    .from("orders")
    .select("id,order_code,customer_email,total_amount,payment_status,order_status,created_at,products(name)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);
  if (searchParams.get("payment_status")) query = query.eq("payment_status", searchParams.get("payment_status"));
  if (searchParams.get("order_status")) query = query.eq("order_status", searchParams.get("order_status"));
  if (searchParams.get("orderCode")) query = query.eq("order_code", Number(searchParams.get("orderCode")));
  const search = searchParams.get("search");
  if (search) query = /^\d+$/.test(search)
    ? query.or(`customer_email.ilike.%${search}%,order_code.eq.${search}`)
    : query.or(`customer_email.ilike.%${search}%`);
  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data, count, page, pageSize });
}
