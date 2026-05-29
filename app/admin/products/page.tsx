import { ProductForm } from "@/components/AdminManagers";
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
        <table className="w-full min-w-[900px] text-sm"><thead className="bg-muted text-left"><tr><th className="p-3">Tên</th><th>Danh mục</th><th>Giá</th><th>Thời hạn</th><th>Trạng thái</th></tr></thead><tbody>{products.map((p: any) => <tr key={p.id} className="border-t"><td className="p-3">{p.name}</td><td>{p.categories?.name}</td><td>{formatCurrency(p.price)}</td><td>{p.duration}</td><td><OrderStatusBadge status={p.is_active ? "AVAILABLE" : "DISABLED"} /></td></tr>)}</tbody></table>
      </div>
    </div>
  );
}
