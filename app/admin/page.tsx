import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { AdminHeader } from "@/components/AdminHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDashboardPage() {
  noStore();
  const { profile } = await requireAdmin();
  const [{ data: ordersData }, { count: productCount }, { count: stockCount }] = await Promise.all([
    supabaseAdmin.from("orders").select("*, products(name)").order("created_at", { ascending: false }).limit(8),
    supabaseAdmin.from("products").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabaseAdmin.from("stock_items").select("*", { count: "exact", head: true }).eq("status", "AVAILABLE")
  ]);
  const orders = ordersData ?? [];
  const totalRevenue = orders.filter((o: any) => o.payment_status === "PAID").reduce((sum: number, o: any) => sum + Number(o.total_amount), 0);
  const today = new Date().toISOString().slice(0, 10);
  const todayRevenue = orders.filter((o: any) => o.payment_status === "PAID" && String(o.paid_at || "").startsWith(today)).reduce((sum: number, o: any) => sum + Number(o.total_amount), 0);
  const cards = [
    ["Tổng doanh thu", formatCurrency(totalRevenue)],
    ["Doanh thu hôm nay", formatCurrency(todayRevenue)],
    ["Tổng số đơn", orders.length],
    ["Đơn chờ xử lý", orders.filter((o: any) => o.order_status === "PROCESSING").length],
    ["Đơn đã thanh toán", orders.filter((o: any) => o.payment_status === "PAID").length],
    ["Sản phẩm đang bán", productCount || 0],
    ["Tài khoản còn trong kho", stockCount || 0]
  ];
  return (
    <>
      <AdminHeader name={profile.full_name} />
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
        {cards.map(([label, value]) => <Card key={String(label)}><CardHeader><CardTitle className="text-sm text-muted-foreground">{label}</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{value}</CardContent></Card>)}
      </div>
      <Card className="mt-6">
        <CardHeader><CardTitle>Đơn hàng mới nhất</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm"><tbody>{orders.map((o: any) => <tr key={o.id} className="border-t"><td className="py-3">{o.order_code}</td><td>{o.products?.name}</td><td>{formatCurrency(o.total_amount)}</td><td><OrderStatusBadge status={o.payment_status} /></td><td>{formatDate(o.created_at)}</td><td><Button asChild size="sm" variant="outline"><Link href={`/admin/orders/${o.id}`}>Xem</Link></Button></td></tr>)}</tbody></table>
        </CardContent>
      </Card>
    </>
  );
}
