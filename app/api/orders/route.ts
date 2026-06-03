import { NextResponse } from "next/server";
import { bumpCacheVersion } from "@/lib/cache";
import { notifyAdminNewOrder } from "@/lib/admin-notifications";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const body = await request.json();
  const subtotalAmount = body.subtotal_amount ?? body.total_amount ?? 0;
  const { data, error } = await supabase.from("orders").insert({ ...body, subtotal_amount: subtotalAmount, user_id: user?.id || null }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await bumpCacheVersion("admin-dashboard");
  await notifyAdminNewOrder(data.id);
  return NextResponse.json(data);
}
