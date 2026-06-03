import { AdminProductSearch } from "@/components/AdminProductSearch";
import { ProductForm, ProductUpdatePanel } from "@/components/AdminManagers";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { Pagination } from "@/components/Pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatCurrency } from "@/lib/utils";

function escapeSearchTerm(value: string) {
  return value.replace(/[,%]/g, " ").trim();
}

export default async function AdminProductsPage({ searchParams }: { searchParams: { page?: string; q?: string } }) {
  const page = Math.max(1, Number(searchParams.page || 1));
  const pageSize = 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const keyword = searchParams.q?.trim() || "";
  const searchTerm = escapeSearchTerm(keyword);
  let productsQuery = supabaseAdmin
    .from("products")
    .select("id,category_id,name,slug,description,image_url,price,duration,warranty_policy,delivery_guide,is_active,created_at,categories(name, category_type)", { count: "exact" })
    .order("created_at", { ascending: false });
  if (searchTerm) productsQuery = productsQuery.or(`name.ilike.%${searchTerm}%,slug.ilike.%${searchTerm}%`);

  const [{ data: productsData, count }, { data: categoriesData }] = await Promise.all([
    productsQuery.range(from, to),
    supabaseAdmin.from("categories").select("id,name,slug,category_type").order("name")
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
      <AdminProductSearch keyword={keyword} />
      {keyword ? <p className="text-sm text-muted-foreground">Kết quả cho: <strong>{keyword}</strong></p> : null}
      <div className="space-y-4">
        {products.map((product: any) => (
          <Card key={product.id}>
            <CardHeader className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">{product.categories?.category_type === "TEMPLATE" ? "Template" : "Tài khoản"} - {product.categories?.name || "Chưa có danh mục"} - {formatCurrency(product.price)} - {product.duration || "Theo gói"}</p>
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
      <Pagination basePath="/admin/products" page={page} pageSize={pageSize} total={count} searchParams={searchParams} />
    </div>
  );
}
