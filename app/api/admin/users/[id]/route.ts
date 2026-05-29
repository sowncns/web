import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminRequest } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

const schema = z.object({ role: z.enum(["USER", "ADMIN"]), status: z.enum(["ACTIVE", "BANNED"]) });

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const admin = await isAdminRequest();
  if (!admin.ok) return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  const body = schema.parse(await request.json());
  const { data, error } = await supabaseAdmin.from("profiles").update({ ...body, updated_at: new Date().toISOString() }).eq("id", params.id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
