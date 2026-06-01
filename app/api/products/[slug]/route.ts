import { NextResponse } from "next/server";
import { cacheRemember, createCacheKey, getCacheVersion } from "@/lib/cache";
import { createClient } from "@/lib/supabase/server";

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const supabase = createClient();
  const productsVersion = await getCacheVersion("products");
  const data = await cacheRemember(
    createCacheKey(["api-product-detail", productsVersion, params.slug]),
    { ttl: 120 },
    async () => {
      const result = await supabase
        .from("products")
        .select("id,name,slug,description,image_url,price,duration,warranty_policy,delivery_guide,categories(id,name,slug,category_type)")
        .eq("slug", params.slug)
        .eq("is_active", true)
        .single();
      if (result.error) return null;
      return result.data;
    }
  );
  if (!data) return NextResponse.json({ error: "Không tìm thấy sản phẩm" }, { status: 404 });
  return NextResponse.json(data);
}
