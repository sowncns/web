import Link from "next/link";
import { SupportCreateForm } from "@/components/SupportClient";
import { EmptyState } from "@/components/EmptyState";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { requireActiveUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export default async function SupportPage({ searchParams }: { searchParams: { orderId?: string } }) {
  const { user } = await requireActiveUser();
  const supabase = createClient();
  const [{ data: ticketsData }, { data: ordersData }] = await Promise.all([
    supabase.from("support_tickets").select("*, orders(order_code)").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("orders").select("id, order_code, products(name)").eq("user_id", user.id).order("created_at", { ascending: false })
  ]);
  const tickets = ticketsData ?? [];
  const orders = ordersData ?? [];
  return (
    <div className="container-page grid gap-6 py-10 lg:grid-cols-[420px_1fr]">
      <SupportCreateForm orders={orders as any[]} orderId={searchParams.orderId} />
      <div>
        <h1 className="mb-5 text-3xl font-bold">Yêu cầu hỗ trợ</h1>
        {!tickets.length ? <EmptyState title="Chưa có yêu cầu hỗ trợ" description="Khi cần hỗ trợ, hãy gửi mã đơn hàng và mô tả sự cố." /> : (
          <div className="space-y-3">
            {tickets.map((ticket: any) => (
              <Link key={ticket.id} href={`/support/${ticket.id}`} className="block rounded-lg border bg-white p-4 hover:border-primary">
                <div className="flex items-center justify-between gap-3">
                  <strong>{ticket.title}</strong>
                  <OrderStatusBadge status={ticket.status} />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Mã đơn: {ticket.orders?.order_code || "-"} - {formatDate(ticket.created_at)}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
