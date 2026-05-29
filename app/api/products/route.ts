import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const supabase = createClient();
  let query = supabase.from("products").select("*, categories(slug,name)").eq("is_active", true);
  const search = searchParams.get("search");
  const category = searchParams.get("category");
  const sort = searchParams.get("sort");
  if (search) query = query.ilike("name", `%${search}%`);
  if (category) query = query.eq("categories.slug", category);
  if (sort === "price_asc") query = query.order("price", { ascending: true });
  if (sort === "price_desc") query = query.order("price", { ascending: false });
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
