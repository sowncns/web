import { NextResponse } from "next/server";
import { decryptText, encryptText } from "@/lib/encryption";
import { isAdminRequest } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { orderPatchSchema } from "@/lib/validations";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const admin = await isAdminRequest();
  if (!admin.ok) return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  const { data, error } = await supabaseAdmin.from("orders").select("*, products(name)").eq("id", params.id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const admin = await isAdminRequest();
  if (!admin.ok) return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  const body = orderPatchSchema.parse(await request.json());
  const { data: order } = await supabaseAdmin.from("orders").select("*").eq("id", params.id).single();
  if (!order) return NextResponse.json({ error: "Không tìm thấy đơn hàng" }, { status: 404 });
  if (body.action === "update_status") {
    await supabaseAdmin.from("orders").update({ order_status: body.order_status, updated_at: new Date().toISOString() }).eq("id", params.id);
    return NextResponse.json({ ok: true });
  }
  if (order.payment_status !== "PAID") return NextResponse.json({ error: "Chỉ cấp tài khoản cho đơn đã thanh toán" }, { status: 400 });
  if (body.action === "auto_delivery") {
    const { data: stock } = await supabaseAdmin.from("stock_items").select("*").eq("product_id", order.product_id).eq("status", "AVAILABLE").order("created_at", { ascending: true }).limit(1).single();
    if (!stock) return NextResponse.json({ error: "Sản phẩm này đã hết tài khoản trong kho. Vui lòng cấp thủ công." }, { status: 409 });
    const username = decryptText(stock.username_encrypted);
    const password = decryptText(stock.password_encrypted);
    const note = decryptText(stock.note_encrypted);
    await supabaseAdmin.from("orders").update({
      delivery_username_encrypted: encryptText(username),
      delivery_password_encrypted: encryptText(password),
      delivery_note_encrypted: encryptText(note),
      order_status: "COMPLETED",
      updated_at: new Date().toISOString()
    }).eq("id", order.id);
    await supabaseAdmin.from("stock_items").update({ status: "USED", used_by_order_id: order.id, used_at: new Date().toISOString() }).eq("id", stock.id);
    return NextResponse.json({ ok: true });
  }
  await supabaseAdmin.from("orders").update({
    delivery_username_encrypted: encryptText(body.username),
    delivery_password_encrypted: encryptText(body.password),
    delivery_note_encrypted: encryptText(body.note),
    order_status: "COMPLETED",
    updated_at: new Date().toISOString()
  }).eq("id", order.id);
  return NextResponse.json({ ok: true });
}
