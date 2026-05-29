import { NextResponse } from "next/server";
import { encryptText, decryptText } from "@/lib/encryption";
import { isAdminRequest } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { maskUsername } from "@/lib/utils";
import { stockImportSchema, stockSchema } from "@/lib/validations";

export async function GET() {
  const admin = await isAdminRequest();
  if (!admin.ok) return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  const { data, error } = await supabaseAdmin.from("stock_items").select("*, products(name)").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json((data || []).map((item: any) => ({ ...item, username_masked: maskUsername(decryptText(item.username_encrypted)), password_encrypted: undefined })));
}

export async function POST(request: Request) {
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
}
