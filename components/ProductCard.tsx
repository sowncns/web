import Image from "next/image";
import Link from "next/link";
import { Clock, PackageCheck, ShoppingCart } from "lucide-react";
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
    <Card className="overflow-hidden hover:border-blue-200 hover:shadow-md">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[5/2] bg-slate-100">
          <Image
            src={product.image_url || "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=1200&auto=format&fit=crop"}
            alt={product.name}
            fill
            unoptimized={Boolean(product.image_url?.startsWith("data:"))}
            className="object-cover"
          />
        </div>
      </Link>
      <CardContent className="space-y-3 p-3">
        <div>
          <div className="flex items-start justify-between gap-3">
            <Link href={`/products/${product.slug}`} className="font-semibold text-slate-900 hover:text-primary">{product.name}</Link>
            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-[11px] font-medium text-red-600">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              Hot
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-4 w-4" />
            {product.duration || "Theo gói"}
          </div>
        </div>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-base font-bold text-slate-950">{formatCurrency(product.price)}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-primary"><PackageCheck className="h-3.5 w-3.5" /> {(product.stock_count ?? 0) > 0 ? "Còn hàng" : "Sẵn sàng cấp"}</p>
          </div>
          <Button asChild size="sm">
            <Link href={`/cart?productId=${product.id}`}><ShoppingCart className="h-4 w-4" /> Mua ngay</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
