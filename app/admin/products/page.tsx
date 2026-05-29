import { ProductForm, ProductRowActions } from "@/components/AdminManagers";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
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
      <ProductForm categories={categories as any[]} />
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full min-w-[1180px] text-sm"><thead className="bg-muted text-left"><tr><th className="p-3">Tên</th><th>Danh mục</th><th>Giá</th><th>Thời hạn</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{products.map((p: any) => <tr key={p.id} className="border-t align-top"><td className="p-3 font-medium">{p.name}</td><td className="p-3">{p.categories?.name}</td><td className="p-3">{formatCurrency(p.price)}</td><td className="p-3">{p.duration}</td><td className="p-3"><OrderStatusBadge status={p.is_active ? "AVAILABLE" : "DISABLED"} /></td><td className="p-3"><ProductRowActions product={p} categories={categories as any[]} /></td></tr>)}</tbody></table>
      </div>
    </div>
  );
}
