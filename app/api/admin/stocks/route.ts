import { NextResponse } from "next/server";
import { encryptText, decryptText } from "@/lib/encryption";
import { isAdminRequest } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { maskUsername } from "@/lib/utils";
import { stockImportSchema, stockSchema } from "@/lib/validations";

export async function GET(request: Request) {
  const admin = await isAdminRequest();
  if (!admin.ok) return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") || 50)));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  let query = supabaseAdmin
    .from("stock_items")
    .select("id,product_id,username_encrypted,duration,status,used_at,created_at,products(name)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);
  if (searchParams.get("product_id")) query = query.eq("product_id", searchParams.get("product_id"));
  if (searchParams.get("status")) query = query.eq("status", searchParams.get("status"));
  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({
    data: (data || []).map((item: any) => ({ ...item, username_masked: maskUsername(decryptText(item.username_encrypted)), username_encrypted: undefined })),
    count,
    page,
    pageSize
  });
}

export async function POST(request: Request) {
  try {
    const admin = await isAdminRequest();
    if (!admin.ok) return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
    const json = await request.json();
    const rows = [];
    if (json.lines) {
      const body = stockImportSchema.parse(json);
      for (const line of body.lines.split(/\r?\n/).map((x) => x.trim()).filter(Boolean)) {
        const [username, password, note = ""] = line.split("|");
        if (username && password) rows.push({ product_id: body.product_id, username, password, note, duration: body.duration });
      }
    } else {
      rows.push(stockSchema.parse(json));
    }
    if (!rows.length) return NextResponse.json({ error: "Không có dòng tài khoản hợp lệ" }, { status: 400 });
    const encryptedRows = rows.map((row) => ({
      product_id: row.product_id,
      username_encrypted: encryptText(row.username),
      password_encrypted: encryptText(row.password),
      note_encrypted: encryptText(row.note),
      duration: row.duration,
      status: "AVAILABLE"
    }));
    const { data, error } = await supabaseAdmin.from("stock_items").insert(encryptedRows).select("id");
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Không thêm được kho tài khoản" }, { status: 400 });
  }
}
