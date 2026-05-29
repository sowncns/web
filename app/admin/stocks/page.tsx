import { StockForm } from "@/components/AdminManagers";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { decryptText } from "@/lib/encryption";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { maskUsername } from "@/lib/utils";

export default async function AdminStocksPage() {
  const [{ data: productsData }, { data: stocksData }] = await Promise.all([
    supabaseAdmin.from("products").select("id,name").order("name"),
    supabaseAdmin.from("stock_items").select("*, products(name)").order("created_at", { ascending: false }).limit(200)
  ]);
  const products = productsData ?? [];
  const stocks = stocksData ?? [];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Kho tài khoản</h1>
      <StockForm products={products as any[]} />
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full min-w-[820px] text-sm"><thead className="bg-muted text-left"><tr><th className="p-3">Sản phẩm</th><th>Tài khoản</th><th>Thời hạn</th><th>Trạng thái</th><th>Ngày dùng</th></tr></thead><tbody>{stocks.map((s: any) => <tr key={s.id} className="border-t"><td className="p-3">{s.products?.name}</td><td>{maskUsername(decryptText(s.username_encrypted))}</td><td>{s.duration}</td><td><OrderStatusBadge status={s.status} /></td><td>{s.used_at || "-"}</td></tr>)}</tbody></table>
      </div>
    </div>
  );
}
