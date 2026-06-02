"use client";

import { useEffect, useState } from "react";
import { Package, Wallet, ShieldCheck, CreditCard, ArrowRight, TicketPercent, X } from "lucide-react";
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
  const [voucherCode, setVoucherCode] = useState("");
  const [voucher, setVoucher] = useState<any>(null);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const isTemplate = product.categories?.category_type === "TEMPLATE";
  const effectiveQuantity = isTemplate ? 1 : quantity;
  const subtotal = Number(product.price) * effectiveQuantity;
  const discountAmount = Number(voucher?.discountAmount || 0);
  const total = Math.max(0, subtotal - discountAmount);
  const payload = { productId: product.id, quantity: effectiveQuantity, voucherCode: voucher?.code || undefined };
  const balance = Number(profile?.balance || 0);
  const hasEnoughBalance = balance >= total;

  useEffect(() => {
    setVoucher(null);
  }, [effectiveQuantity, product.id]);

  async function applyVoucher() {
    const code = voucherCode.trim();
    if (!code) {
      toast.error("Vui lòng nhập mã voucher");
      return;
    }
    setVoucherLoading(true);
    try {
      const res = await fetch("/api/vouchers/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: effectiveQuantity, voucherCode: code })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Voucher không hợp lệ");
      setVoucher(data);
      setVoucherCode(data.code);
      toast.success("Đã áp dụng voucher");
    } catch (error) {
      setVoucher(null);
      toast.error(error instanceof Error ? error.message : "Không thể áp dụng voucher");
    } finally {
      setVoucherLoading(false);
    }
  }

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
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <div className="flex-1 space-y-6">
          <div className="glass rounded-2xl p-6">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-900">
              <Package className="h-6 w-6 text-primary" /> {isTemplate ? "Thông tin template" : "Thông tin sản phẩm"}
            </h2>
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white shadow-sm border border-slate-100 text-primary">
                  <Package className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-bold text-slate-900">{product.name}</p>
                  <p className="mt-1 text-sm font-medium text-slate-500">{product.duration || (isTemplate ? "Trọn đời" : "Theo gói")} • {formatCurrency(product.price)} / gói</p>
                </div>
              </div>
            </div>

            {isTemplate ? (
              <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
                Template là sản phẩm tải xuống, mỗi lần mua sẽ nhận 1 bộ file đầy đủ.
              </div>
            ) : (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                <span className="font-semibold text-slate-700">Số lượng mua</span>
                <div className="flex w-full items-center gap-2 sm:w-auto">
                  <Button type="button" variant="outline" size="icon" className="h-10 w-10 shrink-0 rounded-full" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</Button>
                  <Input
                    className="h-10 min-w-0 flex-1 text-center font-bold sm:w-20 sm:flex-none"
                    type="number"
                    min={1}
                    max={20}
                    value={quantity}
                    onChange={(event) => setQuantity(Math.max(1, Math.min(20, Number(event.target.value) || 1)))}
                  />
                  <Button type="button" variant="outline" size="icon" className="h-10 w-10 shrink-0 rounded-full" onClick={() => setQuantity(Math.min(20, quantity + 1))}>+</Button>
                </div>
              </div>
            )}
          </div>
          
          <div className="glass rounded-2xl p-6">
             <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-900">
              <ShieldCheck className="h-6 w-6 text-emerald-500" /> Cam kết dịch vụ
            </h2>
            <p className="text-sm leading-relaxed text-slate-600">
              Giao dịch hoàn toàn tự động. Số dư sẽ bị trừ và đơn hàng sẽ được kích hoạt ngay lập tức sau khi nhấn thanh toán. Nếu có lỗi xảy ra, tiền sẽ được hoàn lại tự động.
              {isTemplate ? " Sau khi đơn hoàn tất, bạn sẽ thấy link tải, mật khẩu giải nén và hướng dẫn sử dụng trong chi tiết đơn." : ""}
            </p>
          </div>
        </div>

        <div className="w-full md:w-[360px] lg:w-[400px]">
          <div className="sticky top-20 rounded-2xl border border-primary/20 bg-primary/5 p-6 shadow-xl shadow-primary/10">
            <h3 className="text-lg font-bold text-slate-900">Tóm tắt thanh toán</h3>
            <div className="mt-6 space-y-4 border-b border-primary/10 pb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Giá sản phẩm</span>
                <span className="font-semibold text-slate-900">{formatCurrency(product.price)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Số lượng</span>
                <span className="font-semibold text-slate-900">x{effectiveQuantity}</span>
              </div>
              <div className="space-y-3 rounded-xl border border-slate-100 bg-white p-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <TicketPercent className="h-4 w-4 text-primary" /> Voucher
                </div>
                <div className="flex gap-2">
                  <Input
                    className="h-10 uppercase"
                    value={voucherCode}
                    onChange={(event) => {
                      setVoucherCode(event.target.value.toUpperCase());
                      setVoucher(null);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        applyVoucher();
                      }
                    }}
                    placeholder="Nhập mã"
                  />
                  <Button type="button" variant="outline" className="h-10 shrink-0" onClick={applyVoucher} disabled={voucherLoading}>
                    {voucherLoading ? "..." : "Áp dụng"}
                  </Button>
                </div>
                {voucher ? (
                  <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
                    <span>{voucher.code} giảm {formatCurrency(discountAmount)}</span>
                    <button type="button" className="rounded-full p-1 hover:bg-emerald-100" onClick={() => setVoucher(null)} aria-label="Bỏ voucher">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : null}
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Tạm tính</span>
                <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
              </div>
              {discountAmount > 0 ? (
                <div className="flex justify-between text-sm text-emerald-700">
                  <span>Giảm giá</span>
                  <span className="font-semibold">-{formatCurrency(discountAmount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between pt-4">
                <span className="font-bold text-slate-900">Thanh toán</span>
                <span className="text-2xl font-black text-primary">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-4 flex items-center justify-between rounded-xl bg-white p-3 shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 text-sm">
                  <Wallet className="h-4 w-4 text-slate-400" /> Số dư hiện có
                </div>
                <div className="font-bold text-slate-900">{formatCurrency(balance)}</div>
              </div>

              {hasEnoughBalance ? (
                <Button className="h-14 w-full rounded-full text-base font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5" onClick={purchase} disabled={loading}>
                  <CreditCard className="mr-2 h-5 w-5" />
                  {loading ? "Đang xử lý..." : "Thanh toán ngay"}
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center text-sm">
                    <p className="font-semibold text-amber-800">Số dư không đủ</p>
                    <p className="mt-1 text-amber-700/80">Cần nạp thêm {formatCurrency(total - balance)}</p>
                  </div>
                  <Button asChild className="h-14 w-full rounded-full text-base font-bold shadow-lg transition-all hover:-translate-y-0.5" variant="secondary">
                    <Link href="/payment">Nạp tiền vào tài khoản <ArrowRight className="ml-2 h-5 w-5" /></Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
