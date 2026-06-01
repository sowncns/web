import { NextResponse } from "next/server";
import { encryptText } from "@/lib/encryption";
import { isAdminRequest } from "@/lib/auth";
import { bumpCacheVersion } from "@/lib/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const admin = await isAdminRequest();
  if (!admin.ok) return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  const body = await request.json();
  const update: Record<string, string | null> = {};
  if (typeof body.product_id === "string") update.product_id = body.product_id;
  if (typeof body.username === "string") update.username_encrypted = encryptText(body.username);
  if (typeof body.password === "string") update.password_encrypted = encryptText(body.password);
  if (typeof body.note === "string") update.note_encrypted = encryptText(body.note);
  if (typeof body.duration === "string") update.duration = body.duration;
  if (["AVAILABLE", "USED", "DISABLED"].includes(body.status)) update.status = body.status;
  if (!Object.keys(update).length) return NextResponse.json({ error: "Không có dữ liệu cập nhật" }, { status: 400 });
  const { data, error } = await supabaseAdmin.from("stock_items").update(update).eq("id", params.id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await bumpCacheVersion("admin-dashboard");
  return NextResponse.json(data);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const admin = await isAdminRequest();
  if (!admin.ok) return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  const { error } = await supabaseAdmin.from("stock_items").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await bumpCacheVersion("admin-dashboard");
  return NextResponse.json({ ok: true });
}
