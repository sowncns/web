import { ProductFilter } from "@/components/ProductFilter";
import { ProductGrid } from "@/components/ProductGrid";
import { Pagination } from "@/components/Pagination";
import { cacheRemember, createCacheKey, getCacheVersion } from "@/lib/cache";
import { createClient } from "@/lib/supabase/server";

export default async function ProductsPage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const supabase = createClient();
  const page = Math.max(1, Number(searchParams.page || 1));
  const pageSize = 24;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const productKind = searchParams.type === "template" ? "TEMPLATE" : "ACCOUNT";
  const isTemplatePage = productKind === "TEMPLATE";
  const [productsVersion, categoriesVersion] = await Promise.all([getCacheVersion("products"), getCacheVersion("categories")]);
  const categories = await cacheRemember(
    createCacheKey(["categories", categoriesVersion, productKind]),
    { ttl: 300 },
    async () => {
      const { data } = await supabase
        .from("categories")
        .select("id,name,slug,category_type")
        .eq("category_type", productKind)
        .order("name");
      return data ?? [];
    }
  );
  const productResult = await cacheRemember(
    createCacheKey(["products-page", productsVersion, productKind, searchParams.search, searchParams.category, searchParams.sort, page, pageSize]),
    { ttl: 60 },
    async () => {
      let query = supabase
        .from("products")
        .select("id,name,slug,image_url,price,duration,is_active,categories!inner(slug,category_type)", { count: "exact" })
        .eq("is_active", true)
        .eq("categories.category_type", productKind)
        .range(from, to);
      if (searchParams.search) query = query.ilike("name", `%${searchParams.search}%`);
      if (searchParams.category) query = query.eq("categories.slug", searchParams.category);
      if (searchParams.sort === "price_asc") query = query.order("price", { ascending: true });
      if (searchParams.sort === "price_desc") query = query.order("price", { ascending: false });
      if (!searchParams.sort) query = query.order("created_at", { ascending: false });
      const { data, count } = await query;
      return { products: data ?? [], count };
    }
  );
  const products = productResult.products;
  const count = productResult.count;

  return (
    <div className="container-page py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{isTemplatePage ? "Template landing page" : "Tài khoản"}</h1>
        <p className="text-muted-foreground">{isTemplatePage ? "Chọn mẫu website theo ngành: khóa học, nhà hàng, shop quần áo và nhiều loại khác." : "Chọn tài khoản hoặc gói dịch vụ số phù hợp nhu cầu của bạn."}</p>
      </div>
      <ProductFilter categories={categories as any} />
      <div className="mt-6"><ProductGrid products={products as any} /></div>
      <div className="mt-6">
        <Pagination basePath="/products" page={page} pageSize={pageSize} total={count} searchParams={searchParams} />
      </div>
    </div>
  );
}
