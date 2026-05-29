"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AccountForm({ profile }: { profile: any }) {
  const [fullName, setFullName] = useState(profile.full_name || "");
  const [phone, setPhone] = useState(profile.phone || "");

  async function submit() {
    const res = await fetch("/api/auth/user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: fullName, phone })
    });
    if (!res.ok) {
      toast.error("Không thể cập nhật thông tin");
      return;
    }
    toast.success("Đã cập nhật tài khoản");
  }

  return (
    <div className="rounded-lg border bg-white p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2"><Label>Email</Label><Input value={profile.email || ""} disabled /></div>
        <div className="space-y-2"><Label>Vai trò</Label><Input value={profile.role} disabled /></div>
        <div className="space-y-2"><Label>Họ tên</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
        <div className="space-y-2"><Label>Số điện thoại</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
      </div>
      <Button className="mt-5" onClick={submit}>Cập nhật thông tin</Button>
    </div>
  );
}
