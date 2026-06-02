import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { voucherSchema } from "@/lib/validations";

function normalizeVoucher(body: ReturnType<typeof voucherSchema.parse>) {
  return {
    ...body,
    description: body.description || null,
    max_uses: body.max_uses ?? null,
    starts_at: body.starts_at || null,
    expires_at: body.expires_at || null
  };
}

export async function POST(request: Request) {
  const admin = await isAdminRequest();
  if (!admin.ok) return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  const body = normalizeVoucher(voucherSchema.parse(await request.json()));
  const { data, error } = await supabaseAdmin.from("vouchers").insert(body).select("*").single();
  if (error && error.code === "23505") return NextResponse.json({ error: "Mã voucher đã tồn tại" }, { status: 400 });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
