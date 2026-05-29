import { NextResponse } from "next/server";
import { payOS } from "@/lib/payos";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const rawBody = await request.text();
  try {
    const payload = JSON.parse(rawBody);
    const verified = await payOS.webhooks.verify(payload);
    const orderCode = Number(verified.orderCode);
    if (!orderCode) return NextResponse.json({ error: "Thiếu orderCode" }, { status: 400 });
    const { data: order } = await supabaseAdmin.from("orders").select("*").eq("order_code", orderCode).single();
    if (order) {
      await supabaseAdmin.from("payment_logs").insert({ order_id: order.id, provider: "PAYOS", raw_data: payload });
      const code = String(verified.code || "");
      const desc = String(verified.desc || "");
      const success = code === "00" || desc.toLowerCase().includes("success") || payload.success === true;
      if (success && order.payment_status !== "PAID") {
        await supabaseAdmin.from("orders").update({
          payment_status: "PAID",
          order_status: "PROCESSING",
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }).eq("id", order.id);
      }
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Webhook payOS không hợp lệ" }, { status: 400 });
  }
}
