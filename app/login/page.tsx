import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/AuthForms";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    const profile = await getCurrentProfile();
    redirect(profile?.role === "ADMIN" ? "/admin" : "/");
  }

  return (
    <div className="container-page grid min-h-[calc(100vh-8rem)] place-items-center py-10">
      <div className="w-full max-w-md">
        <LoginForm />
        <p className="mt-4 text-center text-sm text-muted-foreground">Chưa có tài khoản? <Link className="font-medium text-primary" href="/register">Đăng ký</Link></p>
      </div>
    </div>
  );
}
