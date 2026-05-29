import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().min(2, "Vui lòng nhập họ tên"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().min(8, "Số điện thoại không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
  confirmPassword: z.string().min(6, "Vui lòng xác nhận mật khẩu")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"]
});

export const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu")
});

export const customerSchema = z.object({
  customerName: z.string().min(2, "Vui lòng nhập họ tên"),
  customerEmail: z.string().email("Email không hợp lệ"),
  customerPhone: z.string().min(8, "Số điện thoại không hợp lệ"),
  note: z.string().optional().default("")
});

export const createPaymentSchema = customerSchema.extend({
  productId: z.string().uuid("Sản phẩm không hợp lệ"),
  quantity: z.coerce.number().int().min(1).max(10)
});

export const createTopupPaymentSchema = z.object({
  amount: z.coerce.number().int().refine((value) => [5000, 10000, 20000, 50000, 100000, 250000, 500000, 1000000, 2000000, 5000000].includes(value), {
    message: "Số tiền nạp không hợp lệ"
  })
});

export const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  category_id: z.string().uuid().nullable().optional(),
  description: z.string().nullable().optional(),
  image_url: z.string().url().nullable().optional().or(z.literal("")),
  price: z.coerce.number().positive(),
  duration: z.string().nullable().optional(),
  warranty_policy: z.string().nullable().optional(),
  delivery_guide: z.string().nullable().optional(),
  is_active: z.boolean().default(true)
});

export const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2)
});

export const stockSchema = z.object({
  product_id: z.string().uuid(),
  username: z.string().min(1),
  password: z.string().min(1),
  note: z.string().optional().default(""),
  duration: z.string().optional().default("")
});

export const stockImportSchema = z.object({
  product_id: z.string().uuid(),
  duration: z.string().optional().default(""),
  lines: z.string().min(3)
});

export const manualDeliverySchema = z.object({
  action: z.literal("manual_delivery"),
  username: z.string().min(1),
  password: z.string().min(1),
  note: z.string().optional().default("")
});

export const orderPatchSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("update_status"), order_status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"]) }),
  z.object({ action: z.literal("auto_delivery") }),
  manualDeliverySchema
]);

export const ticketSchema = z.object({
  order_id: z.string().uuid().nullable().optional(),
  title: z.string().min(3),
  message: z.string().min(5)
});

export const ticketReplySchema = z.object({
  message: z.string().min(2),
  close: z.boolean().optional().default(false)
});
