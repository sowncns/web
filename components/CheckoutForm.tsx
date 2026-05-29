"use client";

import { useState } from "react";
import { History, Package, Wallet } from "lucide-react";
import { PaymentButton } from "@/components/PaymentButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";

export function CheckoutForm({ product, profile }: { product: any; profile?: any }) {
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState(profile?.full_name || "");
  const [customerEmail, setCustomerEmail] = useState(profile?.email || "");
  const [customerPhone, setCustomerPhone] = useState(profile?.phone || "");
  const [note, setNote] = useState("");
  const total = Number(product.price) * quantity;
  const payload = { productId: product.id, quantity, customerName, customerEmail, customerPhone, note };
  const amountOptions = [1, 2, 3, 5, 10, 20];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-normal text-slate-950">Thanh toán</h1>
        <p className="mt-3 text-sm text-muted-foreground">Quản lý thanh toán đơn hàng dịch vụ số của bạn</p>
        <Button asChild={false} variant="outline" size="sm" className="mt-4">
          <span><History className="h-4 w-4" /> Lịch sử giao dịch</span>
        </Button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="grid h-11 w-11 place-items-center rounded-md bg-blue-50 text-primary">
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tổng thanh toán</p>
            <p className="text-2xl font-bold text-slate-950">{formatCurrency(total)}</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-slate-950">Thanh toán đơn hàng</h2>
        <div className="mt-5 space-y-5">
          <div className="space-y-2">
            <Label>Phương thức thanh toán</Label>
            <select className="h-10 w-full rounded-md border-input text-sm">
              <option>Chuyển khoản qua payOS (Ngân hàng, QR Code, Ví điện tử)</option>
            </select>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-md bg-white text-primary">
                    <Package className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-950">{product.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{product.duration || "Theo gói"} - {formatCurrency(product.price)} / gói</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Thông tin khách hàng</Label>
                <div className="grid gap-3 md:grid-cols-3">
                  <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Họ tên" />
                  <Input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="Email" />
                  <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Số điện thoại" />
                </div>
              </div>
              <div className="space-y-2"><Label>Ghi chú</Label><Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ghi chú cho đơn hàng" /></div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Chọn số lượng</Label>
                <div className="grid grid-cols-3 gap-2">
                  {amountOptions.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setQuantity(value)}
                      className={`h-10 rounded-md border text-sm font-bold ${quantity === value ? "border-sky-500 bg-sky-50 text-primary" : "border-slate-200 bg-white text-slate-700 hover:border-sky-300"}`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-md border border-slate-200 p-3">
                <span className="text-sm text-muted-foreground">Số lượng</span>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</Button>
                  <Input className="w-16 text-center font-bold" value={quantity} readOnly />
                  <Button type="button" variant="outline" size="sm" onClick={() => setQuantity(Math.min(20, quantity + 1))}>+</Button>
                </div>
              </div>
              <div className="rounded-md bg-slate-50 p-3">
                <p className="text-sm text-muted-foreground">Số tiền</p>
                <p className="mt-1 text-xl font-bold text-slate-950">{formatCurrency(total)}</p>
              </div>
            </div>
          </div>

          <PaymentButton payload={payload} label={`Thanh toán ${formatCurrency(total)}`} />
        </div>
      </div>
    </div>
  );
}
