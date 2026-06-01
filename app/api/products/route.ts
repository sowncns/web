import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSize = Math.min(60, Math.max(1, Number(searchParams.get("pageSize") || 24)));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const supabase = createClient();
  let query = supabase
    .from("products")
    .select("id,name,slug,image_url,price,duration,is_active,categories!inner(slug,name,category_type)", { count: "exact" })
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .range(from, to);
  const search = searchParams.get("search");
  const category = searchParams.get("category");
  const sort = searchParams.get("sort");
  if (search) query = query.ilike("name", `%${search}%`);
  if (category) query = query.eq("categories.slug", category);
  if (sort === "price_asc") query = query.order("price", { ascending: true });
  if (sort === "price_desc") query = query.order("price", { ascending: false });
  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data, count, page, pageSize });
}
