import { NextResponse } from "next/server";
import { payOS } from "@/lib/payos";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getAppUrl } from "@/lib/url";
import { createTopupPaymentSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = createTopupPaymentSchema.parse(await request.json());
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Vui lòng đăng nhập để nạp tiền" }, { status: 401 });

    const { data: profile } = await supabase.from("profiles").select("status,email,full_name,phone").eq("id", user.id).single();
    if (profile?.status === "BANNED") return NextResponse.json({ error: "Tài khoản đã bị khóa" }, { status: 403 });

    const orderCode = Number(`${Date.now()}${Math.floor(Math.random() * 90 + 10)}`.slice(0, 15));
    const appUrl = getAppUrl(request);
    const description = `Nap tien ${orderCode}`.slice(0, 25);

    const { data: topup, error: topupError } = await supabaseAdmin.from("wallet_topups").insert({
      user_id: user.id,
      amount: body.amount,
      order_code: orderCode,
      payment_status: "PENDING"
    }).select("*").single();

    if (topupError) throw new Error(`Không tạo được giao dịch nạp tiền: ${topupError.message}`);

    const paymentLink = await payOS.paymentRequests.create({
      orderCode,
      amount: body.amount,
      description,
      returnUrl: `${appUrl}/payment?status=success&orderCode=${orderCode}`,
      cancelUrl: `${appUrl}/payment?status=cancel&orderCode=${orderCode}`,
      buyerName: profile?.full_name || user.email || "Khach hang",
      buyerEmail: profile?.email || user.email || undefined,
      buyerPhone: profile?.phone || undefined,
      items: [{ name: "Nap so du SHOPMMOGIARE", quantity: 1, price: body.amount }]
    });

    const { error: updateError } = await supabaseAdmin.from("wallet_topups").update({
      checkout_url: paymentLink.checkoutUrl,
      qr_code: paymentLink.qrCode,
      account_number: paymentLink.accountNumber,
      account_name: paymentLink.accountName,
      description: paymentLink.description,
      updated_at: new Date().toISOString()
    }).eq("id", topup.id);

    if (updateError) throw new Error(`Đã tạo payOS nhưng không lưu được thông tin thanh toán: ${updateError.message}`);

    return NextResponse.json({
      topupId: topup.id,
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
