import Link from "next/link";
import { Boxes, FolderTree, LayoutDashboard, Package, Receipt, Users } from "lucide-react";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Sản phẩm", icon: Package },
  { href: "/admin/categories", label: "Danh mục", icon: FolderTree },
  { href: "/admin/orders", label: "Đơn hàng", icon: Receipt },
  { href: "/admin/stocks", label: "Kho tài khoản", icon: Boxes },
  { href: "/admin/users", label: "Người dùng", icon: Users }
];

export function AdminSidebar() {
  return (
    <aside className="hidden w-52 shrink-0 lg:block">
      <div className="sticky top-16 rounded-lg border bg-white p-2 shadow-sm">
        <nav className="space-y-1">
          {items.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
