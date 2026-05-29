import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function PaymentCancelPage({ searchParams }: { searchParams: { orderCode?: string } }) {
  if (searchParams.orderCode) {
    await supabaseAdmin.from("orders").update({ payment_status: "CANCELLED", order_status: "CANCELLED" }).eq("order_code", Number(searchParams.orderCode)).eq("payment_status", "PENDING");
  }
  return (
    <div className="container-page grid min-h-[520px] place-items-center py-10">
      <Card className="w-full max-w-xl">
        <CardContent className="p-8 text-center">
          <XCircle className="mx-auto h-14 w-14 text-red-600" />
          <h1 className="mt-4 text-2xl font-bold">Thanh toán đã hủy</h1>
          <p className="mt-2 text-muted-foreground">Bạn có thể quay lại sản phẩm và tạo thanh toán mới.</p>
          <Button asChild className="mt-6"><Link href="/products">Quay lại sản phẩm</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}
