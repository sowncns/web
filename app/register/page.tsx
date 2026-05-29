import Link from "next/link";
import { RegisterForm } from "@/components/AuthForms";

export default function RegisterPage() {
  return (
    <div className="container-page grid min-h-[calc(100vh-8rem)] place-items-center py-10">
      <div className="w-full max-w-md">
        <RegisterForm />
        <p className="mt-4 text-center text-sm text-muted-foreground">Đã có tài khoản? <Link className="font-medium text-primary" href="/login">Đăng nhập</Link></p>
      </div>
    </div>
  );
}
