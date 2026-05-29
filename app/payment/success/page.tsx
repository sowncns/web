import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CopyButton } from "@/components/CopyButton";
import { decryptText } from "@/lib/encryption";
import { createClient } from "@/lib/supabase/server";

export default async function PaymentSuccessPage({ searchParams }: { searchParams: { orderCode?: string } }) {
  const supabase = createClient();
  const { data: order } = searchParams.orderCode ? await supabase.from("orders").select("*").eq("order_code", Number(searchParams.orderCode)).single() : { data: null };
  const done = order?.payment_status === "PAID" && order?.order_status === "COMPLETED";
  const delivery = done ? { username: decryptText(order.delivery_username_encrypted), password: decryptText(order.delivery_password_encrypted), note: decryptText(order.delivery_note_encrypted) } : null;
  return (
    <div className="container-page grid min-h-[520px] place-items-center py-10">
      <Card className="w-full max-w-xl">
        <CardContent className="p-8 text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" />
          <h1 className="mt-4 text-2xl font-bold">Thanh toán thành công</h1>
          <p className="mt-2 text-muted-foreground">Mã đơn hàng: {searchParams.orderCode || "-"}</p>
          {delivery ? (
            <div className="mt-5 rounded-lg border bg-background p-4 text-left text-sm">
              <p>Tài khoản: <strong>{delivery.username}</strong></p>
              <p>Mật khẩu: <strong>{delivery.password}</strong></p>
              <p>Ghi chú: {delivery.note}</p>
              <div className="mt-3 flex gap-2"><CopyButton value={delivery.username} label="tài khoản" /><CopyButton value={delivery.password} label="mật khẩu" /></div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Đơn hàng đang được xử lý. Tài khoản và mật khẩu sẽ hiển thị tại chi tiết đơn hàng sau khi admin hoàn tất.</p>
          )}
          <Button asChild className="mt-6"><Link href="/orders">Xem đơn hàng</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}
