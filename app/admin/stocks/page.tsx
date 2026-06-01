import { unstable_noStore as noStore } from "next/cache";
import { StockForm, StockRowActions } from "@/components/AdminManagers";
import { AdminStockFilter } from "@/components/AdminStockFilter";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { Pagination } from "@/components/Pagination";
import { decryptText } from "@/lib/encryption";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { maskUsername } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminStocksPage({ searchParams }: { searchParams: { product_id?: string; status?: string; page?: string } }) {
  noStore();
  const page = Math.max(1, Number(searchParams.page || 1));
  const pageSize = 50;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data: productsData } = await supabaseAdmin.from("products").select("id,name").order("name");
  const products = productsData ?? [];
  let stocksQuery = supabaseAdmin
    .from("stock_items")
    .select("id,product_id,username_encrypted,password_encrypted,note_encrypted,duration,status,used_at,created_at,products(name)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);
  if (searchParams.product_id) stocksQuery = stocksQuery.eq("product_id", searchParams.product_id);
  if (searchParams.status) stocksQuery = stocksQuery.eq("status", searchParams.status);
  const { data: stocksData, count } = await stocksQuery;
  const stocks = stocksData ?? [];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Kho tài khoản</h1>
      <StockForm products={products as any[]} />
      <AdminStockFilter products={products as any[]} />
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full min-w-[980px] text-sm"><thead className="bg-muted text-left"><tr><th className="p-3">Sản phẩm</th><th>Tài khoản / link</th><th>Thời hạn</th><th>Trạng thái</th><th>Ngày dùng</th><th>Thao tác</th></tr></thead><tbody>{stocks.map((s: any) => {
          const stock = {
            ...s,
            username: decryptText(s.username_encrypted),
            password: decryptText(s.password_encrypted),
            note: decryptText(s.note_encrypted)
          };
          return <tr key={s.id} className="border-t align-top"><td className="p-3">{s.products?.name}</td><td className="p-3">{maskUsername(stock.username)}</td><td className="p-3">{s.duration}</td><td className="p-3"><OrderStatusBadge status={s.status} /></td><td className="p-3">{s.used_at || "-"}</td><td className="p-3"><StockRowActions stock={stock} products={products as any[]} /></td></tr>;
        })}</tbody></table>
      </div>
      <Pagination basePath="/admin/stocks" page={page} pageSize={pageSize} total={count} searchParams={searchParams} />
    </div>
  );
}
