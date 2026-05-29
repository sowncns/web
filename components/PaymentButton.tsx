"use client";

import { useState } from "react";
import { Copy, CreditCard, Landmark, QrCode } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

type PayOSPayment = {
  qrCode?: string;
  accountNumber?: string;
  accountName?: string;
  amount?: number;
  description?: string;
  bin?: string;
};

export function PaymentButton({ payload, label = "Thanh toán qua payOS" }: { payload: Record<string, unknown>; label?: string }) {
  const [loading, setLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const [payment, setPayment] = useState<PayOSPayment | null>(null);
  const [tab, setTab] = useState<"qr" | "bank">("qr");

  async function pay() {
    setLoading(true);
    try {
      const res = await fetch("/api/payment/payos/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không tạo được link thanh toán");
      setCheckoutUrl(data.checkoutUrl);
      setPayment(data.payment || null);
      toast.success("Đã tạo cửa sổ thanh toán payOS");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể thanh toán");
    } finally {
      setLoading(false);
    }
  }

  async function copy(value?: string | number) {
    if (!value) return;
    await navigator.clipboard.writeText(String(value));
    toast.success("Đã sao chép");
  }

  return (
    <div className="space-y-5">
      <Button type="button" size="lg" className="w-full" disabled={loading} onClick={pay}>
        <CreditCard className="h-5 w-5" />
        {loading ? "Đang tạo thanh toán..." : label}
      </Button>
      {checkoutUrl ? (
        <>
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-center text-sm text-slate-600">
            <a className="font-medium text-primary hover:underline" href={checkoutUrl} target="_blank" rel="noreferrer">Mở cửa sổ thanh toán</a>
            <p className="mt-3">Vui lòng hoàn tất thanh toán trong cửa sổ bên dưới.</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="mx-auto mb-5 flex w-fit border-b">
              <button className={`flex h-9 items-center gap-2 border px-4 text-sm font-semibold ${tab === "qr" ? "bg-white text-slate-950" : "bg-slate-50 text-slate-400"}`} onClick={() => setTab("qr")} type="button">
                <QrCode className="h-4 w-4" />
                Quét mã QR
              </button>
              <button className={`flex h-9 items-center gap-2 border border-l-0 px-4 text-sm font-semibold ${tab === "bank" ? "bg-white text-slate-950" : "bg-slate-50 text-slate-400"}`} onClick={() => setTab("bank")} type="button">
                <Landmark className="h-4 w-4" />
                Chuyển khoản
              </button>
            </div>
            {tab === "qr" ? (
              <div className="flex flex-col items-center justify-center gap-3">
                {payment?.qrCode ? <img src={payment.qrCode} alt="Mã QR payOS" className="h-52 w-52 object-contain" /> : <div className="grid h-52 w-52 place-items-center rounded-md border border-dashed text-sm text-muted-foreground">QR payOS</div>}
                <p className="text-xs text-muted-foreground">Quét mã bằng ứng dụng ngân hàng hoặc ví điện tử hỗ trợ VietQR.</p>
              </div>
            ) : (
              <div className="mx-auto max-w-md space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Chủ tài khoản</p>
                  <p className="font-semibold">{payment?.accountName || "Theo thông tin payOS"}</p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div><p className="text-muted-foreground">Số tài khoản</p><p className="font-semibold">{payment?.accountNumber || "-"}</p></div>
                  <Button type="button" variant="secondary" size="sm" onClick={() => copy(payment?.accountNumber)}><Copy className="h-4 w-4" /> Sao chép</Button>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div><p className="text-muted-foreground">Số tiền</p><p className="font-semibold">{formatCurrency(payment?.amount || 0)}</p></div>
                  <Button type="button" variant="secondary" size="sm" onClick={() => copy(payment?.amount)}><Copy className="h-4 w-4" /> Sao chép</Button>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div><p className="text-muted-foreground">Nội dung</p><p className="font-semibold">{payment?.description || "-"}</p></div>
                  <Button type="button" variant="secondary" size="sm" onClick={() => copy(payment?.description)}><Copy className="h-4 w-4" /> Sao chép</Button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
