import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyButton } from "@/components/CopyButton";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { decryptText } from "@/lib/encryption";
import { createClient } from "@/lib/supabase/server";
import { requireActiveUser } from "@/lib/auth";
import { getAdminContact } from "@/lib/contact";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const { user } = await requireActiveUser();
  const supabase = createClient();
  const { data: order } = await supabase.from("orders").select("*, products(name,slug)").eq("id", params.id).eq("user_id", user.id).single();
  if (!order) notFound();
  const canView = order.payment_status === "PAID" && order.order_status === "COMPLETED";
  const { data: deliveryRows = [] } = canView ? await supabase.from("order_deliveries").select("*").eq("order_id", order.id).order("created_at") : { data: [] };
  const deliveries = (deliveryRows || []).map((row: any) => ({
    username: decryptText(row.username_encrypted),
    password: decryptText(row.password_encrypted),
    note: decryptText(row.note_encrypted)
  }));
  const legacyDelivery = canView && !deliveries.length ? {
    username: decryptText(order.delivery_username_encrypted),
    password: decryptText(order.delivery_password_encrypted),
    note: decryptText(order.delivery_note_encrypted)
  } : null;
  const contact = getAdminContact();

  return (
    <div className="container-page py-6">
      <div className="mb-5">
        <h1 className="text-2xl font-bold tracking-normal text-slate-950">Đơn hàng #{order.order_code}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
      </div>
      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <div className="space-y-5">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Thông tin đơn</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Sản phẩm</p>
                <p className="mt-1 font-semibold text-slate-950">{order.products?.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tổng tiền</p>
                <p className="mt-1 font-semibold text-slate-950">{formatCurrency(order.total_amount)}</p>
              </div>
              <div className="flex flex-wrap gap-2"><OrderStatusBadge status={order.payment_status} /><OrderStatusBadge status={order.order_status} /></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Cần liên hệ admin?</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">Nếu tài khoản lỗi hoặc thanh toán chưa cập nhật, gửi mã đơn #{order.order_code} cho admin.</p>
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm"><a href={contact.facebook} target="_blank" rel="noreferrer">Nhắn Facebook</a></Button>
                <Button asChild size="sm" variant="outline"><Link href="/contact">Xem liên hệ</Link></Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Tài khoản đã mua</CardTitle></CardHeader>
          <CardContent>
            {deliveries.length || legacyDelivery ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {(deliveries.length ? deliveries : [legacyDelivery]).map((delivery: any, index: number) => (
                  <div key={`${delivery.username}-${index}`} className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm">
                    <p className="font-semibold text-slate-950">Tài khoản #{index + 1}</p>
                    <div className="mt-3 space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Tài khoản</p>
                        <p className="break-all font-semibold text-slate-950">{delivery.username}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Mật khẩu</p>
                        <p className="break-all font-semibold text-slate-950">{delivery.password}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Ghi chú</p>
                        <p className="leading-relaxed text-slate-800">{delivery.note || "Không có"}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2"><CopyButton value={delivery.username} label="tài khoản" /><CopyButton value={delivery.password} label="mật khẩu" /></div>
                  </div>
                ))}
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
