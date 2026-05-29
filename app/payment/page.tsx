import { PaymentTopup } from "@/components/PaymentTopup";
import { requireActiveUser } from "@/lib/auth";

export default async function PaymentPage() {
  const { profile } = await requireActiveUser();
  return <PaymentTopup balance={Number(profile.balance || 0)} />;
}
