import { NextResponse } from "next/server";
import { payOS } from "@/lib/payos";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
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
    const totalAmount = Number(product.price) * body.quantity;
    const orderCode = Number(`${Date.now()}${Math.floor(Math.random() * 90 + 10)}`.slice(0, 15));
    const { data: order, error: orderError } = await supabaseAdmin.from("orders").insert({
      user_id: user?.id || null,
      customer_name: body.customerName,
      customer_email: body.customerEmail,
      customer_phone: body.customerPhone,
      product_id: product.id,
      quantity: body.quantity,
      total_amount: totalAmount,
      order_code: orderCode,
      note: body.note,
      payment_status: "PENDING",
      order_status: "PENDING"
    }).select("*").single();
    if (orderError) throw new Error(orderError.message);
    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const paymentLink = await payOS.paymentRequests.create({
      orderCode,
      amount: totalAmount,
      description: `Don hang ${orderCode}`.slice(0, 25),
      returnUrl: `${appUrl}/payment/success?orderCode=${orderCode}`,
      cancelUrl: `${appUrl}/payment/cancel?orderCode=${orderCode}`,
      buyerName: body.customerName,
      buyerEmail: body.customerEmail,
      buyerPhone: body.customerPhone,
      items: [{ name: product.name, quantity: body.quantity, price: Number(product.price) }]
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
