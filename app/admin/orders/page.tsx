import Link from "next/link";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function AdminOrdersPage() {
  const { data: ordersData } = await supabaseAdmin.from("orders").select("*, products(name)").order("created_at", { ascending: false }).limit(200);
  const orders = ordersData ?? [];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full min-w-[960px] text-sm"><thead className="bg-muted text-left"><tr><th className="p-3">Mã</th><th>Sản phẩm</th><th>Email</th><th>Tổng</th><th>Thanh toán</th><th>Đơn</th><th>Ngày</th><th></th></tr></thead><tbody>{orders.map((o: any) => <tr key={o.id} className="border-t"><td className="p-3">{o.order_code}</td><td>{o.products?.name}</td><td>{o.customer_email}</td><td>{formatCurrency(o.total_amount)}</td><td><OrderStatusBadge status={o.payment_status} /></td><td><OrderStatusBadge status={o.order_status} /></td><td>{formatDate(o.created_at)}</td><td><Button asChild size="sm" variant="outline"><Link href={`/admin/orders/${o.id}`}>Xem</Link></Button></td></tr>)}</tbody></table>
      </div>
    </div>
  );
}
