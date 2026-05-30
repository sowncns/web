"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, CreditCard, FolderTree, History, Home, LayoutDashboard, LogOut, MessageCircle, Package, Receipt, ShoppingBag, Users, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

const userLinks = [
  { href: "/", label: "Tổng quan", icon: Home },
  { href: "/products", label: "Sản phẩm", icon: Package },
  { href: "/payment", label: "Nạp tiền", icon: CreditCard },
  { href: "/orders", label: "Lịch sử đơn", icon: History },
  { href: "/contact", label: "Liên hệ", icon: MessageCircle }
];

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Sản phẩm", icon: Package },
  { href: "/admin/categories", label: "Danh mục", icon: FolderTree },
  { href: "/admin/orders", label: "Đơn hàng", icon: Receipt },
  { href: "/admin/stocks", label: "Kho tài khoản", icon: Boxes },
  { href: "/admin/users", label: "Người dùng", icon: Users }
];

export function NavbarClient({ userEmail, profile }: { userEmail?: string | null; profile?: any }) {
  const pathname = usePathname() || "/";
  const isAdmin = profile?.role === "ADMIN";
  const isAdminArea = pathname.startsWith("/admin") || isAdmin;
  const sidebarLinks = isAdmin ? adminLinks : userLinks;
  const bottomLinks = sidebarLinks.slice(0, 5);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-[184px] border-r border-slate-200 bg-white lg:block">
        <Link href={isAdminArea ? "/admin" : "/"} className="flex h-[52px] items-center gap-2 border-b px-3 font-bold text-slate-900">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-[11px] font-black text-white">DL</span>
          <span>SHOPMMOGIARE</span>
        </Link>
        <nav className="space-y-1 p-3 text-sm">
          {isAdmin ? <p className="mb-2 px-3 text-xs font-semibold uppercase text-slate-400">Admin</p> : null}
          {sidebarLinks.map((item) => (
            <Link key={item.href} href={item.href} className="relative flex items-center gap-3 rounded-md px-3 py-2 text-slate-600 hover:bg-secondary hover:text-primary">
              <item.icon className="h-4 w-4" />
              <span className="min-w-0 flex-1">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
      <header className="fixed left-0 right-0 top-0 z-40 border-b border-slate-200 bg-white lg:left-[184px]">
        <div className="flex h-[52px] items-center justify-between gap-3 px-3 sm:px-5">
          <div className="min-w-0">
            <Link href={isAdminArea ? "/admin" : "/"} className="flex items-center gap-2 font-bold text-slate-900 lg:hidden">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-[11px] font-black text-white">DL</span>
              <span className="truncate">SHOPMMOGIARE</span>
            </Link>
            <p className="hidden text-sm font-semibold text-slate-900 lg:block">{isAdminArea ? "Quản trị hệ thống" : "Quản lý dịch vụ số"}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {!isAdminArea ? (
              <Button asChild variant="ghost" size="icon" className="sm:hidden">
                <Link href="/products" aria-label="Sản phẩm"><ShoppingBag className="h-5 w-5" /></Link>
              </Button>
            ) : null}
            {userEmail ? (
              <>
                {!isAdminArea ? (
                  <Link href="/payment" className="hidden h-9 flex-col items-center justify-center rounded-md border border-sky-400 bg-sky-50 px-3 text-center text-xs font-semibold leading-tight text-primary shadow-sm sm:flex">
                    <span>Số dư</span>
                    <span>{formatCurrency(Number(profile?.balance || 0)).replace(/\s/g, " ")}</span>
                  </Link>
                ) : null}
                <Button asChild variant="outline" size="sm" className="px-2 sm:px-3">
                  <Link href="/account"><User className="h-4 w-4" /> <span className="hidden sm:inline">Tài khoản</span></Link>
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
              {userEmail?.slice(0, 1).toUpperCase() || "N"}
            </div>
          </div>
        </div>
      </header>
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-slate-200 bg-white shadow-[0_-6px_20px_rgba(15,23,42,0.08)] lg:hidden">
        {bottomLinks.map((item) => (
          <Link key={item.href} href={item.href} className="flex h-16 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium text-slate-600 hover:bg-secondary hover:text-primary">
            <item.icon className="h-5 w-5" />
            <span className="max-w-full truncate px-1">{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
