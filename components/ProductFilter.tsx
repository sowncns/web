"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PRODUCT_FILTER_STORAGE_KEY = "shopmmogiare:product-filter";

export function ProductFilter({ categories }: { categories: { id: string; name: string; slug: string }[] }) {
  const router = useRouter();
  const params = useSearchParams() ?? new URLSearchParams();
  const isTemplatePage = params.get("type") === "template";
  const [searchValue, setSearchValue] = useState(params.get("search") || "");
  const [categoryValue, setCategoryValue] = useState(params.get("category") || "");
  const [sortValue, setSortValue] = useState(params.get("sort") || "");

  useEffect(() => {
    const hasUrlFilter = params.get("search") || params.get("category") || params.get("sort");
    if (hasUrlFilter) return;
    const stored = window.localStorage.getItem(PRODUCT_FILTER_STORAGE_KEY);
    if (!stored) return;
    try {
      const data = JSON.parse(stored) as { search?: string; category?: string; sort?: string; type?: string };
      if (data.type && data.type !== params.get("type")) return;
      const nextDefaults = { search: data.search || "", category: data.category || "", sort: data.sort || "" };
      setSearchValue(nextDefaults.search);
      setCategoryValue(nextDefaults.category);
      setSortValue(nextDefaults.sort);
    } catch {
      window.localStorage.removeItem(PRODUCT_FILTER_STORAGE_KEY);
    }
  }, [params]);

  function update(formData: FormData) {
    const next = new URLSearchParams();
    const search = String(formData.get("search") || "");
    const category = String(formData.get("category") || "");
    const sort = String(formData.get("sort") || "");
    const type = params.get("type");
    if (search) next.set("search", search);
    if (category) next.set("category", category);
    if (sort) next.set("sort", sort);
    if (type) next.set("type", type);
    window.localStorage.setItem(PRODUCT_FILTER_STORAGE_KEY, JSON.stringify({ search, category, sort, type }));
    router.push(`/products?${next.toString()}`);
  }

  return (
    <form action={update} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm lg:grid-cols-[1fr_180px_180px_auto]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input name="search" value={searchValue} onChange={(event) => setSearchValue(event.target.value)} placeholder={isTemplatePage ? "Tìm theo tên template" : "Tìm theo tên tài khoản"} className="pl-9" />
      </div>
      <select name="category" value={categoryValue} onChange={(event) => setCategoryValue(event.target.value)} className="h-10 rounded-md border-input text-sm">
        <option value="">Tất cả danh mục</option>
        {categories.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}
      </select>
      <select name="sort" value={sortValue} onChange={(event) => setSortValue(event.target.value)} className="h-10 rounded-md border-input text-sm">
        <option value="">Sắp xếp mặc định</option>
        <option value="price_asc">Giá tăng dần</option>
        <option value="price_desc">Giá giảm dần</option>
      </select>
      <Button type="submit">Lọc</Button>
    </form>
  );
}
