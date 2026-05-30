import { PaymentTopup } from "@/components/PaymentTopup";
import { requireActiveUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PaymentPage({ searchParams }: { searchParams: { status?: string; cancel?: string; orderCode?: string } }) {
  const { profile, user } = await requireActiveUser();
  const isCancelled = searchParams.cancel === "true" || searchParams.status === "CANCELLED" || searchParams.status === "cancel";

  if (isCancelled && searchParams.orderCode) {
    await supabaseAdmin
      .from("wallet_topups")
      .update({ payment_status: "CANCELLED", updated_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("order_code", Number(searchParams.orderCode))
      .eq("payment_status", "PENDING");
  }

  const supabase = createClient();
  const { data: topupsData } = await supabase
    .from("wallet_topups")
    .select("id,amount,order_code,payment_provider,payment_status,checkout_url,description,created_at,paid_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return <PaymentTopup balance={Number(profile.balance || 0)} topups={topupsData ?? []} />;
}
