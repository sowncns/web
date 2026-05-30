import { NextResponse } from "next/server";
import { decryptText, encryptText } from "@/lib/encryption";
import { isAdminRequest } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { orderPatchSchema } from "@/lib/validations";

const DEFAULT_DELIVERY_NOTE = "đăng nhập trên điện thoại trước rồi quét mã đăng nhập trên PC";

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
    const needed = Number(order.quantity || 1);
    const { data: stockItems } = await supabaseAdmin.from("stock_items").select("*").eq("product_id", order.product_id).eq("status", "AVAILABLE").order("created_at", { ascending: true }).limit(needed);
    if (!stockItems?.length || stockItems.length < needed) return NextResponse.json({ error: "Sản phẩm này đã hết tài khoản trong kho. Vui lòng cấp thủ công hoặc bổ sung kho." }, { status: 409 });
    const deliveries = stockItems.map((stock) => ({
      order_id: order.id,
      username_encrypted: encryptText(decryptText(stock.username_encrypted)),
      password_encrypted: encryptText(decryptText(stock.password_encrypted)),
      note_encrypted: encryptText(decryptText(stock.note_encrypted))
    }));
    await supabaseAdmin.from("order_deliveries").delete().eq("order_id", order.id);
    const { error: deliveryError } = await supabaseAdmin.from("order_deliveries").insert(deliveries);
    if (deliveryError) return NextResponse.json({ error: deliveryError.message }, { status: 400 });
    const first = stockItems[0];
    await supabaseAdmin.from("orders").update({
      delivery_username_encrypted: first.username_encrypted,
      delivery_password_encrypted: first.password_encrypted,
      delivery_note_encrypted: first.note_encrypted,
      order_status: "COMPLETED",
      updated_at: new Date().toISOString()
    }).eq("id", order.id);
    await supabaseAdmin.from("stock_items").update({ status: "USED", used_by_order_id: order.id, used_at: new Date().toISOString() }).in("id", stockItems.map((stock) => stock.id));
    return NextResponse.json({ ok: true });
  }
  await supabaseAdmin.from("order_deliveries").delete().eq("order_id", order.id);
  const lines = body.lines
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const needed = Number(order.quantity || 1);
  if (lines.length !== needed) {
    return NextResponse.json({ error: `Đơn này cần ${needed} tài khoản, bạn đã nhập ${lines.length} dòng hợp lệ.` }, { status: 400 });
  }
  const parsedLines = lines.map((line) => {
    const [username = "", password = "", ...noteParts] = line.split("|").map((part) => part.trim());
    return { username, password, note: noteParts.join("|") || DEFAULT_DELIVERY_NOTE };
  });
  if (parsedLines.some((line) => !line.username || !line.password)) {
    return NextResponse.json({ error: "Mỗi dòng cần đúng dạng username|password|ghi chú" }, { status: 400 });
  }
  const deliveries = parsedLines.map((line) => {
    return {
      order_id: order.id,
      username_encrypted: encryptText(line.username),
      password_encrypted: encryptText(line.password),
      note_encrypted: encryptText(line.note)
    };
  });
  const { error: deliveryError } = await supabaseAdmin.from("order_deliveries").insert(deliveries);
  if (deliveryError) return NextResponse.json({ error: deliveryError.message }, { status: 400 });
  const firstLine = parsedLines[0];
  await supabaseAdmin.from("orders").update({
    delivery_username_encrypted: encryptText(firstLine.username),
    delivery_password_encrypted: encryptText(firstLine.password),
    delivery_note_encrypted: encryptText(firstLine.note),
    order_status: "COMPLETED",
    updated_at: new Date().toISOString()
  }).eq("id", order.id);
  return NextResponse.json({ ok: true });
}
