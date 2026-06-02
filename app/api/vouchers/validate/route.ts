import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { voucherValidateSchema } from "@/lib/validations";

function calculateDiscount(voucher: any, subtotal: number) {
  const discountValue = Number(voucher.discount_value || 0);
  const rawDiscount = voucher.discount_type === "PERCENT" ? subtotal * (discountValue / 100) : discountValue;
  return Math.max(0, Math.min(subtotal, Math.floor(rawDiscount)));
}

export async function POST(request: Request) {
  try {
    const body = voucherValidateSchema.parse(await request.json());
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Vui lòng đăng nhập để dùng voucher" }, { status: 401 });

    const { data: product } = await supabaseAdmin
      .from("products")
      .select("id,price,is_active,categories(category_type)")
      .eq("id", body.productId)
      .eq("is_active", true)
      .single();
    if (!product) return NextResponse.json({ error: "Sản phẩm không khả dụng" }, { status: 400 });

    const isTemplate = (product as any).categories?.category_type === "TEMPLATE";
    const quantity = isTemplate ? 1 : body.quantity;
    const subtotal = Number(product.price || 0) * quantity;
    const code = body.voucherCode.trim().toUpperCase();
    const now = new Date().toISOString();

    const { data: voucher } = await supabaseAdmin
      .from("vouchers")
      .select("id,code,description,discount_type,discount_value,min_order_amount,max_uses,used_count,starts_at,expires_at,is_active")
      .eq("code", code)
      .maybeSingle();

    if (!voucher || !voucher.is_active) return NextResponse.json({ error: "Voucher không tồn tại hoặc đã tắt" }, { status: 400 });
    if (voucher.starts_at && voucher.starts_at > now) return NextResponse.json({ error: "Voucher chưa đến thời gian sử dụng" }, { status: 400 });
    if (voucher.expires_at && voucher.expires_at < now) return NextResponse.json({ error: "Voucher đã hết hạn" }, { status: 400 });
    if (voucher.max_uses !== null && voucher.max_uses !== undefined && Number(voucher.used_count || 0) >= Number(voucher.max_uses)) {
      return NextResponse.json({ error: "Voucher đã hết lượt sử dụng" }, { status: 400 });
    }
    if (subtotal < Number(voucher.min_order_amount || 0)) {
      return NextResponse.json({ error: `Đơn hàng cần tối thiểu ${Number(voucher.min_order_amount).toLocaleString("vi-VN")}đ để dùng voucher` }, { status: 400 });
    }

    const discountAmount = calculateDiscount(voucher, subtotal);
    return NextResponse.json({
      code: voucher.code,
      discountType: voucher.discount_type,
      discountValue: Number(voucher.discount_value),
      discountAmount,
      subtotalAmount: subtotal,
      totalAmount: Math.max(0, subtotal - discountAmount)
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Không thể kiểm tra voucher" }, { status: 400 });
  }
}
