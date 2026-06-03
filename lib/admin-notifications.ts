import nodemailer from "nodemailer";
import { decryptText, encryptText } from "@/lib/encryption";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatCurrency, formatDate } from "@/lib/utils";

export type NotificationSettingsInput = {
  order_email_enabled: boolean;
  smtp_host: string;
  smtp_port: number;
  smtp_secure: boolean;
  smtp_user: string;
  smtp_password?: string;
  mail_from: string;
  admin_email: string;
};

export type NotificationSettings = NotificationSettingsInput & {
  has_smtp_password: boolean;
};

const SETTINGS_ID = 1;

const defaultSettings: NotificationSettings = {
  order_email_enabled: false,
  smtp_host: "smtp.gmail.com",
  smtp_port: 587,
  smtp_secure: false,
  smtp_user: "",
  mail_from: "",
  admin_email: "",
  has_smtp_password: false
};

function normalizeSettings(row: any): NotificationSettings {
  if (!row) return defaultSettings;
  return {
    order_email_enabled: Boolean(row.order_email_enabled),
    smtp_host: row.smtp_host || "smtp.gmail.com",
    smtp_port: Number(row.smtp_port || 587),
    smtp_secure: Boolean(row.smtp_secure),
    smtp_user: row.smtp_user || "",
    mail_from: row.mail_from || row.smtp_user || "",
    admin_email: row.admin_email || "",
    has_smtp_password: Boolean(row.smtp_password_encrypted)
  };
}

export async function getNotificationSettings() {
  const { data, error } = await supabaseAdmin
    .from("site_settings")
    .select("*")
    .eq("id", SETTINGS_ID)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return normalizeSettings(data);
}

export async function saveNotificationSettings(input: NotificationSettingsInput) {
  const existing = await getNotificationSettings();
  const payload: Record<string, unknown> = {
    id: SETTINGS_ID,
    order_email_enabled: input.order_email_enabled,
    smtp_host: input.smtp_host,
    smtp_port: input.smtp_port,
    smtp_secure: input.smtp_secure,
    smtp_user: input.smtp_user,
    mail_from: input.mail_from || input.smtp_user,
    admin_email: input.admin_email,
    updated_at: new Date().toISOString()
  };
  if (input.smtp_password) payload.smtp_password_encrypted = encryptText(input.smtp_password);
  if (!input.smtp_password && !existing.has_smtp_password) payload.smtp_password_encrypted = null;

  const { error } = await supabaseAdmin.from("site_settings").upsert(payload, { onConflict: "id" });
  if (error) throw new Error(error.message);
  return getNotificationSettings();
}

async function getSmtpConfig() {
  const { data, error } = await supabaseAdmin
    .from("site_settings")
    .select("*")
    .eq("id", SETTINGS_ID)
    .maybeSingle();
  if (error || !data?.order_email_enabled) return null;
  const password = decryptText(data.smtp_password_encrypted);
  if (!data.smtp_host || !data.smtp_user || !password || !data.admin_email) return null;
  return {
    host: data.smtp_host,
    port: Number(data.smtp_port || 587),
    secure: Boolean(data.smtp_secure),
    user: data.smtp_user,
    password,
    from: data.mail_from || data.smtp_user,
    to: data.admin_email
  };
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function createTransport(config: NonNullable<Awaited<ReturnType<typeof getSmtpConfig>>>) {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.password
    }
  });
}

export async function sendTestAdminNotification() {
  const config = await getSmtpConfig();
  if (!config) throw new Error("Thông báo đang tắt hoặc cấu hình SMTP chưa đầy đủ");
  const transport = createTransport(config);
  await transport.sendMail({
    from: config.from,
    to: config.to,
    subject: "Kiểm tra thông báo đơn hàng",
    text: "SMTP Gmail đã sẵn sàng gửi thông báo đơn hàng mới.",
    html: "<p>SMTP Gmail đã sẵn sàng gửi thông báo đơn hàng mới.</p>"
  });
}

export async function notifyAdminNewOrder(orderId: string) {
  try {
    const config = await getSmtpConfig();
    if (!config) return;
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("id,order_code,customer_name,customer_email,quantity,total_amount,payment_status,order_status,created_at,products(name)")
      .eq("id", orderId)
      .maybeSingle();
    if (error || !order) return;

    const productName = Array.isArray(order.products) ? order.products[0]?.name : (order.products as any)?.name;
    const subject = `Đơn hàng mới #${order.order_code}`;
    const lines = [
      `Mã đơn: ${order.order_code}`,
      `Sản phẩm: ${productName || "Không rõ"}`,
      `Khách hàng: ${order.customer_name || "Khách"} (${order.customer_email || "chưa có email"})`,
      `Số lượng: ${order.quantity}`,
      `Tổng tiền: ${formatCurrency(order.total_amount)}`,
      `Thanh toán: ${order.payment_status}`,
      `Trạng thái đơn: ${order.order_status}`,
      `Thời gian: ${formatDate(order.created_at)}`
    ];
    const html = `
      <div style="font-family:Arial,sans-serif;color:#111827;line-height:1.5">
        <h2 style="margin:0 0 12px">Có đơn hàng mới #${escapeHtml(order.order_code)}</h2>
        <table style="border-collapse:collapse;width:100%;max-width:640px">
          ${lines.map((line) => {
            const [label, ...rest] = line.split(": ");
            return `<tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:700;width:150px">${escapeHtml(label)}</td><td style="padding:8px;border:1px solid #e5e7eb">${escapeHtml(rest.join(": "))}</td></tr>`;
          }).join("")}
        </table>
      </div>
    `;
    await createTransport(config).sendMail({
      from: config.from,
      to: config.to,
      subject,
      text: lines.join("\n"),
      html
    });
  } catch (error) {
    console.error("Failed to send admin order notification", error);
  }
}
