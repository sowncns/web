"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

async function send(url: string, method: string, body: unknown) {
  const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Thao tác thất bại");
  return data;
}

export function ProductForm({ categories, product }: { categories: any[]; product?: any }) {
  const router = useRouter();
  async function submit(formData: FormData) {
    try {
      await send(product ? `/api/admin/products/${product.id}` : "/api/admin/products", product ? "PATCH" : "POST", {
        name: formData.get("name"),
        slug: formData.get("slug"),
        category_id: formData.get("category_id") || null,
        description: formData.get("description"),
        image_url: formData.get("image_url"),
        price: formData.get("price"),
        duration: formData.get("duration"),
        warranty_policy: formData.get("warranty_policy"),
        delivery_guide: formData.get("delivery_guide"),
        is_active: formData.get("is_active") === "on"
      });
      toast.success("Đã lưu sản phẩm");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không lưu được");
    }
  }
  return (
    <form action={submit} className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-2">
      <div className="space-y-1"><Label>Tên</Label><Input name="name" defaultValue={product?.name} required /></div>
      <div className="space-y-1"><Label>Slug</Label><Input name="slug" defaultValue={product?.slug} required /></div>
      <div className="space-y-1"><Label>Danh mục</Label><select name="category_id" defaultValue={product?.category_id || ""} className="h-10 w-full rounded-md border-input text-sm"><option value="">Chọn danh mục</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
      <div className="space-y-1"><Label>Giá</Label><Input name="price" type="number" defaultValue={product?.price} required /></div>
      <div className="space-y-1"><Label>Thời hạn</Label><Input name="duration" defaultValue={product?.duration} /></div>
      <div className="space-y-1"><Label>Image URL</Label><Input name="image_url" defaultValue={product?.image_url} /></div>
      <div className="space-y-1 md:col-span-2"><Label>Mô tả</Label><Textarea name="description" defaultValue={product?.description} /></div>
      <div className="space-y-1"><Label>Bảo hành</Label><Textarea name="warranty_policy" defaultValue={product?.warranty_policy} /></div>
      <div className="space-y-1"><Label>Hướng dẫn nhận hàng</Label><Textarea name="delivery_guide" defaultValue={product?.delivery_guide} /></div>
      <label className="flex items-center gap-2 text-sm"><input name="is_active" type="checkbox" defaultChecked={product?.is_active ?? true} /> Đang bán</label>
      <Button>{product ? "Cập nhật" : "Thêm sản phẩm"}</Button>
    </form>
  );
}

export function CategoryForm({ category }: { category?: any }) {
  const router = useRouter();
  async function submit(formData: FormData) {
    try {
      await send(category ? `/api/admin/categories/${category.id}` : "/api/admin/categories", category ? "PATCH" : "POST", {
        name: formData.get("name"),
        slug: formData.get("slug")
      });
      toast.success("Đã lưu danh mục");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không lưu được");
    }
  }
  return (
    <form action={submit} className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-[1fr_1fr_auto]">
      <Input name="name" placeholder="Tên danh mục" defaultValue={category?.name} required />
      <Input name="slug" placeholder="slug" defaultValue={category?.slug} required />
      <Button>{category ? "Cập nhật" : "Thêm"}</Button>
    </form>
  );
}

export function StockForm({ products }: { products: any[] }) {
  const router = useRouter();
  async function submit(formData: FormData) {
    try {
      const lines = String(formData.get("lines") || "");
      if (lines.trim()) {
        await send("/api/admin/stocks", "POST", { product_id: formData.get("product_id"), duration: formData.get("duration"), lines });
      } else {
        await send("/api/admin/stocks", "POST", {
          product_id: formData.get("product_id"),
          username: formData.get("username"),
          password: formData.get("password"),
          note: formData.get("note"),
          duration: formData.get("duration")
        });
      }
      toast.success("Đã thêm kho tài khoản");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thêm được");
    }
  }
  return (
    <form action={submit} className="space-y-3 rounded-lg border bg-white p-4">
      <select name="product_id" className="h-10 w-full rounded-md border-input text-sm" required>{products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
      <Input name="duration" placeholder="Thời hạn" />
      <div className="grid gap-3 md:grid-cols-3"><Input name="username" placeholder="username/email" /><Input name="password" placeholder="password" /><Input name="note" placeholder="ghi chú" /></div>
      <Textarea name="lines" placeholder="Import nhiều dòng: username|password|note" />
      <Button>Thêm vào kho</Button>
    </form>
  );
}

export function OrderAdminActions({ orderId }: { orderId: string }) {
  const router = useRouter();
  async function autoDeliver() {
    try {
      await send(`/api/admin/orders/${orderId}`, "PATCH", { action: "auto_delivery" });
      toast.success("Đã cấp tài khoản tự động");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không cấp được");
    }
  }
  async function manual(formData: FormData) {
    try {
      await send(`/api/admin/orders/${orderId}`, "PATCH", { action: "manual_delivery", username: formData.get("username"), password: formData.get("password"), note: formData.get("note") });
      toast.success("Đã cấp tài khoản thủ công");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không cấp được");
    }
  }
  return (
    <div className="space-y-4 rounded-lg border bg-white p-4">
      <Button onClick={autoDeliver}>Cấp tài khoản tự động</Button>
      <form action={manual} className="grid gap-3 md:grid-cols-3">
        <Input name="username" placeholder="Tài khoản" required />
        <Input name="password" placeholder="Mật khẩu" required />
        <Input name="note" placeholder="Ghi chú" />
        <Button variant="secondary">Cấp tài khoản thủ công</Button>
      </form>
    </div>
  );
}

export function UserPatchForm({ user }: { user: any }) {
  const router = useRouter();
  async function submit(formData: FormData) {
    try {
      await send(`/api/admin/users/${user.id}`, "PATCH", { role: formData.get("role"), status: formData.get("status") });
      toast.success("Đã cập nhật user");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không cập nhật được");
    }
  }
  return (
    <form action={submit} className="flex gap-2">
      <select name="role" defaultValue={user.role} className="h-9 rounded-md border-input text-sm"><option>USER</option><option>ADMIN</option></select>
      <select name="status" defaultValue={user.status} className="h-9 rounded-md border-input text-sm"><option>ACTIVE</option><option>BANNED</option></select>
      <Button size="sm">Lưu</Button>
    </form>
  );
}

export function AdminTicketReply({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  async function submit(formData: FormData) {
    try {
      await send(`/api/admin/tickets/${ticketId}`, "PATCH", { message: formData.get("message"), close: formData.get("close") === "on" });
      toast.success("Đã phản hồi ticket");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không gửi được");
    }
  }
  return (
    <form action={submit} className="mt-4 space-y-3 rounded-lg border bg-white p-4">
      <Textarea name="message" placeholder="Phản hồi của admin" />
      <label className="flex items-center gap-2 text-sm"><input name="close" type="checkbox" /> Đóng ticket</label>
      <Button>Gửi phản hồi</Button>
    </form>
  );
}

export function ProductRowActions({ product, categories }: { product: any; categories: any[] }) {
  const router = useRouter();

  async function update(formData: FormData) {
    try {
      await send(`/api/admin/products/${product.id}`, "PATCH", {
        name: formData.get("name"),
        slug: formData.get("slug"),
        category_id: formData.get("category_id") || null,
        price: formData.get("price"),
        duration: formData.get("duration"),
        image_url: product.image_url || "",
        description: product.description || "",
        warranty_policy: product.warranty_policy || "",
        delivery_guide: product.delivery_guide || "",
        is_active: product.is_active
      });
      toast.success("Đã cập nhật sản phẩm");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không cập nhật được");
    }
  }

  async function toggleActive() {
    try {
      await send(`/api/admin/products/${product.id}`, "PATCH", { is_active: !product.is_active });
      toast.success(product.is_active ? "Đã ẩn sản phẩm" : "Đã hiện sản phẩm");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không cập nhật được");
    }
  }

  async function remove() {
    if (!confirm("Xóa/ẩn sản phẩm này? Sản phẩm sẽ không hiển thị cho khách.")) return;
    try {
      await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" }).then(async (res) => {
        if (!res.ok) throw new Error((await res.json()).error || "Không xóa được");
      });
      toast.success("Đã ẩn sản phẩm");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không xóa được");
    }
  }

  return (
    <div className="space-y-3">
      <form action={update} className="grid min-w-[520px] gap-2 md:grid-cols-[1.2fr_1fr_1fr_.8fr_.8fr_auto]">
        <Input name="name" defaultValue={product.name} />
        <Input name="slug" defaultValue={product.slug} />
        <select name="category_id" defaultValue={product.category_id || ""} className="h-9 rounded-md border-input text-sm">
          <option value="">Không danh mục</option>
          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
        <Input name="price" type="number" defaultValue={product.price} />
        <Input name="duration" defaultValue={product.duration || ""} />
        <Button size="sm"><Pencil className="h-4 w-4" /> Cập nhật</Button>
      </form>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={toggleActive}>
          {product.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {product.is_active ? "Ẩn sản phẩm" : "Hiện sản phẩm"}
        </Button>
        <Button type="button" variant="destructive" size="sm" onClick={remove}>
          <Trash2 className="h-4 w-4" />
          Xóa
        </Button>
      </div>
    </div>
  );
}

export function CategoryRowActions({ category }: { category: any }) {
  const router = useRouter();

  async function update(formData: FormData) {
    try {
      await send(`/api/admin/categories/${category.id}`, "PATCH", {
        name: formData.get("name"),
        slug: formData.get("slug")
      });
      toast.success("Đã cập nhật danh mục");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không cập nhật được");
    }
  }

  async function remove() {
    if (!confirm("Xóa danh mục này? Sản phẩm thuộc danh mục sẽ được bỏ danh mục.")) return;
    try {
      await fetch(`/api/admin/categories/${category.id}`, { method: "DELETE" }).then(async (res) => {
        if (!res.ok) throw new Error((await res.json()).error || "Không xóa được");
      });
      toast.success("Đã xóa danh mục");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không xóa được");
    }
  }

  return (
    <div className="space-y-3">
      <form action={update} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <Input name="name" defaultValue={category.name} />
        <Input name="slug" defaultValue={category.slug} />
        <Button size="sm"><Pencil className="h-4 w-4" /> Cập nhật</Button>
      </form>
      <Button type="button" variant="destructive" size="sm" onClick={remove}>
        <Trash2 className="h-4 w-4" />
        Xóa danh mục
      </Button>
    </div>
  );
}
