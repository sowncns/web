import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { sendTestAdminNotification } from "@/lib/admin-notifications";

export async function POST() {
  const admin = await isAdminRequest();
  if (!admin.ok) return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  try {
    await sendTestAdminNotification();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Không gửi được email thử" }, { status: 400 });
  }
}
