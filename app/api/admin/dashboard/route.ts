import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { cacheRemember, createCacheKey, getCacheVersion } from "@/lib/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const admin = await isAdminRequest();
  if (!admin.ok) return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  const dashboardVersion = await getCacheVersion("admin-dashboard");
  const data = await cacheRemember(
    createCacheKey(["api-admin-dashboard", dashboardVersion]),
    { ttl: 30 },
    async () => {
      const [{ data: ordersData }, { count: products }, { count: stocks }] = await Promise.all([
        supabaseAdmin.from("orders").select("id,order_code,total_amount,payment_status,order_status,paid_at,created_at,products(name)").order("created_at", { ascending: false }).limit(50),
        supabaseAdmin.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabaseAdmin.from("stock_items").select("id", { count: "exact", head: true }).eq("status", "AVAILABLE")
      ]);
      return { orders: ordersData ?? [], products, stocks };
    }
  );
  return NextResponse.json(data);
}
