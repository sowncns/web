import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyButton } from "@/components/CopyButton";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { decryptText } from "@/lib/encryption";
import { createClient } from "@/lib/supabase/server";
import { requireActiveUser } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const { user } = await requireActiveUser();
  const supabase = createClient();
  const { data: order } = await supabase.from("orders").select("*, products(name,slug)").eq("id", params.id).eq("user_id", user.id).single();
  if (!order) notFound();
  const canView = order.payment_status === "PAID" && order.order_status === "COMPLETED";
  const delivery = canView ? {
    username: decryptText(order.delivery_username_encrypted),
    password: decryptText(order.delivery_password_encrypted),
    note: decryptText(order.delivery_note_encrypted)
  } : null;

  return (
    <div className="container-page py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-3xl font-bold">Đơn hàng #{order.order_code}</h1><p className="text-muted-foreground">{formatDate(order.created_at)}</p></div>
        <Button asChild><Link href={`/support?orderId=${order.id}`}>Tạo ticket</Link></Button>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader><CardTitle>Thông tin đơn</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>Sản phẩm: <strong>{order.products?.name}</strong></p>
            <p>Tổng tiền: <strong>{formatCurrency(order.total_amount)}</strong></p>
            <div className="flex gap-2">Thanh toán: <OrderStatusBadge status={order.payment_status} /></div>
            <div className="flex gap-2">Xử lý: <OrderStatusBadge status={order.order_status} /></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Tài khoản đã mua</CardTitle></CardHeader>
          <CardContent>
            {delivery ? (
              <div className="space-y-3 text-sm">
                <p>Tài khoản: <strong>{delivery.username}</strong></p>
                <p>Mật khẩu: <strong>{delivery.password}</strong></p>
                <p>Ghi chú: {delivery.note || "Không có"}</p>
                <div className="flex flex-wrap gap-2"><CopyButton value={delivery.username} label="tài khoản" /><CopyButton value={delivery.password} label="mật khẩu" /></div>
              </div>
            ) : order.payment_status === "PAID" && order.order_status === "PROCESSING" ? (
              <p className="text-sm text-muted-foreground">Đơn hàng của bạn đang được xử lý. Vui lòng chờ admin cấp tài khoản.</p>
            ) : (
              <p className="text-sm text-muted-foreground">Đơn hàng chưa được thanh toán.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
