import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/ProductGrid";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: product } = await supabase.from("products").select("*").eq("slug", params.slug).eq("is_active", true).single();
  if (!product) notFound();
  const { data: relatedData } = await supabase.from("products").select("*").eq("is_active", true).neq("id", product.id).limit(4);
  const related = relatedData ?? [];

  return (
    <div className="container-page py-10">
      <div className="grid gap-8 lg:grid-cols-[520px_1fr]">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted">
          <Image src={product.image_url || "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=1200&auto=format&fit=crop"} alt={product.name} fill className="object-cover" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="mt-3 text-2xl font-bold text-primary">{formatCurrency(product.price)}</p>
          <p className="mt-2 text-muted-foreground">Thời hạn: {product.duration || "Theo gói"}</p>
          <p className="mt-6 whitespace-pre-line">{product.description}</p>
          <div className="mt-6 rounded-lg border bg-white p-4 text-sm text-muted-foreground">
            Sau khi thanh toán và đơn hàng hoàn tất, bạn sẽ nhận được tài khoản và mật khẩu trong trang chi tiết đơn hàng.
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border bg-white p-4"><h2 className="font-semibold">Chính sách bảo hành</h2><p className="mt-2 text-sm text-muted-foreground">{product.warranty_policy}</p></div>
            <div className="rounded-lg border bg-white p-4"><h2 className="font-semibold">Hướng dẫn nhận hàng</h2><p className="mt-2 text-sm text-muted-foreground">{product.delivery_guide}</p></div>
          </div>
          <Button asChild size="lg" className="mt-6"><Link href={`/cart?productId=${product.id}`}>Mua ngay</Link></Button>
        </div>
      </div>
      <div className="mt-12">
        <h2 className="mb-5 text-2xl font-bold">Sản phẩm liên quan</h2>
        <ProductGrid products={related as any} />
      </div>
    </div>
  );
}
