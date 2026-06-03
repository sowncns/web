import { NextResponse } from "next/server";
import { bumpCacheVersion } from "@/lib/cache";
import { notifyAdminNewOrder } from "@/lib/admin-notifications";
import { createClient } from "@/lib/supabase/server";
import { deliverTemplateOrder, isTemplateProduct } from "@/lib/delivery";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { z } from "zod";

const purchaseSchema = z.object({
  productId: z.string().uuid("Sản phẩm không hợp lệ"),
  quantity: z.coerce.number().int().min(1).max(20),
  voucherCode: z.string().trim().max(50).optional()
});

export async function POST(request: Request) {
  try {
    const body = purchaseSchema.parse(await request.json());
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Vui lòng đăng nhập để mua hàng" }, { status: 401 });

    const { data: profile } = await supabase.from("profiles").select("status,email,username,full_name").eq("id", user.id).single();
    if (profile?.status === "BANNED") return NextResponse.json({ error: "Tài khoản đã bị khóa" }, { status: 403 });

    const isTemplate = await isTemplateProduct(body.productId);
    const quantity = isTemplate ? 1 : body.quantity;
    if (isTemplate) {
      const { data: stock } = await supabaseAdmin
        .from("stock_items")
        .select("id")
        .eq("product_id", body.productId)
        .eq("status", "AVAILABLE")
        .limit(1)
        .maybeSingle();
      if (!stock) return NextResponse.json({ error: "Template này chưa có link tải trong kho. Vui lòng liên hệ admin." }, { status: 409 });
    }

    const { data, error } = await supabaseAdmin.rpc("purchase_product_with_balance", {
      p_user_id: user.id,
      p_product_id: body.productId,
      p_quantity: quantity,
      p_customer_name: profile?.full_name || profile?.username || "Khách hàng",
      p_customer_email: profile?.username || profile?.email || user.email || "",
      p_note: "",
      p_voucher_code: body.voucherCode || null
    });

    if (error) throw new Error(error.message);
    await bumpCacheVersion("admin-dashboard");
    if (isTemplate && data?.orderId) {
      const delivery = await deliverTemplateOrder(data.orderId);
      if (!delivery.delivered && delivery.reason === "NO_TEMPLATE_STOCK") {
        return NextResponse.json({ error: "Template này chưa có link tải trong kho. Vui lòng liên hệ admin." }, { status: 409 });
      }
    }
    if (data?.orderId) await notifyAdminNewOrder(data.orderId);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Không thể mua hàng bằng số dư" }, { status: 400 });
  }
}
