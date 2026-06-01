import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { bumpCacheVersion } from "@/lib/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { categorySchema } from "@/lib/validations";

function categoryTypeSchemaError(message?: string) {
  return message?.includes("category_type") && message?.includes("schema cache");
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const admin = await isAdminRequest();
  if (!admin.ok) return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  const body = categorySchema.partial().parse(await request.json());
  const { data, error } = await supabaseAdmin.from("categories").update(body).eq("id", params.id).select("*").single();
  if (categoryTypeSchemaError(error?.message)) {
    return NextResponse.json({ error: "Database Supabase chưa có cột category_type hoặc schema cache chưa reload. Hãy chạy migration SQL rồi reload schema cache." }, { status: 400 });
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await Promise.all([bumpCacheVersion("categories"), bumpCacheVersion("products"), bumpCacheVersion("admin-dashboard")]);
  return NextResponse.json(data);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const admin = await isAdminRequest();
  if (!admin.ok) return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  const { error } = await supabaseAdmin.from("categories").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await Promise.all([bumpCacheVersion("categories"), bumpCacheVersion("products"), bumpCacheVersion("admin-dashboard")]);
  return NextResponse.json({ ok: true });
}
