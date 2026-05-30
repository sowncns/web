"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AdminStockFilter({ products }: { products: any[] }) {
  const router = useRouter();
  const params = useSearchParams() ?? new URLSearchParams();

  function submit(formData: FormData) {
    const next = new URLSearchParams();
    const productId = String(formData.get("product_id") || "");
    const status = String(formData.get("status") || "");
    if (productId) next.set("product_id", productId);
    if (status) next.set("status", status);
    router.push(`/admin/stocks?${next.toString()}`);
  }

  return (
    <form action={submit} className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-[1fr_180px_auto_auto]">
      <select name="product_id" defaultValue={params.get("product_id") || ""} className="h-10 rounded-md border-input text-sm">
        <option value="">Tất cả sản phẩm</option>
        {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
      </select>
      <select name="status" defaultValue={params.get("status") || ""} className="h-10 rounded-md border-input text-sm">
        <option value="">Tất cả trạng thái</option>
        <option value="AVAILABLE">Còn hàng</option>
        <option value="USED">Đã dùng</option>
        <option value="DISABLED">Đã tắt</option>
      </select>
      <Button type="submit">Lọc</Button>
      <Button type="button" variant="outline" onClick={() => router.push("/admin/stocks")}>Xóa lọc</Button>
    </form>
  );
}
