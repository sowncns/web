import Link from "next/link";
import { LoginForm } from "@/components/AuthForms";

export default function LoginPage() {
  return (
    <div className="container-page grid min-h-[calc(100vh-8rem)] place-items-center py-10">
      <div className="w-full max-w-md">
        <LoginForm />
        <p className="mt-4 text-center text-sm text-muted-foreground">Chưa có tài khoản? <Link className="font-medium text-primary" href="/register">Đăng ký</Link></p>
      </div>
    </div>
  );
}
