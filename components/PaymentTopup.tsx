"use client";

import { useState } from "react";
import { Copy, CreditCard, History, Landmark, QrCode, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

const amounts = [100000, 250000, 500000, 1000000, 2000000, 5000000];

export function PaymentTopup() {
  const [amount, setAmount] = useState(100000);
  const [opened, setOpened] = useState(false);
  const [tab, setTab] = useState<"qr" | "bank">("qr");
  const transferContent = `DL${Date.now().toString().slice(-10)}`;

  async function copy(value: string | number) {
    await navigator.clipboard.writeText(String(value));
    toast.success("Đã sao chép");
  }

  return (
    <div className="container-page py-5">
      <div className="mb-5">
        <h1 className="text-xl font-bold tracking-normal text-slate-950">Thanh toán</h1>
        <p className="mt-4 text-sm text-muted-foreground">Quản lý số dư và thanh toán của bạn</p>
        <Button variant="outline" size="sm" className="mt-4">
          <History className="h-4 w-4" />
          Lịch sử giao dịch
        </Button>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-md bg-blue-50 text-primary">
            <Wallet className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Số dư hiện tại</p>
            <p className="text-2xl font-bold text-slate-950">51,000 VNĐ</p>
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-slate-950">Nạp tiền vào tài khoản</h2>

        <div className="mt-5 space-y-3">
          <div className="space-y-2">
            <label className="text-sm text-slate-700">Phương thức thanh toán</label>
            <select className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100">
              <option>Chuyển khoản qua MB (Ngân hàng, QR Code, Ví điện tử)</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-sm text-slate-700">Chọn số tiền (VNĐ)</label>
            <div className="grid gap-3 md:grid-cols-3">
              {amounts.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAmount(value)}
                  className={`h-12 rounded-md border text-sm font-bold transition-colors ${
                    amount === value
                      ? "border-sky-500 bg-sky-50 text-primary ring-1 ring-sky-400"
                      : "border-slate-200 bg-white text-slate-800 hover:border-sky-300"
                  }`}
                >
                  {value.toLocaleString("vi-VN")}
                </button>
              ))}
            </div>
          </div>

          <Button className="h-11 w-full" onClick={() => setOpened(true)}>
            <CreditCard className="h-4 w-4" />
            Nạp {formatCurrency(amount)}
          </Button>

          {opened ? (
            <div className="space-y-4 pt-2">
              <div className="rounded-md border border-slate-200 bg-white py-3 text-center text-sm font-medium text-slate-600 shadow-sm">
                Đóng cửa sổ thanh toán
              </div>
              <div className="text-center text-sm text-slate-600">
                <p>Vui lòng hoàn thành thanh toán trong cửa sổ bên dưới.</p>
                <p>Nếu cửa sổ không tự động mở, <button className="font-medium text-primary" type="button">nhấn vào đây</button>.</p>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {opened ? (
        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mx-auto flex w-fit border-b border-slate-200">
            <button
              type="button"
              onClick={() => setTab("qr")}
              className={`flex h-11 items-center gap-2 border border-b-0 px-5 text-sm font-semibold ${tab === "qr" ? "bg-white text-slate-950" : "bg-slate-50 text-slate-400"}`}
            >
              <QrCode className="h-4 w-4" />
              Quét mã QR
            </button>
            <button
              type="button"
              onClick={() => setTab("bank")}
              className={`flex h-11 items-center gap-2 border border-b-0 border-l-0 px-5 text-sm font-semibold ${tab === "bank" ? "bg-white text-slate-950" : "bg-slate-50 text-slate-400"}`}
            >
              <Landmark className="h-4 w-4" />
              Chuyển khoản
            </button>
          </div>

          {tab === "qr" ? (
            <div className="flex min-h-80 flex-col items-center justify-center gap-3">
              <div className="grid h-52 w-52 place-items-center border-4 border-slate-900 bg-white text-center text-xs font-semibold text-slate-500">
                QR payOS/VietQR
              </div>
              <p className="text-xs text-muted-foreground">Quét mã QR bằng app ngân hàng để thanh toán {formatCurrency(amount)}.</p>
            </div>
          ) : (
            <div className="mx-auto max-w-md pt-5">
              <div className="border-t border-slate-200 pt-4">
                <p className="font-semibold text-slate-950">HO KINH DOANH DIGILICENSE</p>
                <p className="mt-1 text-sm text-slate-700">Ngân hàng TMCP Quân đội</p>

                <div className="mt-4 space-y-4 text-sm">
                  <div className="grid grid-cols-[1fr_auto] gap-3">
                    <div>
                      <p className="text-muted-foreground">Số tài khoản:</p>
                      <p className="mt-1 text-base font-bold text-slate-950">VQRQAJIJOO540</p>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => copy("VQRQAJIJOO540")}>Sao chép</Button>
                  </div>
                  <div className="grid grid-cols-[1fr_auto] gap-3">
                    <div>
                      <p className="text-muted-foreground">Số tiền:</p>
                      <p className="mt-1 text-base font-bold text-slate-950">{formatCurrency(amount)}</p>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => copy(amount)}>Sao chép</Button>
                  </div>
                  <div className="grid grid-cols-[1fr_auto] gap-3">
                    <div>
                      <p className="text-muted-foreground">Nội dung:</p>
                      <p className="mt-1 text-base font-bold text-slate-950">{transferContent}</p>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => copy(transferContent)}>Sao chép</Button>
                  </div>
                </div>

                <div className="mt-4 rounded-md border border-red-100 bg-slate-100 p-3 text-sm">
                  <span className="mr-2 inline-grid h-6 w-6 place-items-center rounded-full bg-red-500 text-xs font-bold text-white">!</span>
                  Lưu ý: Nhập chính xác số tiền <strong>{formatCurrency(amount)}</strong> khi chuyển khoản
                </div>
              </div>
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
