import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, CreditCard, Search, ShieldCheck, Wallet, Zap, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductGrid } from "@/components/ProductGrid";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth";
import { cacheRemember, createCacheKey, getCacheVersion } from "@/lib/cache";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";

export default async function HomePage() {
  const supabase = createClient();
  const user = await getCurrentUser();
  const profile = user ? await getCurrentProfile() : null;
  if (profile?.role === "ADMIN") {
    redirect("/admin");
  }
  const productsVersion = await getCacheVersion("products");
  const products = await cacheRemember(
    createCacheKey(["home-featured-products", productsVersion]),
    { ttl: 60 },
    async () => {
      const { data } = await supabase
        .from("products")
        .select("id,name,slug,image_url,price,duration,categories(category_type)")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(8);
      return data ?? [];
    }
  );

  return (
    <div className="relative">
      <section className="container-page py-12 lg:py-20">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary shadow-sm backdrop-blur-sm">
            <Star className="h-4 w-4" fill="currentColor" /> Premium Digital Services
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Nâng tầm trải nghiệm số với <span className="text-gradient">SHOPMMOGIARE</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-slate-600 sm:text-xl">
            Cung cấp các gói dịch vụ số và bản quyền phần mềm chính hãng. Thanh toán tự động 24/7, kích hoạt ngay lập tức.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="rounded-full px-8 shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-transform">
              <Link href="/products">Khám phá ngay <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-8">
              <Link href="/templates">Xem template</Link>
            </Button>
            <form action="/products" className="relative flex w-full max-w-sm sm:w-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input name="search" placeholder="Tìm sản phẩm..." className="h-11 w-full rounded-full border-slate-200 bg-white pl-12 pr-4 shadow-sm focus-visible:ring-primary" />
            </form>
          </div>
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="glass rounded-2xl p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex items-center gap-4 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 p-5 text-white shadow-lg">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white/20 backdrop-blur-md">
                  <Wallet className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-indigo-100 font-medium">Số dư tài khoản</p>
                  <p className="text-2xl font-bold tracking-tight">{formatCurrency(Number(profile?.balance || 0))}</p>
                </div>
                <div className="ml-auto">
                  <Button asChild variant="secondary" size="sm" className="rounded-full bg-white text-indigo-600 hover:bg-slate-50">
                    <Link href="/payment">Nạp tiền</Link>
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-xl border border-rose-100 bg-rose-50 p-5 text-rose-800">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-rose-100">
                  <AlertTriangle className="h-6 w-6 text-rose-600" />
                </div>
                <div className="text-sm">
                  <p className="font-bold">Chính sách nền tảng</p>
                  <p className="mt-0.5 text-rose-700/80">Chỉ cung cấp dịch vụ/license hợp lệ. Tuyệt đối không hỗ trợ crack hoặc chia sẻ trái phép.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-10">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900">Sản phẩm nổi bật</h2>
            <p className="mt-2 text-slate-500">Dịch vụ số và template landing page được khách hàng tin dùng</p>
          </div>
          <Button asChild variant="ghost" className="hidden sm:flex text-primary hover:bg-primary/10 hover:text-primary">
            <Link href="/products">Xem tất cả <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
        <ProductGrid products={products as any} />
        <div className="mt-8 flex justify-center sm:hidden">
          <Button asChild variant="outline" className="w-full rounded-full">
            <Link href="/products">Xem tất cả</Link>
          </Button>
        </div>
      </section>

      <section className="container-page py-16 lg:py-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-black text-slate-900">Tại sao chọn SHOPMMOGIARE?</h2>
          <p className="mt-4 text-slate-500">Chúng tôi cam kết mang lại dịch vụ tốt nhất với mức giá hợp lý và quy trình hoàn toàn tự động.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [CreditCard, "Thanh toán tự động", "Hệ thống duyệt nạp tiền qua payOS trong 3 giây 24/7."],
            [Wallet, "Quản lý số dư", "Minh bạch mọi giao dịch, lịch sử nạp và mua hàng rõ ràng."],
            [Zap, "Giao hàng siêu tốc", "Nhận tài khoản/license ngay lập tức sau khi thanh toán."],
            [ShieldCheck, "An toàn tuyệt đối", "Sản phẩm chính hãng, bảo hành trọn thời gian sử dụng."]
          ].map(([Icon, title, desc]) => (
            <div key={String(title)} className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 text-center">
              <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
                <Icon className="h-7 w-7" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-900">{String(title)}</h3>
              <p className="text-sm leading-relaxed text-slate-500">{String(desc)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
