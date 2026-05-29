import { notFound } from "next/navigation";
import { OrderAdminActions } from "@/components/AdminManagers";
import { CopyButton } from "@/components/CopyButton";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { decryptText } from "@/lib/encryption";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const { data: order } = await supabaseAdmin.from("orders").select("*, products(name)").eq("id", params.id).single();
  if (!order) notFound();
  const done = order.order_status === "COMPLETED";
  const { data: deliveryRows = [] } = done ? await supabaseAdmin.from("order_deliveries").select("*").eq("order_id", order.id).order("created_at") : { data: [] };
  const deliveries = (deliveryRows || []).map((row: any) => ({ username: decryptText(row.username_encrypted), password: decryptText(row.password_encrypted), note: decryptText(row.note_encrypted) }));
  const legacyDelivery = done && !deliveries.length ? { username: decryptText(order.delivery_username_encrypted), password: decryptText(order.delivery_password_encrypted), note: decryptText(order.delivery_note_encrypted) } : null;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Đơn hàng #{order.order_code}</h1>
      <Card><CardHeader><CardTitle>Thông tin</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><p>Sản phẩm: {order.products?.name}</p><p>Khách: {order.customer_name} - {order.customer_email} - {order.customer_phone}</p><p>Tổng: {formatCurrency(order.total_amount)}</p><p>Ngày: {formatDate(order.created_at)}</p><div className="flex gap-2"><OrderStatusBadge status={order.payment_status} /><OrderStatusBadge status={order.order_status} /></div></CardContent></Card>
      {order.payment_status === "PAID" && order.order_status !== "COMPLETED" ? <OrderAdminActions orderId={order.id} /> : null}
      {deliveries.length || legacyDelivery ? <Card><CardHeader><CardTitle>Tài khoản đã cấp</CardTitle></CardHeader><CardContent className="space-y-3 text-sm">{(deliveries.length ? deliveries : [legacyDelivery]).map((delivery: any, index: number) => <div key={`${delivery.username}-${index}`} className="rounded-md border bg-slate-50 p-3"><p className="font-semibold">Tài khoản #{index + 1}</p><p className="mt-2">Tài khoản: <strong>{delivery.username}</strong></p><p>Mật khẩu: <strong>{delivery.password}</strong></p><p>Ghi chú: {delivery.note}</p><div className="mt-2 flex gap-2"><CopyButton value={delivery.username} label="tài khoản" /><CopyButton value={delivery.password} label="mật khẩu" /></div></div>)}</CardContent></Card> : null}
    </div>
  );
}
