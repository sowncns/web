"use client";

import { useState } from "react";
import { Package, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";

export function CheckoutForm({ product, profile }: { product: any; profile?: any }) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const total = Number(product.price) * quantity;
  const payload = { productId: product.id, quantity };
  const balance = Number(profile?.balance || 0);
  const hasEnoughBalance = balance >= total;

  async function purchase() {
    setLoading(true);
    try {
      const res = await fetch("/api/orders/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể mua hàng");
      toast.success("Đã thanh toán bằng số dư");
      router.push(`/orders/${data.orderId}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể mua hàng");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="grid h-11 w-11 place-items-center rounded-md bg-blue-50 text-primary">
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tổng thanh toán</p>
            <p className="text-2xl font-bold text-slate-950">{formatCurrency(total)}</p>
            <p className="mt-1 text-sm font-semibold text-primary">Số dư: {formatCurrency(balance)}</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-slate-950">Thanh toán đơn hàng</h2>
        <div className="mt-5 space-y-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
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

            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 p-3">
                <span className="text-sm font-medium text-slate-700">Số lượng</span>
                <div className="flex w-full items-center gap-2 sm:w-auto">
                  <Button type="button" variant="outline" size="sm" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</Button>
                  <Input
                    className="min-w-0 flex-1 text-center font-bold sm:w-20 sm:flex-none"
                    type="number"
                    min={1}
                    max={20}
                    value={quantity}
                    onChange={(event) => setQuantity(Math.max(1, Math.min(20, Number(event.target.value) || 1)))}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => setQuantity(Math.min(20, quantity + 1))}>+</Button>
                </div>
              </div>
              <div className="rounded-md bg-slate-50 p-3">
                <p className="text-sm text-muted-foreground">Tổng giá tiền</p>
                <p className="mt-1 text-xl font-bold text-slate-950">{formatCurrency(total)}</p>
              </div>
            </div>
          </div>

          {hasEnoughBalance ? (
            <Button className="h-11 w-full" onClick={purchase} disabled={loading}>
              <Wallet className="h-4 w-4" />
              {loading ? "Đang thanh toán..." : `Thanh toán bằng số dư ${formatCurrency(total)}`}
            </Button>
          ) : (
            <div className="space-y-3 rounded-md border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-800">Số dư không đủ. Bạn cần nạp thêm {formatCurrency(total - balance)}.</p>
              <Button asChild className="w-full">
                <Link href="/payment">Nạp tiền</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
