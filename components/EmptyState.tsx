import { PackageOpen } from "lucide-react";

export function EmptyState({ title = "Chưa có dữ liệu", description = "Thông tin sẽ hiển thị tại đây khi có dữ liệu." }) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
      <PackageOpen className="h-10 w-10 text-muted-foreground" />
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
