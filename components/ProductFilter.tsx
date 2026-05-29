"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ProductFilter({ categories }: { categories: { id: string; name: string; slug: string }[] }) {
  const router = useRouter();
  const params = useSearchParams();

  function update(formData: FormData) {
    const next = new URLSearchParams();
    const search = String(formData.get("search") || "");
    const category = String(formData.get("category") || "");
    const sort = String(formData.get("sort") || "");
    if (search) next.set("search", search);
    if (category) next.set("category", category);
    if (sort) next.set("sort", sort);
    router.push(`/products?${next.toString()}`);
  }

  return (
    <form action={update} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm md:grid-cols-[1fr_180px_180px_auto]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input name="search" defaultValue={params.get("search") || ""} placeholder="Tìm theo tên sản phẩm" className="pl-9" />
      </div>
      <select name="category" defaultValue={params.get("category") || ""} className="h-10 rounded-md border-input text-sm">
        <option value="">Tất cả danh mục</option>
        {categories.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}
      </select>
      <select name="sort" defaultValue={params.get("sort") || ""} className="h-10 rounded-md border-input text-sm">
        <option value="">Sắp xếp mặc định</option>
        <option value="price_asc">Giá tăng dần</option>
        <option value="price_desc">Giá giảm dần</option>
      </select>
      <Button type="submit">Lọc</Button>
    </form>
  );
}
