import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { voucherPatchSchema } from "@/lib/validations";

function normalizeVoucher(body: ReturnType<typeof voucherPatchSchema.parse>) {
  const data: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const [key, value] of Object.entries(body)) {
    if (value === undefined) continue;
    if (["description", "starts_at", "expires_at"].includes(key)) {
      data[key] = value || null;
    } else if (key === "max_uses") {
      data[key] = value ?? null;
    } else {
      data[key] = value;
    }
  }
  return data;
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const admin = await isAdminRequest();
  if (!admin.ok) return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  const body = normalizeVoucher(voucherPatchSchema.parse(await request.json()));
  const { data, error } = await supabaseAdmin.from("vouchers").update(body).eq("id", params.id).select("*").single();
  if (error && error.code === "23505") return NextResponse.json({ error: "Mã voucher đã tồn tại" }, { status: 400 });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const admin = await isAdminRequest();
  if (!admin.ok) return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  const { error } = await supabaseAdmin.from("vouchers").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
