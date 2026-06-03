import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminRequest } from "@/lib/auth";
import { getNotificationSettings, saveNotificationSettings } from "@/lib/admin-notifications";

const settingsSchema = z.object({
  order_email_enabled: z.boolean(),
  smtp_host: z.string().trim().min(1).default("smtp.gmail.com"),
  smtp_port: z.coerce.number().int().min(1).max(65535).default(587),
  smtp_secure: z.boolean(),
  smtp_user: z.string().trim().email("Email SMTP không hợp lệ"),
  smtp_password: z.string().optional(),
  mail_from: z.string().trim().email("Email gửi không hợp lệ"),
  admin_email: z.string().trim().email("Email admin không hợp lệ")
});

export async function GET() {
  const admin = await isAdminRequest();
  if (!admin.ok) return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  try {
    const settings = await getNotificationSettings();
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Không tải được cấu hình" }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const admin = await isAdminRequest();
  if (!admin.ok) return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  try {
    const body = settingsSchema.parse(await request.json());
    const settings = await saveNotificationSettings(body);
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Không lưu được cấu hình" }, { status: 400 });
  }
}
