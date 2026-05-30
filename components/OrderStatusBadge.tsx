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
  DISABLED: "bg-red-100 text-red-800",
  ACTIVE: "bg-emerald-100 text-emerald-800",
  BANNED: "bg-red-100 text-red-800",
  USER: "bg-slate-100 text-slate-700",
  ADMIN: "bg-blue-100 text-blue-800"
};

export const statusLabels: Record<string, string> = {
  PENDING: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  PROCESSING: "Đang xử lý",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã hủy",
  EXPIRED: "Hết hạn",
  REFUNDED: "Đã hoàn tiền",
  OPEN: "Đang mở",
  REPLIED: "Đã phản hồi",
  CLOSED: "Đã đóng",
  AVAILABLE: "Còn hàng",
  USED: "Đã dùng",
  DISABLED: "Đã tắt",
  ACTIVE: "Hoạt động",
  BANNED: "Bị khóa",
  USER: "Người dùng",
  ADMIN: "Quản trị"
};

export function OrderStatusBadge({ status }: { status: string }) {
  return <Badge className={styles[status] || "bg-slate-100 text-slate-700"}>{statusLabels[status] || status}</Badge>;
}
