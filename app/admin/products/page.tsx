import { ProductForm, ProductUpdatePanel } from "@/components/AdminManagers";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatCurrency } from "@/lib/utils";

export default async function AdminProductsPage() {
  const [{ data: productsData }, { data: categoriesData }] = await Promise.all([
    supabaseAdmin.from("products").select("*, categories(name)").order("created_at", { ascending: false }),
    supabaseAdmin.from("categories").select("*").order("name")
  ]);
  const products = productsData ?? [];
  const categories = categoriesData ?? [];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
      <Card>
        <CardHeader><CardTitle>Thêm sản phẩm</CardTitle></CardHeader>
        <CardContent><ProductForm categories={categories as any[]} /></CardContent>
      </Card>
      <div className="space-y-4">
        {products.map((product: any) => (
          <Card key={product.id}>
            <CardHeader className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">{product.categories?.name || "Chưa có danh mục"} - {formatCurrency(product.price)} - {product.duration || "Theo gói"}</p>
                </div>
                <OrderStatusBadge status={product.is_active ? "AVAILABLE" : "DISABLED"} />
              </div>
            </CardHeader>
            <CardContent>
              <ProductUpdatePanel product={product} categories={categories as any[]} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
