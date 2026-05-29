import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const admin = await isAdminRequest();
  if (!admin.ok) return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  const [{ data: ordersData }, { count: products }, { count: stocks }] = await Promise.all([
    supabaseAdmin.from("orders").select("*").order("created_at", { ascending: false }).limit(50),
    supabaseAdmin.from("products").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabaseAdmin.from("stock_items").select("*", { count: "exact", head: true }).eq("status", "AVAILABLE")
  ]);
  const orders = ordersData ?? [];
  return NextResponse.json({ orders, products, stocks });
}
