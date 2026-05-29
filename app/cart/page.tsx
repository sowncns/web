import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/CheckoutForm";
import { createClient } from "@/lib/supabase/server";
import { requireActiveUser } from "@/lib/auth";

export default async function CartPage({ searchParams }: { searchParams: { productId?: string } }) {
  if (!searchParams.productId) redirect("/products");
  const { profile } = await requireActiveUser();
  const supabase = createClient();
  const { data: product } = await supabase.from("products").select("*").eq("id", searchParams.productId).eq("is_active", true).single();
  if (!product) redirect("/products");
  return <div className="container-page py-5"><CheckoutForm product={product} profile={profile} /></div>;
}
