import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";
import { requireActiveUser } from "@/lib/auth";

export default async function OrdersPage() {
  const { user } = await requireActiveUser();
  const supabase = createClient();
  const { data: ordersData } = await supabase.from("orders").select("*, products(name)").eq("user_id", user.id).order("created_at", { ascending: false });
  const orders = ordersData ?? [];

  return (
    <div className="container-page py-10">
      <h1 className="mb-6 text-3xl font-bold">Lịch sử đơn hàng</h1>
      {!orders.length ? <EmptyState title="Chưa có đơn hàng" description="Các đơn đã mua sẽ xuất hiện ở đây." /> : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-muted text-left"><tr><th className="p-3">Mã đơn</th><th>Sản phẩm</th><th>Tổng tiền</th><th>Thanh toán</th><th>Đơn hàng</th><th>Ngày tạo</th><th></th></tr></thead>
            <tbody>
              {orders.map((order: any) => (
                <tr key={order.id} className="border-t">
                  <td className="p-3 font-medium">{order.order_code}</td>
                  <td>{order.products?.name}</td>
                  <td>{formatCurrency(order.total_amount)}</td>
                  <td><OrderStatusBadge status={order.payment_status} /></td>
                  <td><OrderStatusBadge status={order.order_status} /></td>
                  <td>{formatDate(order.created_at)}</td>
                  <td><Button asChild variant="outline" size="sm"><Link href={`/orders/${order.id}`}>Xem chi tiết</Link></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
