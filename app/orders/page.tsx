import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";
import { requireActiveUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OrdersPage() {
  noStore();
  const { user } = await requireActiveUser();
  const supabase = createClient();
  const { data: ordersData } = await supabase.from("orders").select("*, products(name)").eq("user_id", user.id).order("created_at", { ascending: false });
  const orders = ordersData ?? [];

  return (
    <div className="container-page py-10">
      <h1 className="mb-6 text-3xl font-bold">Lịch sử đơn hàng</h1>
      {!orders.length ? <EmptyState title="Chưa có đơn hàng" description="Các đơn đã mua sẽ xuất hiện ở đây." /> : (
        <>
        <div className="space-y-3 md:hidden">
          {orders.map((order: any) => (
            <div key={order.id} className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Mã đơn</p>
                  <p className="font-bold">{order.order_code}</p>
                </div>
                <Button asChild variant="outline" size="sm"><Link href={`/orders/${order.id}`}>Chi tiết</Link></Button>
              </div>
              <div className="mt-3 space-y-2 text-sm">
                <p>Sản phẩm: <strong>{order.products?.name}</strong></p>
                <p>Tổng tiền: <strong>{formatCurrency(order.total_amount)}</strong></p>
                <div className="flex flex-wrap gap-2"><OrderStatusBadge status={order.payment_status} /><OrderStatusBadge status={order.order_status} /></div>
                <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="hidden overflow-x-auto rounded-lg border bg-white md:block">
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
        </>
      )}
    </div>
  );
}
