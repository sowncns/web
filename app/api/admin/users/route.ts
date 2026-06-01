import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const admin = await isAdminRequest();
  if (!admin.ok) return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") || 50)));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, count, error } = await supabaseAdmin
    .from("profiles")
    .select("id,username,full_name,role,status,created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data, count, page, pageSize });
}
