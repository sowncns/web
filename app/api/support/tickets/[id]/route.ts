import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ticketReplySchema } from "@/lib/validations";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  const body = ticketReplySchema.parse(await request.json());
  const { data: ticket } = await supabase.from("support_tickets").select("*").eq("id", params.id).eq("user_id", user.id).single();
  if (!ticket || ticket.status === "CLOSED") return NextResponse.json({ error: "Ticket không khả dụng" }, { status: 404 });
  const { error } = await supabase.from("ticket_replies").insert({ ticket_id: params.id, sender_id: user.id, message: body.message });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await supabase.from("support_tickets").update({ status: "OPEN", updated_at: new Date().toISOString() }).eq("id", params.id);
  return NextResponse.json({ ok: true });
}
