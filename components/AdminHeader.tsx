import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AdminHeader({ name }: { name?: string | null }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">Xin chào, {name || "Admin"}</p>
        <h1 className="text-2xl font-bold tracking-normal">Bảng quản trị</h1>
      </div>
      <Button asChild variant="outline">
        <Link href="/admin/settings">Cài đặt thông báo</Link>
      </Button>
    </div>
  );
}
