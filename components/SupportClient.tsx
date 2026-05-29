"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function SupportCreateForm({ orderId }: { orderId?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function submit(formData: FormData) {
    setLoading(true);
    const res = await fetch("/api/support/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order_id: orderId || null,
        title: formData.get("title"),
        message: formData.get("message")
      })
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error || "Không tạo được ticket");
      return;
    }
    toast.success("Đã tạo ticket hỗ trợ");
    router.refresh();
  }

  return (
    <form action={submit} className="space-y-4 rounded-lg border bg-white p-5">
      <h2 className="font-semibold">Tạo ticket hỗ trợ</h2>
      <div className="space-y-2"><Label>Tiêu đề</Label><Input name="title" required /></div>
      <div className="space-y-2"><Label>Nội dung</Label><Textarea name="message" required /></div>
      <Button disabled={loading}>{loading ? "Đang gửi..." : "Tạo ticket"}</Button>
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
