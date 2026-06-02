import { Loader2 } from "lucide-react";

export function LoadingState({ label = "Đang tải..." }) {
  return (
    <div className="flex items-center justify-center gap-3 rounded-lg border bg-white p-6 text-sm font-medium text-muted-foreground shadow-sm">
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
      <span>{label}</span>
    </div>
  );
}
