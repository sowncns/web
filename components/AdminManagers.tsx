"use client";

import { type ReactNode, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Pencil, Trash2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

async function send(url: string, method: string, body: unknown) {
  const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Thao tác thất bại");
  return data;
}

function LoadingIcon() {
  return <Loader2 className="h-4 w-4 animate-spin" />;
}

function SubmitButton({ children, loadingLabel = "Đang lưu", variant, size, className }: Pick<ButtonProps, "variant" | "size" | "className"> & { children: ReactNode; loadingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={variant} size={size} className={className} disabled={pending}>
      {pending ? <><LoadingIcon /> {loadingLabel}</> : children}
    </Button>
  );
}

function createSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || `san-pham-${Date.now()}`;
}

function readImageFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    if (!file.size) return resolve("");
    if (!file.type.startsWith("image/")) return reject(new Error("Vui lòng chọn file ảnh"));
    if (file.size > 1_500_000) return reject(new Error("Ảnh quá lớn, vui lòng chọn ảnh dưới 1.5MB"));
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Không đọc được file ảnh"));
    reader.readAsDataURL(file);
  });
}

export function ProductForm({ categories, product }: { categories: any[]; product?: any }) {
  const router = useRouter();
  const accountCategories = categories.filter((category) => (category.category_type || "ACCOUNT") === "ACCOUNT");
  const templateCategories = categories.filter((category) => category.category_type === "TEMPLATE");
  const initialCategory = categories.find((category) => category.id === product?.category_id);
  const [selectedCategoryType, setSelectedCategoryType] = useState(initialCategory?.category_type || "ACCOUNT");
  const isTemplate = selectedCategoryType === "TEMPLATE";
  async function submit(formData: FormData) {
    try {
      const form = product ? null : document.querySelector<HTMLFormElement>("[data-product-create-form='true']");
      const name = String(formData.get("name") || "");
      const imageFile = formData.get("image_file");
      const imageUrl = imageFile instanceof File && imageFile.size ? await readImageFile(imageFile) : product?.image_url || "";
      await send(product ? `/api/admin/products/${product.id}` : "/api/admin/products", product ? "PATCH" : "POST", {
        name,
        slug: product?.slug || `${createSlug(name)}-${Date.now()}`,
        category_id: formData.get("category_id") || null,
        description: formData.get("description"),
        image_url: imageUrl,
        price: formData.get("price"),
        duration: formData.get("duration"),
        warranty_policy: formData.get("warranty_policy"),
        delivery_guide: formData.get("delivery_guide"),
        is_active: formData.get("is_active") === "on"
      });
      toast.success("Đã lưu sản phẩm");
      form?.reset();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không lưu được");
    }
  }
  return (
    <form action={submit} data-product-create-form={!product ? "true" : undefined} className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-2">
      <div className="space-y-1"><Label>Tên</Label><Input name="name" defaultValue={product?.name} required /></div>
      <div className="space-y-1">
        <Label>Danh mục</Label>
        <select
          name="category_id"
          defaultValue={product?.category_id || ""}
          className="h-10 w-full rounded-md border-input text-sm"
          onChange={(event) => {
            const category = categories.find((item) => item.id === event.target.value);
            setSelectedCategoryType(category?.category_type || "ACCOUNT");
          }}
        >
          <option value="">Chọn danh mục</option>
          <optgroup label="Tài khoản / license">
            {accountCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </optgroup>
          <optgroup label="Template website">
            {templateCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </optgroup>
        </select>
      </div>
      <div className="space-y-1"><Label>Giá</Label><Input name="price" type="number" defaultValue={product?.price} required /></div>
      <div className="space-y-1"><Label>Thời hạn</Label><Input name="duration" defaultValue={product?.duration} /></div>
      <div className="space-y-1">
        <Label>Ảnh sản phẩm</Label>
        <Input name="image_file" type="file" accept="image/*" />
        {product?.image_url ? <p className="text-xs text-muted-foreground">Đang có ảnh. Chọn file mới nếu muốn thay đổi.</p> : null}
      </div>
      <div className="space-y-1 md:col-span-2">
        <Label>{isTemplate ? "Ảnh preview template" : "Mô tả"}</Label>
        <Textarea
          name="description"
          defaultValue={product?.description}
          placeholder={isTemplate ? "Dán link ảnh preview, mỗi dòng một ảnh" : "Nhập mô tả sản phẩm"}
        />
      </div>
      <div className="space-y-1"><Label>{isTemplate ? "License sử dụng" : "Bảo hành"}</Label><Textarea name="warranty_policy" defaultValue={product?.warranty_policy} /></div>
      <div className="space-y-1"><Label>Hướng dẫn nhận hàng / tải file</Label><Textarea name="delivery_guide" defaultValue={product?.delivery_guide} /></div>
      <label className="flex items-center gap-2 text-sm"><input name="is_active" type="checkbox" defaultChecked={product?.is_active ?? true} /> Đang bán</label>
      <SubmitButton loadingLabel={product ? "Đang cập nhật" : "Đang thêm"}>{product ? "Cập nhật" : "Thêm sản phẩm"}</SubmitButton>
    </form>
  );
}

export function CategoryForm({ category }: { category?: any }) {
  const router = useRouter();
  async function submit(formData: FormData) {
    try {
      await send(category ? `/api/admin/categories/${category.id}` : "/api/admin/categories", category ? "PATCH" : "POST", {
        name: formData.get("name"),
        slug: formData.get("slug"),
        category_type: formData.get("category_type")
      });
      toast.success("Đã lưu danh mục");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không lưu được");
    }
  }
  return (
    <form action={submit} className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-[1fr_1fr_180px_auto]">
      <Input name="name" placeholder="Tên danh mục" defaultValue={category?.name} required />
      <Input name="slug" placeholder="slug" defaultValue={category?.slug} required />
      <select name="category_type" defaultValue={category?.category_type || "ACCOUNT"} className="h-10 rounded-md border-input text-sm">
        <option value="ACCOUNT">Tài khoản</option>
        <option value="TEMPLATE">Template</option>
      </select>
      <SubmitButton loadingLabel={category ? "Đang cập nhật" : "Đang thêm"}>{category ? "Cập nhật" : "Thêm"}</SubmitButton>
    </form>
  );
}

function toDatetimeLocal(value: string | null | undefined) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 16);
}

export function VoucherForm({ voucher }: { voucher?: any }) {
  const router = useRouter();
  async function submit(formData: FormData) {
    try {
      await send(voucher ? `/api/admin/vouchers/${voucher.id}` : "/api/admin/vouchers", voucher ? "PATCH" : "POST", {
        code: formData.get("code"),
        description: formData.get("description"),
        discount_type: formData.get("discount_type"),
        discount_value: formData.get("discount_value"),
        min_order_amount: formData.get("min_order_amount") || 0,
        max_uses: formData.get("max_uses") ? Number(formData.get("max_uses")) : null,
        starts_at: formData.get("starts_at") ? new Date(String(formData.get("starts_at"))).toISOString() : null,
        expires_at: formData.get("expires_at") ? new Date(String(formData.get("expires_at"))).toISOString() : null,
        is_active: formData.get("is_active") === "on"
      });
      toast.success("Đã lưu voucher");
      if (!voucher) {
        const form = document.querySelector<HTMLFormElement>("[data-voucher-create-form='true']");
        form?.reset();
      }
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không lưu được voucher");
    }
  }
  return (
    <form action={submit} data-voucher-create-form={!voucher ? "true" : undefined} className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-2 xl:grid-cols-4">
      <div className="space-y-1">
        <Label>Mã voucher</Label>
        <Input name="code" defaultValue={voucher?.code} placeholder="SALE10" required />
      </div>
      <div className="space-y-1">
        <Label>Loại giảm</Label>
        <select name="discount_type" defaultValue={voucher?.discount_type || "PERCENT"} className="h-10 w-full rounded-md border-input text-sm">
          <option value="PERCENT">Theo phần trăm</option>
          <option value="FIXED">Theo số tiền</option>
        </select>
      </div>
      <div className="space-y-1">
        <Label>Giá trị giảm</Label>
        <Input name="discount_value" type="number" min={1} defaultValue={voucher?.discount_value} placeholder="10 hoặc 50000" required />
      </div>
      <div className="space-y-1">
        <Label>Đơn tối thiểu</Label>
        <Input name="min_order_amount" type="number" min={0} defaultValue={voucher?.min_order_amount || 0} />
      </div>
      <div className="space-y-1">
        <Label>Giới hạn lượt</Label>
        <Input name="max_uses" type="number" min={1} defaultValue={voucher?.max_uses || ""} placeholder="Để trống nếu không giới hạn" />
      </div>
      <div className="space-y-1">
        <Label>Bắt đầu</Label>
        <Input name="starts_at" type="datetime-local" defaultValue={toDatetimeLocal(voucher?.starts_at)} />
      </div>
      <div className="space-y-1">
        <Label>Hết hạn</Label>
        <Input name="expires_at" type="datetime-local" defaultValue={toDatetimeLocal(voucher?.expires_at)} />
      </div>
      <div className="space-y-1">
        <Label>Mô tả</Label>
        <Input name="description" defaultValue={voucher?.description || ""} placeholder="Ghi chú nội bộ" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input name="is_active" type="checkbox" defaultChecked={voucher?.is_active ?? true} /> Đang bật
      </label>
      <div className="md:col-span-2 xl:col-span-3">
        <SubmitButton loadingLabel={voucher ? "Đang cập nhật" : "Đang thêm"}>{voucher ? "Cập nhật voucher" : "Thêm voucher"}</SubmitButton>
      </div>
    </form>
  );
}

export function VoucherRowActions({ voucher }: { voucher: any }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [removing, setRemoving] = useState(false);

  async function toggleActive() {
    setToggling(true);
    try {
      await send(`/api/admin/vouchers/${voucher.id}`, "PATCH", { is_active: !voucher.is_active });
      toast.success(voucher.is_active ? "Đã tắt voucher" : "Đã bật voucher");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không cập nhật được voucher");
    } finally {
      setToggling(false);
    }
  }

  async function remove() {
    if (!confirm("Xóa voucher này?")) return;
    setRemoving(true);
    try {
      await fetch(`/api/admin/vouchers/${voucher.id}`, { method: "DELETE" }).then(async (res) => {
        if (!res.ok) throw new Error((await res.json()).error || "Không xóa được voucher");
      });
      toast.success("Đã xóa voucher");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không xóa được voucher");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen((value) => !value)}>
          <Pencil className="h-4 w-4" />
          {open ? "Đóng" : "Sửa"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={toggleActive} disabled={toggling || removing}>
          {toggling ? <LoadingIcon /> : voucher.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {toggling ? "Đang xử lý" : voucher.is_active ? "Tắt" : "Bật"}
        </Button>
        <Button type="button" variant="destructive" size="sm" onClick={remove} disabled={toggling || removing}>
          {removing ? <LoadingIcon /> : <Trash2 className="h-4 w-4" />}
          {removing ? "Đang xóa" : "Xóa"}
        </Button>
      </div>
      {open ? <VoucherForm voucher={voucher} /> : null}
    </div>
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
      <Textarea name="lines" placeholder="Import nhiều dòng: username|password|note hoặc link tải|mật khẩu giải nén|hướng dẫn" />
      <SubmitButton loadingLabel="Đang thêm">Thêm vào kho</SubmitButton>
    </form>
  );
}

export function StockRowActions({ stock, products }: { stock: any; products: any[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [removing, setRemoving] = useState(false);

  async function update(formData: FormData) {
    try {
      await send(`/api/admin/stocks/${stock.id}`, "PATCH", {
        product_id: formData.get("product_id"),
        username: formData.get("username"),
        password: formData.get("password"),
        note: formData.get("note"),
        duration: formData.get("duration"),
        status: formData.get("status")
      });
      toast.success("Đã cập nhật kho");
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không cập nhật được");
    }
  }

  async function remove() {
    if (!confirm("Xóa dòng kho này? Thao tác này không thể hoàn tác.")) return;
    setRemoving(true);
    try {
      await fetch(`/api/admin/stocks/${stock.id}`, { method: "DELETE" }).then(async (res) => {
        if (!res.ok) throw new Error((await res.json()).error || "Không xóa được");
      });
      toast.success("Đã xóa dòng kho");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không xóa được");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen((value) => !value)}>
          <Pencil className="h-4 w-4" />
          {open ? "Đóng" : "Sửa"}
        </Button>
        <Button type="button" variant="destructive" size="sm" onClick={remove} disabled={removing}>
          {removing ? <LoadingIcon /> : <Trash2 className="h-4 w-4" />}
          {removing ? "Đang xóa" : "Xóa"}
        </Button>
      </div>
      {open ? (
        <form action={update} className="grid min-w-[560px] gap-2 rounded-md border bg-slate-50 p-3">
          <select name="product_id" defaultValue={stock.product_id} className="h-9 rounded-md border-input text-sm">
            {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
          </select>
          <div className="grid gap-2 md:grid-cols-3">
            <Input name="username" defaultValue={stock.username} placeholder="tài khoản/link tải" required />
            <Input name="password" defaultValue={stock.password} placeholder="mật khẩu" required />
            <Input name="duration" defaultValue={stock.duration || ""} placeholder="thời hạn" />
          </div>
          <Textarea name="note" defaultValue={stock.note || ""} placeholder="ghi chú/hướng dẫn" />
          <div className="flex flex-wrap gap-2">
            <select name="status" defaultValue={stock.status} className="h-9 rounded-md border-input text-sm">
              <option value="AVAILABLE">Còn hàng</option>
              <option value="USED">Đã dùng</option>
              <option value="DISABLED">Đã tắt</option>
            </select>
            <SubmitButton size="sm" loadingLabel="Đang lưu">Lưu thay đổi</SubmitButton>
          </div>
        </form>
      ) : null}
    </div>
  );
}

export function OrderAdminActions({ orderId, quantity, productType = "ACCOUNT" }: { orderId: string; quantity: number; productType?: string }) {
  const router = useRouter();
  const [autoDelivering, setAutoDelivering] = useState(false);
  const isTemplate = productType === "TEMPLATE";
  const itemLabel = isTemplate ? "template" : "tài khoản";
  const neededQuantity = isTemplate ? 1 : quantity;
  const lineHelp = isTemplate ? "Dạng: link tải|mật khẩu giải nén|hướng dẫn/license." : "Dạng: username|password|ghi chú.";
  const exampleLines = Array.from({ length: Math.min(neededQuantity, 3) }, (_, index) => isTemplate ? `https://drive.google.com/file/d/template-${index + 1}|mat-khau-zip|Huong dan cai dat va license` : `username${index + 1}|password${index + 1}`).join("\n");
  async function autoDeliver() {
    setAutoDelivering(true);
    try {
      await send(`/api/admin/orders/${orderId}`, "PATCH", { action: "auto_delivery" });
      toast.success(`Đã cấp ${itemLabel} tự động`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không cấp được");
    } finally {
      setAutoDelivering(false);
    }
  }
  async function manual(formData: FormData) {
    try {
      await send(`/api/admin/orders/${orderId}`, "PATCH", { action: "manual_delivery", lines: formData.get("lines") });
      toast.success(`Đã cấp ${itemLabel} thủ công`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không cấp được");
    }
  }
  return (
    <div className="space-y-4 rounded-lg border bg-white p-4">
      <div className="rounded-md border border-sky-100 bg-sky-50 p-3 text-sm font-semibold text-sky-900">
        Đơn này cần cấp {neededQuantity} {itemLabel}. Khi nhập thủ công, vui lòng nhập đúng {neededQuantity} dòng.
      </div>
      <Button onClick={autoDeliver} disabled={autoDelivering}>
        {autoDelivering ? <><LoadingIcon /> Đang cấp</> : `Cấp ${itemLabel} tự động`}
      </Button>
      <form action={manual} className="space-y-3">
        <div className="space-y-1">
          <Label>Cấp thủ công nhiều {itemLabel}</Label>
          <Textarea name="lines" rows={Math.max(4, Math.min(neededQuantity + 1, 10))} placeholder={`Cần ${neededQuantity} dòng, mỗi dòng một ${itemLabel}:\n${exampleLines}${neededQuantity > 3 ? "\n..." : ""}`} required />
          <p className="text-xs text-muted-foreground">{lineHelp} Nếu bỏ trống ghi chú, hệ thống sẽ dùng ghi chú mặc định.</p>
        </div>
        <SubmitButton variant="secondary" loadingLabel="Đang cấp">Cấp {itemLabel} thủ công</SubmitButton>
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
      <select name="role" defaultValue={user.role} className="h-9 rounded-md border-input text-sm">
        <option value="USER">Người dùng</option>
        <option value="ADMIN">Quản trị</option>
      </select>
      <select name="status" defaultValue={user.status} className="h-9 rounded-md border-input text-sm">
        <option value="ACTIVE">Hoạt động</option>
        <option value="BANNED">Bị khóa</option>
      </select>
      <SubmitButton size="sm" loadingLabel="Đang lưu">Lưu</SubmitButton>
    </form>
  );
}

export function ProductRowActions({ product }: { product: any }) {
  const router = useRouter();
  const [toggling, setToggling] = useState(false);
  const [removing, setRemoving] = useState(false);

  async function toggleActive() {
    setToggling(true);
    try {
      await send(`/api/admin/products/${product.id}`, "PATCH", { is_active: !product.is_active });
      toast.success(product.is_active ? "Đã ẩn sản phẩm" : "Đã hiện sản phẩm");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không cập nhật được");
    } finally {
      setToggling(false);
    }
  }

  async function remove() {
    if (!confirm("Xóa sản phẩm này? Sản phẩm sẽ bị xóa khỏi hệ thống.")) return;
    setRemoving(true);
    try {
      await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" }).then(async (res) => {
        if (!res.ok) throw new Error((await res.json()).error || "Không xóa được");
      });
      toast.success("Đã xóa sản phẩm");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không xóa được");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="outline" size="sm" onClick={toggleActive} disabled={toggling || removing}>
        {toggling ? <LoadingIcon /> : product.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        {toggling ? "Đang xử lý" : product.is_active ? "Ẩn sản phẩm" : "Hiện sản phẩm"}
      </Button>
      <Button type="button" variant="destructive" size="sm" onClick={remove} disabled={toggling || removing}>
        {removing ? <LoadingIcon /> : <Trash2 className="h-4 w-4" />}
        {removing ? "Đang xóa" : "Xóa"}
      </Button>
    </div>
  );
}

export function ProductUpdatePanel({ product, categories }: { product: any; categories: any[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen((value) => !value)}>
          <Pencil className="h-4 w-4" />
          {open ? "Đóng cập nhật" : "Cập nhật"}
        </Button>
        <ProductRowActions product={product} />
      </div>
      {open ? <ProductForm categories={categories} product={product} /> : null}
    </div>
  );
}

export function CategoryRowActions({ category }: { category: any }) {
  const router = useRouter();
  const [removing, setRemoving] = useState(false);

  async function update(formData: FormData) {
    try {
      await send(`/api/admin/categories/${category.id}`, "PATCH", {
        name: formData.get("name"),
        slug: formData.get("slug"),
        category_type: formData.get("category_type")
      });
      toast.success("Đã cập nhật danh mục");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không cập nhật được");
    }
  }

  async function remove() {
    if (!confirm("Xóa danh mục này? Sản phẩm thuộc danh mục sẽ được bỏ danh mục.")) return;
    setRemoving(true);
    try {
      await fetch(`/api/admin/categories/${category.id}`, { method: "DELETE" }).then(async (res) => {
        if (!res.ok) throw new Error((await res.json()).error || "Không xóa được");
      });
      toast.success("Đã xóa danh mục");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không xóa được");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="space-y-3">
      <form action={update} className="grid gap-2 sm:grid-cols-[1fr_1fr_160px_auto]">
        <Input name="name" defaultValue={category.name} />
        <Input name="slug" defaultValue={category.slug} />
        <select name="category_type" defaultValue={category.category_type || "ACCOUNT"} className="h-9 rounded-md border-input text-sm">
          <option value="ACCOUNT">Tài khoản</option>
          <option value="TEMPLATE">Template</option>
        </select>
        <SubmitButton size="sm" loadingLabel="Đang cập nhật"><Pencil className="h-4 w-4" /> Cập nhật</SubmitButton>
      </form>
      <Button type="button" variant="destructive" size="sm" onClick={remove} disabled={removing}>
        {removing ? <LoadingIcon /> : <Trash2 className="h-4 w-4" />}
        {removing ? "Đang xóa" : "Xóa danh mục"}
      </Button>
    </div>
  );
}
