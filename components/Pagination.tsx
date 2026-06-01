import Link from "next/link";
import { Button } from "@/components/ui/button";

function buildHref(basePath: string, searchParams: Record<string, string | undefined>, page: number) {
  const next = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value && key !== "page") next.set(key, value);
  });
  if (page > 1) next.set("page", String(page));
  const query = next.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function Pagination({
  basePath,
  page,
  pageSize,
  total,
  searchParams = {}
}: {
  basePath: string;
  page: number;
  pageSize: number;
  total?: number | null;
  searchParams?: Record<string, string | undefined>;
}) {
  const pageCount = total ? Math.max(1, Math.ceil(total / pageSize)) : page;
  const hasPrevious = page > 1;
  const hasNext = total == null ? false : page < pageCount;

  if (!hasPrevious && !hasNext && pageCount <= 1) return null;

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-white p-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <span>Trang {page}{total != null ? ` / ${pageCount} (${total} mục)` : ""}</span>
      <div className="flex gap-2">
        <Button asChild variant="outline" size="sm" aria-disabled={!hasPrevious} className={!hasPrevious ? "pointer-events-none opacity-50" : ""}>
          <Link href={buildHref(basePath, searchParams, page - 1)}>Trước</Link>
        </Button>
        <Button asChild variant="outline" size="sm" aria-disabled={!hasNext} className={!hasNext ? "pointer-events-none opacity-50" : ""}>
          <Link href={buildHref(basePath, searchParams, page + 1)}>Sau</Link>
        </Button>
      </div>
    </div>
  );
}
