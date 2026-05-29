import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { ticketReplySchema } from "@/lib/validations";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const admin = await isAdminRequest();
  if (!admin.ok || !admin.user) return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  const body = ticketReplySchema.parse(await request.json());
  if (body.message) await supabaseAdmin.from("ticket_replies").insert({ ticket_id: params.id, sender_id: admin.user.id, message: body.message });
  await supabaseAdmin.from("support_tickets").update({ status: body.close ? "CLOSED" : "REPLIED", updated_at: new Date().toISOString() }).eq("id", params.id);
  return NextResponse.json({ ok: true });
}
