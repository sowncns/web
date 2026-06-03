"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminProductSearch({ keyword }: { keyword: string }) {
  const router = useRouter();
  const params = useSearchParams() ?? new URLSearchParams();
  const [pending, startTransition] = useTransition();

  function submit(formData: FormData) {
    const next = new URLSearchParams(params.toString());
    const q = String(formData.get("q") || "").trim();
    next.delete("page");
    if (q) {
      next.set("q", q);
    } else {
      next.delete("q");
    }
    const query = next.toString();
    startTransition(() => {
      router.push(query ? `/admin/products?${query}` : "/admin/products");
    });
  }

  return (
    <form action={submit} className="flex flex-col gap-2 rounded-lg border bg-white p-4 sm:flex-row">
      <Input name="q" defaultValue={keyword} placeholder="Tìm theo tên hoặc slug sản phẩm" className="sm:max-w-md" />
      <Button type="submit" disabled={pending}>
        {pending ? <><Loader2 className="h-4 w-4 animate-spin" /> Đang tìm</> : "Tìm kiếm"}
      </Button>
      {keyword ? <Button asChild type="button" variant="outline"><Link href="/admin/products">Xóa tìm kiếm</Link></Button> : null}
    </form>
  );
}
