import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, ShieldCheck, HelpCircle, Package, ArrowRight, Zap, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/ProductGrid";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: product } = await supabase.from("products").select("*, categories(category_type)").eq("slug", params.slug).eq("is_active", true).single();
  if (!product) notFound();
  const isTemplate = product.categories?.category_type === "TEMPLATE";
  let relatedQuery = supabase.from("products").select("*, categories!inner(category_type)").eq("is_active", true).neq("id", product.id).limit(4);
  relatedQuery = relatedQuery.eq("categories.category_type", isTemplate ? "TEMPLATE" : "ACCOUNT");
  const { data: relatedData } = await relatedQuery;
  const related = relatedData ?? [];
  const previewImages = String(product.description || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("http://") || line.startsWith("https://") || line.startsWith("data:image/"));

  return (
    <div className="relative pb-24 lg:pb-32">
      <div className="bg-slate-50 border-b border-slate-100">
        <div className="container-page py-10 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16 items-center">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-xl shadow-slate-200/50">
              <Image src={product.image_url || "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=1200&auto=format&fit=crop"} alt={product.name} fill unoptimized={Boolean(product.image_url?.startsWith("data:"))} className="object-cover" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-6">
                <Zap className="h-3.5 w-3.5" /> {isTemplate ? "Template landing page" : "Dịch vụ Premium"}
              </div>
              <h1 className="text-3xl font-black text-slate-900 lg:text-5xl lg:leading-[1.15]">{product.name}</h1>
              
              <div className="mt-8 flex flex-wrap items-center gap-6 border-y border-slate-200 py-6">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Giá thanh toán</p>
                  <p className="text-4xl font-black text-primary">{formatCurrency(product.price)}</p>
                </div>
                <div className="h-12 w-px bg-slate-200 hidden sm:block"></div>
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Thời hạn</p>
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <Clock className="h-5 w-5 text-slate-400" /> {product.duration || (isTemplate ? "Trọn đời" : "Theo gói")}
                  </div>
                </div>
              </div>

              {isTemplate && previewImages.length ? (
                <p className="mt-8 text-lg leading-relaxed text-slate-600">
                  Template gồm {previewImages.length} ảnh preview để bạn xem bố cục, màu sắc và các khu vực chính trước khi mua.
                </p>
              ) : (
                <div className="mt-8 prose prose-slate max-w-none">
                  <p className="whitespace-pre-line break-words text-lg leading-relaxed text-slate-600">{product.description}</p>
                </div>
              )}

              <div className="mt-8 hidden lg:block">
                <Button asChild size="lg" className="h-14 rounded-full px-10 text-lg font-bold shadow-xl shadow-primary/25 hover:-translate-y-1 transition-all">
                  <Link href={`/cart?productId=${product.id}`}>{isTemplate ? "Mua template ngay" : "Tiến hành thanh toán ngay"} <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
                <p className="mt-3 text-sm text-slate-500 flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-500" /> {isTemplate ? "Nhận link tải, mật khẩu giải nén và hướng dẫn sau khi đơn hoàn tất." : "Cam kết bảo hành và hoàn tiền nếu lỗi."}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-page py-16">
        {isTemplate && previewImages.length ? (
          <section className="mb-12">
            <h2 className="mb-6 text-3xl font-black text-slate-900">Ảnh preview template</h2>
            <div className="grid gap-5 md:grid-cols-2">
              {previewImages.map((imageUrl, index) => (
                <div key={`${imageUrl}-${index}`} className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <Image
                    src={imageUrl}
                    alt={`${product.name} preview ${index + 1}`}
                    fill
                    unoptimized={imageUrl.startsWith("data:")}
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><ShieldCheck className="h-6 w-6" /></div>
              <h2 className="text-xl font-bold text-slate-900">{isTemplate ? "License sử dụng" : "Chính sách bảo hành"}</h2>
            </div>
            <p className="whitespace-pre-line break-words text-slate-600 leading-relaxed">{product.warranty_policy}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-600"><HelpCircle className="h-6 w-6" /></div>
              <h2 className="text-xl font-bold text-slate-900">{isTemplate ? "Hướng dẫn tải template" : "Hướng dẫn nhận hàng"}</h2>
            </div>
            <p className="whitespace-pre-line break-words text-slate-600 leading-relaxed">{product.delivery_guide}</p>
          </div>
        </div>
        
        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="mb-8 text-3xl font-black text-slate-900">{isTemplate ? "Template liên quan" : "Sản phẩm liên quan"}</h2>
            <ProductGrid products={related as any} />
          </div>
        )}
      </div>

      {/* Sticky Buy Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/80 p-4 backdrop-blur-xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="hidden min-w-0 flex-1 sm:block">
            <p className="truncate font-bold text-slate-900">{product.name}</p>
            <p className="text-lg font-black text-primary">{formatCurrency(product.price)}</p>
          </div>
          <div className="sm:hidden min-w-0 flex-1">
             <p className="text-xl font-black text-primary">{formatCurrency(product.price)}</p>
          </div>
          <Button asChild size="lg" className="rounded-full shadow-lg shadow-primary/20 shrink-0">
            <Link href={`/cart?productId=${product.id}`}><ShoppingCart className="mr-2 h-4 w-4" /> {isTemplate ? "Mua template" : "Mua ngay"}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
