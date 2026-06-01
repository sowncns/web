import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { z } from "zod";

const purchaseSchema = z.object({
  productId: z.string().uuid("Sản phẩm không hợp lệ"),
  quantity: z.coerce.number().int().min(1).max(20)
});

function getCategoryType(product: any) {
  const category = Array.isArray(product?.categories) ? product.categories[0] : product?.categories;
  return category?.category_type;
}

export async function POST(request: Request) {
  try {
    const body = purchaseSchema.parse(await request.json());
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Vui lòng đăng nhập để mua hàng" }, { status: 401 });

    const { data: profile } = await supabase.from("profiles").select("status,email,username,full_name").eq("id", user.id).single();
    if (profile?.status === "BANNED") return NextResponse.json({ error: "Tài khoản đã bị khóa" }, { status: 403 });

    const { data: product } = await supabaseAdmin
      .from("products")
      .select("id, categories(category_type)")
      .eq("id", body.productId)
      .single();
    const isTemplate = getCategoryType(product) === "TEMPLATE";
    const quantity = isTemplate ? 1 : body.quantity;

    const { data, error } = await supabaseAdmin.rpc("purchase_product_with_balance", {
      p_user_id: user.id,
      p_product_id: body.productId,
      p_quantity: quantity,
      p_customer_name: profile?.full_name || profile?.username || "Khách hàng",
      p_customer_email: profile?.username || profile?.email || user.email || "",
      p_note: ""
    });

    if (error) throw new Error(error.message);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Không thể mua hàng bằng số dư" }, { status: 400 });
  }
}
