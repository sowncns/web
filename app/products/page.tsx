import { ProductFilter } from "@/components/ProductFilter";
import { ProductGrid } from "@/components/ProductGrid";
import { createClient } from "@/lib/supabase/server";

export default async function ProductsPage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const supabase = createClient();
  const { data: categoriesData } = await supabase.from("categories").select("*").order("name");
  const categories = categoriesData ?? [];
  let query = supabase.from("products").select("*, categories(slug)").eq("is_active", true);
  if (searchParams.search) query = query.ilike("name", `%${searchParams.search}%`);
  if (searchParams.category) query = query.eq("categories.slug", searchParams.category);
  if (searchParams.sort === "price_asc") query = query.order("price", { ascending: true });
  if (searchParams.sort === "price_desc") query = query.order("price", { ascending: false });
  const { data: productsData } = await query;
  const products = productsData ?? [];

  return (
    <div className="container-page py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Sản phẩm</h1>
        <p className="text-muted-foreground">Chọn gói dịch vụ số phù hợp nhu cầu của bạn.</p>
      </div>
      <ProductFilter categories={categories as any} />
      <div className="mt-6"><ProductGrid products={products as any} /></div>
    </div>
  );
}
