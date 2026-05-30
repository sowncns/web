"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, registerSchema } from "@/lib/validations";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams() ?? new URLSearchParams();
  const [loading, setLoading] = useState(false);

  async function submit(formData: FormData) {
    setLoading(true);
    const parsed = loginSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message);
      setLoading(false);
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setLoading(false);
    if (error) {
      toast.error("Email hoặc mật khẩu không đúng");
      return;
    }
    const { data: profile } = await supabase.from("profiles").select("role").single();
    router.push(params.get("next") || (profile?.role === "ADMIN" ? "/admin" : "/"));
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đăng nhập</CardTitle>
        <CardDescription>Truy cập tài khoản để xem đơn hàng và hỗ trợ.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={submit} className="space-y-4">
          <div className="space-y-2"><Label>Email</Label><Input name="email" type="email" required /></div>
          <div className="space-y-2"><Label>Mật khẩu</Label><Input name="password" type="password" required /></div>
          <Button className="w-full" disabled={loading}>{loading ? "Đang đăng nhập..." : "Đăng nhập"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function submit(formData: FormData) {
    setLoading(true);
    const raw = {
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword")
    };
    const parsed = registerSchema.safeParse(raw);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message);
      setLoading(false);
      return;
    }
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data)
    });
    const result = await response.json();
    if (!response.ok) {
      toast.error(result.error || "Không thể đăng ký");
      setLoading(false);
      return;
    }
    setLoading(false);
    if (!result.hasSession) {
      toast.success("Vui lòng kiểm tra email để xác nhận tài khoản");
      return;
    }
    router.push("/account");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đăng ký</CardTitle>
      
      </CardHeader>
      <CardContent>
        <form action={submit} className="space-y-4">
          <div className="space-y-2"><Label>Họ tên</Label><Input name="fullName" required /></div>
          <div className="space-y-2"><Label>Email</Label><Input name="email" type="email" required /></div>
          <div className="space-y-2"><Label>Số điện thoại</Label><Input name="phone" required /></div>
          <div className="space-y-2"><Label>Mật khẩu</Label><Input name="password" type="password" required /></div>
          <div className="space-y-2"><Label>Xác nhận mật khẩu</Label><Input name="confirmPassword" type="password" required /></div>
          <Button className="w-full" disabled={loading}>{loading ? "Đang tạo tài khoản..." : "Đăng ký"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
