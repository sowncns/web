import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
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

export async function GET() {
  const admin = await isAdminRequest();
  if (!admin.ok) return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  const { data, error } = await supabaseAdmin.from("products").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
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
    return NextResponse.json(retry.data);
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
