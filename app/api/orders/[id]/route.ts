import { NextResponse } from "next/server";
import { decryptText } from "@/lib/encryption";
import { createClient } from "@/lib/supabase/server";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  let query = supabase.from("orders").select("*, products(*)").eq("id", params.id);
  if (profile?.role !== "ADMIN") query = query.eq("user_id", user.id);
  const { data: order, error } = await query.single();
  if (error || !order) return NextResponse.json({ error: "Không tìm thấy đơn hàng" }, { status: 404 });
  const canViewDelivery = order.payment_status === "PAID" && order.order_status === "COMPLETED";
  const { data: deliveryRows = [] } = canViewDelivery ? await supabase.from("order_deliveries").select("*").eq("order_id", order.id).order("created_at") : { data: [] };
  const deliveries = (deliveryRows || []).map((row: any) => ({
    username: decryptText(row.username_encrypted),
    password: decryptText(row.password_encrypted),
    note: decryptText(row.note_encrypted)
  }));
  return NextResponse.json({
    ...order,
    deliveries,
    delivery: canViewDelivery && !deliveries.length ? {
      username: decryptText(order.delivery_username_encrypted),
      password: decryptText(order.delivery_password_encrypted),
      note: decryptText(order.delivery_note_encrypted)
    } : null
  });
}
