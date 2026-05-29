"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function SupportCreateForm({ orders, orderId }: { orders: any[]; orderId?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function submit(formData: FormData) {
    const selectedOrderId = String(formData.get("order_id") || "");
    const selectedOrder = orders.find((order) => order.id === selectedOrderId);
    const orderCode = selectedOrder?.order_code || String(formData.get("order_code") || "");
    const issue = String(formData.get("issue") || "");
    setLoading(true);
    const res = await fetch("/api/support/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order_id: selectedOrderId || null,
        title: `Hỗ trợ đơn ${orderCode || "không rõ mã"}`,
        message: `Mã đơn hàng: ${orderCode || "Không cung cấp"}\n\nSự cố: ${issue}`
      })
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error || "Không gửi được yêu cầu hỗ trợ");
      return;
    }
    toast.success("Đã gửi yêu cầu hỗ trợ");
    router.refresh();
  }

  return (
    <form action={submit} className="space-y-4 rounded-lg border bg-white p-5">
      <div>
        <h2 className="font-semibold">Gửi yêu cầu hỗ trợ</h2>
        <p className="mt-1 text-sm text-muted-foreground">Chọn mã đơn hàng và mô tả sự cố để admin kiểm tra.</p>
      </div>
      {orders.length ? (
        <div className="space-y-2">
          <Label>Mã đơn hàng</Label>
          <select name="order_id" defaultValue={orderId || ""} className="h-10 w-full rounded-md border-input text-sm" required>
            <option value="">Chọn mã đơn hàng</option>
            {orders.map((order) => <option key={order.id} value={order.id}>#{order.order_code} - {order.products?.name || "Đơn hàng"}</option>)}
          </select>
        </div>
      ) : (
        <div className="space-y-2"><Label>Mã đơn hàng</Label><Input name="order_code" placeholder="Nhập mã đơn hàng" required /></div>
      )}
      <div className="space-y-2"><Label>Sự cố cần hỗ trợ</Label><Textarea name="issue" placeholder="Ví dụ: tài khoản không đăng nhập được, cần admin kiểm tra lại đơn..." required /></div>
      <Button disabled={loading}>{loading ? "Đang gửi..." : "Gửi yêu cầu"}</Button>
    </form>
  );
}

export function TicketReplyForm({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  async function submit(formData: FormData) {
    const res = await fetch(`/api/support/tickets/${ticketId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: formData.get("message") })
    });
    if (!res.ok) toast.error("Không gửi được phản hồi");
    else {
      toast.success("Đã gửi phản hồi");
      router.refresh();
    }
  }
  return (
    <form action={submit} className="mt-4 space-y-3">
      <Textarea name="message" required placeholder="Nhập phản hồi" />
      <Button>Gửi phản hồi</Button>
    </form>
  );
}
