import Link from "next/link";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";

export default async function AdminTicketsPage() {
  const { data: ticketsData } = await supabaseAdmin.from("support_tickets").select("*, profiles(email), orders(order_code)").order("created_at", { ascending: false });
  const tickets = ticketsData ?? [];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Yêu cầu hỗ trợ</h1>
      <div className="space-y-3">{tickets.map((t: any) => <div key={t.id} className="rounded-lg border bg-white p-4"><div className="flex items-center justify-between gap-3"><strong>{t.title}</strong><OrderStatusBadge status={t.status} /></div><p className="mt-1 text-sm text-muted-foreground">{t.profiles?.email} - Mã đơn {t.orders?.order_code || "-"} - {formatDate(t.created_at)}</p><Button asChild size="sm" variant="outline" className="mt-3"><Link href={`/admin/tickets/${t.id}`}>Kiểm tra</Link></Button></div>)}</div>
    </div>
  );
}
