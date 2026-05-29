import { notFound } from "next/navigation";
import { AdminTicketReply } from "@/components/AdminManagers";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";

export default async function AdminTicketDetailPage({ params }: { params: { id: string } }) {
  const { data: ticket } = await supabaseAdmin.from("support_tickets").select("*, ticket_replies(*)").eq("id", params.id).single();
  if (!ticket) notFound();
  return (
    <div>
      <div className="rounded-lg border bg-white p-5">
        <div className="flex items-center justify-between gap-3"><h1 className="text-2xl font-bold">{ticket.title}</h1><OrderStatusBadge status={ticket.status} /></div>
        <p className="mt-3 whitespace-pre-line">{ticket.message}</p>
        <p className="mt-2 text-xs text-muted-foreground">{formatDate(ticket.created_at)}</p>
      </div>
      <div className="mt-5 space-y-3">{(ticket.ticket_replies || []).map((r: any) => <div key={r.id} className="rounded-lg border bg-white p-4 text-sm"><p>{r.message}</p><p className="mt-2 text-xs text-muted-foreground">{formatDate(r.created_at)}</p></div>)}</div>
      <AdminTicketReply ticketId={ticket.id} />
    </div>
  );
}
