import Image from "next/image";
import Link from "next/link";
import { Clock, PackageCheck, ShoppingCart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  price: number | string;
  duration: string | null;
  stock_count?: number;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <div className="group relative rounded-2xl bg-white p-2 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 border border-slate-100">
      <Link href={`/products/${product.slug}`} className="block overflow-hidden rounded-xl">
        <div className="relative aspect-[5/3] w-full bg-slate-100 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 transition-opacity duration-300 group-hover:opacity-0" />
          <Image
            src={product.image_url || "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=1200&auto=format&fit=crop"}
            alt={product.name}
            fill
            unoptimized={Boolean(product.image_url?.startsWith("data:"))}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute right-2 top-2 z-20">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-primary shadow-sm backdrop-blur-md">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary"></span>
              </span>
              Premium
            </span>
          </div>
        </div>
      </Link>
      <div className="space-y-4 p-3 pt-4">
        <div>
          <Link href={`/products/${product.slug}`} className="line-clamp-2 text-base font-bold text-slate-900 transition-colors group-hover:text-primary">
            {product.name}
          </Link>
          <div className="mt-2.5 flex items-center gap-3 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-1 rounded-md bg-slate-50 px-2 py-1">
              <Clock className="h-3.5 w-3.5 text-primary" />
              {product.duration || "Theo gói"}
            </div>
            <div className="flex items-center gap-1 rounded-md bg-slate-50 px-2 py-1">
              <PackageCheck className="h-3.5 w-3.5 text-emerald-500" />
              {(product.stock_count ?? 0) > 0 ? "Còn hàng" : "Sẵn sàng cấp"}
            </div>
          </div>
        </div>
        <div className="flex items-end justify-between gap-3 pt-2">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-0.5">Giá ưu đãi</p>
            <p className="text-lg font-black text-slate-950">{formatCurrency(product.price)}</p>
          </div>
          <Button asChild className="rounded-full px-5 text-xs font-bold shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5">
            <Link href={`/products/${product.slug}`}>
              Xem chi tiết
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
