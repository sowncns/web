import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { categorySchema } from "@/lib/validations";

function categoryTypeSchemaError(message?: string) {
  return message?.includes("category_type") && message?.includes("schema cache");
}

export async function GET() {
  const admin = await isAdminRequest();
  if (!admin.ok) return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  const { data } = await supabaseAdmin.from("categories").select("*").order("name");
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const admin = await isAdminRequest();
  if (!admin.ok) return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  const body = categorySchema.parse(await request.json());
  const { data, error } = await supabaseAdmin.from("categories").insert(body).select("*").single();
  if (categoryTypeSchemaError(error?.message)) {
    return NextResponse.json({ error: "Database Supabase chưa có cột category_type hoặc schema cache chưa reload. Hãy chạy migration SQL rồi reload schema cache." }, { status: 400 });
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
