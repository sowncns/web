import { CategoryForm } from "@/components/AdminManagers";
import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function AdminCategoriesPage() {
  const { data: categoriesData } = await supabaseAdmin.from("categories").select("*").order("name");
  const categories = categoriesData ?? [];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Quản lý danh mục</h1>
      <CategoryForm />
      <div className="grid gap-3 md:grid-cols-2">{categories.map((c: any) => <div key={c.id} className="rounded-lg border bg-white p-4"><strong>{c.name}</strong><p className="text-sm text-muted-foreground">{c.slug}</p></div>)}</div>
    </div>
  );
}
