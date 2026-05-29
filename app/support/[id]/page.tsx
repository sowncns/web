import { notFound } from "next/navigation";
import { TicketReplyForm } from "@/components/SupportClient";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { requireActiveUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export default async function TicketDetailPage({ params }: { params: { id: string } }) {
  const { user } = await requireActiveUser();
  const supabase = createClient();
  const { data: ticket } = await supabase.from("support_tickets").select("*, ticket_replies(*)").eq("id", params.id).eq("user_id", user.id).single();
  if (!ticket) notFound();
  return (
    <div className="container-page py-10">
      <div className="rounded-lg border bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-bold">{ticket.title}</h1>
          <OrderStatusBadge status={ticket.status} />
        </div>
        <p className="mt-2 whitespace-pre-line text-muted-foreground">{ticket.message}</p>
        <p className="mt-2 text-xs text-muted-foreground">{formatDate(ticket.created_at)}</p>
      </div>
      <div className="mt-5 space-y-3">
        {(ticket.ticket_replies || []).map((reply: any) => (
          <div key={reply.id} className="rounded-lg border bg-white p-4">
            <p className="whitespace-pre-line text-sm">{reply.message}</p>
            <p className="mt-2 text-xs text-muted-foreground">{formatDate(reply.created_at)}</p>
          </div>
        ))}
      </div>
      {ticket.status !== "CLOSED" ? <TicketReplyForm ticketId={ticket.id} /> : null}
    </div>
  );
}
