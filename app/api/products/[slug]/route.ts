import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data, error } = await supabase.from("products").select("*, categories(*)").eq("slug", params.slug).eq("is_active", true).single();
  if (error) return NextResponse.json({ error: "Không tìm thấy sản phẩm" }, { status: 404 });
  return NextResponse.json(data);
}
