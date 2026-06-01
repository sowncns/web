import { decryptText, encryptText } from "@/lib/encryption";
import { supabaseAdmin } from "@/lib/supabase/admin";

function getCategoryType(product: any) {
  const category = Array.isArray(product?.categories) ? product.categories[0] : product?.categories;
  return category?.category_type;
}

export async function isTemplateProduct(productId: string) {
  const { data: product } = await supabaseAdmin
    .from("products")
    .select("categories(category_type)")
    .eq("id", productId)
    .single();

  return getCategoryType(product) === "TEMPLATE";
}

export async function deliverTemplateOrder(orderId: string) {
  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("id, product_id")
    .eq("id", orderId)
    .single();

  if (!order?.product_id || !(await isTemplateProduct(order.product_id))) {
    return { delivered: false, reason: "NOT_TEMPLATE" };
  }

  const { data: stock } = await supabaseAdmin
    .from("stock_items")
    .select("*")
    .eq("product_id", order.product_id)
    .eq("status", "AVAILABLE")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!stock) {
    return { delivered: false, reason: "NO_TEMPLATE_STOCK" };
  }

  const delivery = {
    order_id: order.id,
    username_encrypted: encryptText(decryptText(stock.username_encrypted)),
    password_encrypted: encryptText(decryptText(stock.password_encrypted)),
    note_encrypted: encryptText(decryptText(stock.note_encrypted))
  };

  await supabaseAdmin.from("order_deliveries").delete().eq("order_id", order.id);
  const { error: deliveryError } = await supabaseAdmin.from("order_deliveries").insert(delivery);
  if (deliveryError) {
    return { delivered: false, reason: deliveryError.message };
  }

  await supabaseAdmin
    .from("orders")
    .update({
      delivery_username_encrypted: delivery.username_encrypted,
      delivery_password_encrypted: delivery.password_encrypted,
      delivery_note_encrypted: delivery.note_encrypted,
      order_status: "COMPLETED",
      updated_at: new Date().toISOString()
    })
    .eq("id", order.id);

  return { delivered: true };
}
