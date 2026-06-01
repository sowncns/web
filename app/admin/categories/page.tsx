import { CategoryForm, CategoryRowActions } from "@/components/AdminManagers";
import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function AdminCategoriesPage() {
  const { data: categoriesData } = await supabaseAdmin.from("categories").select("*").order("name");
  const categories = categoriesData ?? [];
  const accountCategories = categories.filter((category: any) => (category.category_type || "ACCOUNT") === "ACCOUNT");
  const templateCategories = categories.filter((category: any) => category.category_type === "TEMPLATE");

  function CategorySection({ title, items }: { title: string; items: any[] }) {
    return (
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-bold text-slate-950">{title}</h2>
          <p className="text-sm text-muted-foreground">{items.length} danh mục</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((c: any) => (
            <div key={c.id} className="space-y-4 rounded-lg border bg-white p-4">
              <div>
                <strong>{c.name}</strong>
                <p className="text-sm text-muted-foreground">{c.slug}</p>
              </div>
              <CategoryRowActions category={c} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Quản lý danh mục</h1>
      <CategoryForm />
      <CategorySection title="Danh mục tài khoản / license" items={accountCategories} />
      <CategorySection title="Danh mục template website" items={templateCategories} />
    </div>
  );
}
