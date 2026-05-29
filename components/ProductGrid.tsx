import { EmptyState } from "@/components/EmptyState";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";

export function ProductGrid({ products }: { products: ProductCardData[] }) {
  if (!products.length) return <EmptyState title="Không tìm thấy sản phẩm" description="Thử đổi bộ lọc hoặc từ khóa tìm kiếm." />;
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {products.map((product) => <ProductCard key={product.id} product={product} />)}
    </div>
  );
}
