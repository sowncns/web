import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { z } from "zod";

const purchaseSchema = z.object({
  productId: z.string().uuid("Sản phẩm không hợp lệ"),
  quantity: z.coerce.number().int().min(1).max(20)
});

export async function POST(request: Request) {
  try {
    const body = purchaseSchema.parse(await request.json());
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Vui lòng đăng nhập để mua hàng" }, { status: 401 });

    const { data: profile } = await supabase.from("profiles").select("status,email,full_name,phone").eq("id", user.id).single();
    if (profile?.status === "BANNED") return NextResponse.json({ error: "Tài khoản đã bị khóa" }, { status: 403 });

    const { data, error } = await supabaseAdmin.rpc("purchase_product_with_balance", {
      p_user_id: user.id,
      p_product_id: body.productId,
      p_quantity: body.quantity,
      p_customer_name: profile?.full_name || user.email || "Khách hàng",
      p_customer_email: profile?.email || user.email || "",
      p_customer_phone: profile?.phone || "",
      p_note: ""
    });

    if (error) throw new Error(error.message);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Không thể mua hàng bằng số dư" }, { status: 400 });
  }
}
