import { VoucherForm, VoucherRowActions } from "@/components/AdminManagers";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatCurrency, formatDate } from "@/lib/utils";

function formatDiscount(voucher: any) {
  return voucher.discount_type === "PERCENT" ? `${Number(voucher.discount_value)}%` : formatCurrency(voucher.discount_value);
}

export default async function AdminVouchersPage() {
  const { data } = await supabaseAdmin.from("vouchers").select("*").order("created_at", { ascending: false });
  const vouchers = data ?? [];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Quản lý voucher</h1>
      <Card>
        <CardHeader><CardTitle>Thêm voucher</CardTitle></CardHeader>
        <CardContent><VoucherForm /></CardContent>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        {vouchers.map((voucher: any) => (
          <Card key={voucher.id}>
            <CardHeader className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="text-lg">{voucher.code}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Giảm {formatDiscount(voucher)} - Đơn tối thiểu {formatCurrency(voucher.min_order_amount)}
                  </p>
                </div>
                <OrderStatusBadge status={voucher.is_active ? "AVAILABLE" : "DISABLED"} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid gap-2 sm:grid-cols-2">
                <p>Lượt dùng: <strong>{voucher.used_count || 0}{voucher.max_uses ? `/${voucher.max_uses}` : ""}</strong></p>
                <p>Hết hạn: <strong>{voucher.expires_at ? formatDate(voucher.expires_at) : "Không giới hạn"}</strong></p>
                {voucher.starts_at ? <p>Bắt đầu: <strong>{formatDate(voucher.starts_at)}</strong></p> : null}
                {voucher.description ? <p>Ghi chú: <strong>{voucher.description}</strong></p> : null}
              </div>
              <VoucherRowActions voucher={voucher} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
