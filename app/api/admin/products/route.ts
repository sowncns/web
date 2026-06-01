import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { bumpCacheVersion } from "@/lib/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { productSchema } from "@/lib/validations";

function createSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || `san-pham-${Date.now()}`;
}

export async function GET(request: Request) {
  const admin = await isAdminRequest();
  if (!admin.ok) return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") || 50)));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, count, error } = await supabaseAdmin
    .from("products")
    .select("id,category_id,name,slug,image_url,price,duration,is_active,created_at,categories(name,category_type)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data, count, page, pageSize });
}

export async function POST(request: Request) {
  const admin = await isAdminRequest();
  if (!admin.ok) return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  const body = productSchema.parse(await request.json());
  const slug = body.slug || `${createSlug(body.name)}-${Date.now()}`;
  const { data, error } = await supabaseAdmin.from("products").insert({ ...body, slug }).select("*").single();
  if (error && error.code === "23502") {
    return NextResponse.json({ error: "Thiếu dữ liệu sản phẩm" }, { status: 400 });
  }
  if (error && error.code === "23505") {
    const retry = await supabaseAdmin.from("products").insert({ ...body, slug: `${slug}-${Date.now()}` }).select("*").single();
    if (retry.error) return NextResponse.json({ error: retry.error.message }, { status: 400 });
    await Promise.all([bumpCacheVersion("products"), bumpCacheVersion("admin-dashboard")]);
    return NextResponse.json(retry.data);
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await Promise.all([bumpCacheVersion("products"), bumpCacheVersion("admin-dashboard")]);
  return NextResponse.json(data);
}
