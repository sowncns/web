import { NextResponse } from "next/server";
import { payOS } from "@/lib/payos";
import { isTemplateProduct } from "@/lib/delivery";
import { bumpCacheVersion } from "@/lib/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getAppUrl } from "@/lib/url";
import { createPaymentSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = createPaymentSchema.parse(await request.json());
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    let profile: any = null;
    if (user) {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      profile = data;
      if (profile?.status === "BANNED") return NextResponse.json({ error: "Tài khoản đã bị khóa" }, { status: 403 });
    }
    const { data: product, error: productError } = await supabaseAdmin.from("products").select("*").eq("id", body.productId).eq("is_active", true).single();
    if (productError || !product) return NextResponse.json({ error: "Sản phẩm không khả dụng" }, { status: 404 });
    const isTemplate = await isTemplateProduct(product.id);
    const quantity = isTemplate ? 1 : body.quantity;
    if (isTemplate) {
      const { data: stock } = await supabaseAdmin
        .from("stock_items")
        .select("id")
        .eq("product_id", product.id)
        .eq("status", "AVAILABLE")
        .limit(1)
        .maybeSingle();
      if (!stock) return NextResponse.json({ error: "Template này chưa có link tải trong kho. Vui lòng liên hệ admin." }, { status: 409 });
    }
    const totalAmount = Number(product.price) * quantity;
    const { data: order, error: orderError } = await supabaseAdmin.from("orders").insert({
      user_id: user?.id || null,
      customer_name: body.customerName,
      customer_email: profile?.username || profile?.email || user?.email || body.customerName,
      product_id: product.id,
      quantity,
      subtotal_amount: totalAmount,
      discount_amount: 0,
      total_amount: totalAmount,
      note: body.note,
      payment_status: "PENDING",
      order_status: "PENDING"
    }).select("*").single();
    if (orderError) throw new Error(orderError.message);
    const orderCode = Number(order.order_code);
    await bumpCacheVersion("admin-dashboard");
    const appUrl = getAppUrl(request);
    const paymentLink = await payOS.paymentRequests.create({
      orderCode,
      amount: totalAmount,
      description: `Don hang ${orderCode}`.slice(0, 25),
      returnUrl: `${appUrl}/payment/success?orderCode=${orderCode}`,
      cancelUrl: `${appUrl}/payment/cancel?orderCode=${orderCode}`,
      buyerName: body.customerName,
      buyerEmail: profile?.email || user?.email || undefined,
      items: [{ name: product.name, quantity, price: Number(product.price) }]
    });
    return NextResponse.json({
      orderId: order.id,
      orderCode,
      checkoutUrl: paymentLink.checkoutUrl,
      payment: {
        qrCode: paymentLink.qrCode,
        accountNumber: paymentLink.accountNumber,
        accountName: paymentLink.accountName,
        amount: paymentLink.amount,
        description: paymentLink.description,
        bin: paymentLink.bin
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Không tạo được thanh toán" }, { status: 400 });
  }
}
