import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function getNextOrderCode() {
  const { data, error } = await supabaseAdmin.rpc("next_order_code");
  if (error) {
    throw new Error("Database chưa có sequence tạo mã đơn. Hãy chạy supabase/order-code-sequence-migration.sql trên Supabase.");
  }
  return Number(data);
}
