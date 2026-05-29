import Link from "next/link";
import { Boxes, CreditCard, Headphones, History, Home, LayoutDashboard, LogOut, Package, Receipt, ShieldCheck, ShoppingBag, User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

const userLinks = [
  { href: "/", label: "Tổng quan", icon: Home },
  { href: "/products", label: "Sản phẩm", icon: Package },
  { href: "/payment", label: "Thanh toán", icon: CreditCard },
  { href: "/orders", label: "Lịch sử đơn", icon: History },
  { href: "/support", label: "Hỗ trợ", icon: Headphones }
];

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Đơn hàng", icon: Receipt },
  { href: "/admin/stocks", label: "Kho tài khoản", icon: Boxes }
];

export async function Navbar() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from("profiles").select("role").eq("id", user.id).single() : { data: null };

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-[184px] border-r border-slate-200 bg-white lg:block">
        <Link href="/" className="flex h-[52px] items-center gap-2 border-b px-3 font-bold text-slate-900">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-[11px] font-black text-white">DL</span>
          <span>DigiLicense</span>
        </Link>
        <nav className="space-y-1 p-3 text-sm">
          {userLinks.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-md px-3 py-2 text-slate-600 hover:bg-secondary hover:text-primary">
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          {profile?.role === "ADMIN" ? (
            <div className="mt-4 border-t pt-3">
              <p className="mb-2 px-3 text-xs font-semibold uppercase text-slate-400">Admin</p>
              {adminLinks.map((item) => (
                <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-md px-3 py-2 text-slate-600 hover:bg-secondary hover:text-primary">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          ) : null}
          <Link href="/" className="mt-4 flex items-center gap-3 rounded-md px-3 py-2 text-slate-600 hover:bg-slate-50">
            <ShieldCheck className="h-4 w-4" />
            Về trang chủ
          </Link>
        </nav>
      </aside>
      <header className="fixed left-0 right-0 top-0 z-40 border-b border-slate-200 bg-white lg:left-[184px]">
        <div className="flex h-[52px] items-center justify-between gap-3 px-3 sm:px-5">
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-slate-900 lg:hidden">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-[11px] font-black text-white">DL</span>
              DigiLicense
            </Link>
            <p className="hidden text-sm font-semibold text-slate-900 lg:block">Quản lý dịch vụ số</p>
          </div>
          <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="md:hidden">
            <Link href="/products" aria-label="Sản phẩm"><ShoppingBag className="h-5 w-5" /></Link>
          </Button>
          {user ? (
            <>
              <Button asChild variant="outline" size="sm">
                <Link href="/account"><User className="h-4 w-4" /> Tài khoản</Link>
              </Button>
              <form action="/api/auth/logout" method="post">
                <Button variant="ghost" size="icon" aria-label="Đăng xuất"><LogOut className="h-4 w-4" /></Button>
              </form>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm"><Link href="/login">Đăng nhập</Link></Button>
              <Button asChild size="sm"><Link href="/register">Đăng ký</Link></Button>
            </>
          )}
          <div className="hidden h-8 w-8 place-items-center rounded-full bg-orange-500 text-xs font-bold text-white sm:grid">
            {user?.email?.slice(0, 1).toUpperCase() || "N"}
          </div>
        </div>
        </div>
      </header>
    </>
  );
}
