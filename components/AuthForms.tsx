"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, registerSchema } from "@/lib/validations";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams() ?? new URLSearchParams();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const busy = loading || googleLoading;

  async function signInWithGoogle() {
    setGoogleLoading(true);
    const next = params.get("next") || "/";
    window.location.href = `/api/auth/google?next=${encodeURIComponent(next)}`;
  }

  async function submit(formData: FormData) {
    setLoading(true);
    const parsed = loginSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message);
      setLoading(false);
      return;
    }
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data)
      });
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error || "Tài khoản hoặc mật khẩu không đúng");
        setLoading(false);
        return;
      }
      router.push(params.get("next") || (result.role === "ADMIN" ? "/admin" : "/"));
      router.refresh();
    } catch {
      toast.error("Không thể kết nối máy chủ");
      setLoading(false);
    }
  }

  return (
    <Card className="relative overflow-hidden">
      {busy ? (
        <div className="absolute inset-0 z-10 grid place-items-center bg-white/70 backdrop-blur-[2px]">
          <div className="flex items-center gap-3 rounded-full border bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-lg">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            {googleLoading ? "Đang chuyển hướng..." : "Đang đăng nhập..."}
          </div>
        </div>
      ) : null}
      <CardHeader>
        <CardTitle>Đăng nhập</CardTitle>
        <CardDescription>Truy cập tài khoản để xem đơn hàng và hỗ trợ.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form action={submit} className="space-y-4">
          <div className="space-y-2"><Label>Tài khoản</Label><Input name="username" minLength={6} disabled={busy} required /></div>
          <div className="space-y-2"><Label>Mật khẩu</Label><Input name="password" type="password" disabled={busy} required /></div>
          <Button className="w-full" disabled={busy}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </form>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          <span>hoặc</span>
          <span className="h-px flex-1 bg-border" />
        </div>
        <Button
          type="button"
          className="w-full border border-red-200 bg-red-50 text-red-700 shadow-sm hover:bg-red-100 hover:text-red-800"
          disabled={busy}
          onClick={signInWithGoogle}
        >
          {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
          {googleLoading ? "Đang chuyển hướng..." : "Đăng nhập bằng Google"}
        </Button>
      </CardContent>
    </Card>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const busy = loading || googleLoading;

  async function signInWithGoogle() {
    setGoogleLoading(true);
    window.location.href = "/api/auth/google?next=/";
  }

  async function submit(formData: FormData) {
    setLoading(true);
    const raw = {
      username: formData.get("username"),
      fullName: formData.get("fullName"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword")
    };
    const parsed = registerSchema.safeParse(raw);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message);
      setLoading(false);
      return;
    }
    try {
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
      router.push("/account");
      router.refresh();
    } catch {
      toast.error("Không thể kết nối máy chủ");
      setLoading(false);
    }
  }

  return (
    <Card className="relative overflow-hidden">
      {busy ? (
        <div className="absolute inset-0 z-10 grid place-items-center bg-white/70 backdrop-blur-[2px]">
          <div className="flex items-center gap-3 rounded-full border bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-lg">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            {googleLoading ? "Đang chuyển hướng..." : "Đang tạo tài khoản..."}
          </div>
        </div>
      ) : null}
      <CardHeader>
        <CardTitle>Đăng ký</CardTitle>
      
      </CardHeader>
      <CardContent className="space-y-4">
        <form action={submit} className="space-y-4">
          <div className="space-y-2"><Label>Họ tên</Label><Input name="fullName" disabled={busy} required /></div>
          <div className="space-y-2"><Label>Tài khoản</Label><Input name="username" minLength={6} disabled={busy} required /></div>
          <div className="space-y-2"><Label>Mật khẩu</Label><Input name="password" type="password" disabled={busy} required /></div>
          <div className="space-y-2"><Label>Xác nhận mật khẩu</Label><Input name="confirmPassword" type="password" disabled={busy} required /></div>
          <Button className="w-full" disabled={busy}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
          </Button>
        </form>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          <span>hoặc</span>
          <span className="h-px flex-1 bg-border" />
        </div>
        <Button
          type="button"
          className="w-full border border-red-200 bg-red-50 text-red-700 shadow-sm hover:bg-red-100 hover:text-red-800"
          disabled={busy}
          onClick={signInWithGoogle}
        >
          {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
          {googleLoading ? "Đang chuyển hướng..." : "Tiếp tục bằng Google"}
        </Button>
      </CardContent>
    </Card>
  );
}
