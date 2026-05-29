import { Badge } from "@/components/ui/badge";

const styles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  PAID: "bg-emerald-100 text-emerald-800",
  PROCESSING: "bg-sky-100 text-sky-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  EXPIRED: "bg-red-100 text-red-800",
  REFUNDED: "bg-slate-100 text-slate-700",
  OPEN: "bg-amber-100 text-amber-800",
  REPLIED: "bg-sky-100 text-sky-800",
  CLOSED: "bg-slate-100 text-slate-700",
  AVAILABLE: "bg-emerald-100 text-emerald-800",
  USED: "bg-slate-100 text-slate-700",
  DISABLED: "bg-red-100 text-red-800"
};

export function OrderStatusBadge({ status }: { status: string }) {
  return <Badge className={styles[status] || "bg-slate-100 text-slate-700"}>{status}</Badge>;
}
