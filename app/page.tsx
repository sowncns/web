import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, CreditCard, Headphones, ShieldCheck, Wallet, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/ProductGrid";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";

export default async function HomePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from("profiles").select("role,balance").eq("id", user.id).single() : { data: null };
  if (profile?.role === "ADMIN") {
    redirect("/admin");
  }
  const { data: productsData } = await supabase.from("products").select("*").eq("is_active", true).limit(8);
  const products = productsData ?? [];
  const categories = ["CapCut", "Canva", "AI Tools", "Streaming", "Game", "Office"];

  return (
    <>
      <section className="container-page py-5">
        <div className="mb-4">
          <h1 className="text-xl font-bold tracking-normal text-slate-950">Quản lý dịch vụ số</h1>
          <p className="mt-2 text-sm text-muted-foreground">Xem và mua các gói dịch vụ số hợp lệ, thanh toán payOS và nhận thông tin trong chi tiết đơn hàng.</p>
        </div>
        <div className="grid gap-4 xl:grid-cols-[1fr_460px]">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="flex gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p><strong>Lưu ý quan trọng:</strong> Website chỉ bán dịch vụ/license hợp lệ. Không hỗ trợ crack, bypass thanh toán hoặc chia sẻ trái phép tài khoản.</p>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-md bg-blue-50 text-primary"><Wallet className="h-5 w-5" /></div>
                <div>
                  <p className="text-xs text-muted-foreground">Nạp tiền</p>
                  <p className="text-lg font-bold text-slate-950">Số dư hiện tại</p>
                  <p className="text-sm font-semibold text-primary">{formatCurrency(Number(profile?.balance || 0))}</p>
                </div>
              </div>
              <Button asChild><Link href="/payment">Nạp tiền</Link></Button>
            </div>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {categories.map((name) => (
            <Link key={name} href="/products" className="rounded-lg border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-700 shadow-sm hover:border-blue-200 hover:text-primary">
              {name}
            </Link>
          ))}
        </div>
      </section>
      <section className="container-page pb-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold">Sản phẩm nổi bật</h2>
            <p className="text-sm text-muted-foreground">Tài khoản/mật khẩu chỉ hiển thị sau khi thanh toán thành công và đơn hoàn tất.</p>
          </div>
          <Button asChild variant="outline"><Link href="/products">Tất cả</Link></Button>
        </div>
        <ProductGrid products={products as any} />
      </section>
      <section className="container-page pb-8">
        <h2 className="text-lg font-bold">Vì sao chọn chúng tôi?</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          {[
            [CreditCard, "Thanh toán tự động qua payOS"],
            [Headphones, "Hỗ trợ bảo hành"],
            [Zap, "Giao hàng nhanh"],
            [ShieldCheck, "Dịch vụ/license hợp lệ"]
          ].map(([Icon, title]) => (
            <div key={String(title)} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <Icon className="h-6 w-6 text-primary" />
              <p className="mt-4 font-semibold">{String(title)}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
