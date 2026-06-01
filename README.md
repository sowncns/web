# SHOPMMOGIARE

Website bán dịch vụ số hợp lệ với Next.js 14, Supabase và payOS.

## Chạy local

```bash
npm install
npm run dev
```

## Biến môi trường

Tạo `.env` hoặc cấu hình trên Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
PAYOS_CLIENT_ID=
PAYOS_API_KEY=
PAYOS_CHECKSUM_KEY=
APP_URL=https://web-rouge-three-43.vercel.app
ENCRYPTION_KEY=
NEXT_PUBLIC_ADMIN_FACEBOOK=
```

`SUPABASE_SERVICE_ROLE_KEY` chỉ dùng server-side. Không đưa key này vào client.

---

## 🔄 Hướng Dẫn Đổi Domain (Tên Miền Mới)

Khi bạn chuyển website sang một domain mới (ví dụ từ `https://web-rouge-three-43.vercel.app` sang `https://domain-moi.com`), bạn **CẦN** cập nhật các cấu hình sau để hệ thống (Đăng nhập, Thanh toán, Callback) hoạt động chính xác:

### 1. Cập nhật trong Code / Biến môi trường (.env / Vercel)
- Cập nhật biến `APP_URL`: Đổi thành domain mới (vd: `APP_URL=https://domain-moi.com`).
- *(Lưu ý: Nếu bạn deploy trên Vercel, hãy vào mục **Settings > Environment Variables** để cập nhật lại biến này và Redeploy).*

### 2. Cập nhật trong Supabase
Truy cập vào [Supabase Dashboard](https://supabase.com/dashboard) của dự án:
- Vào **Authentication > URL Configuration**:
  - **Site URL**: Đổi thành domain mới (`https://domain-moi.com`).
  - **Redirect URLs**: Xóa domain cũ và thêm `https://domain-moi.com/**`. (Điều này đảm bảo các liên kết xác nhận email, reset password hoạt động đúng).
- Vào **Authentication > Providers > Google**:
  - Đảm bảo Redirect URI của Google (của Supabase) không đổi, nhưng hãy check lại nếu cần.

### 3. Cập nhật Đăng nhập Google (Google Cloud Console)
- Truy cập [Google Cloud Console](https://console.cloud.google.com).
- Vào **APIs & Services > Credentials**.
- Chọn **OAuth 2.0 Client IDs** đang dùng cho dự án này:
  - Ở mục **Authorized JavaScript origins** (Nguồn gốc JavaScript được phép): Xóa domain cũ và thêm domain mới (vd: `https://domain-moi.com`).
  - Ở mục **Authorized redirect URIs** (URI chuyển hướng được phép): Vì bạn dùng qua Supabase nên URI chuyển hướng (dạng `https://<project-ref>.supabase.co/auth/v1/callback`) thường **không thay đổi**. Nhưng nếu bạn có gọi thẳng từ code, hãy cập nhật lại thành `https://domain-moi.com/api/auth/callback/google` (tùy theo bạn có cấu hình thêm ngoài Supabase không).

### 4. Cập nhật Webhook PayOS (Thanh Toán)
- Truy cập vào trang quản trị của [PayOS](https://payos.vn).
- Vào phần cấu hình **Kênh thanh toán** > **Cài đặt Webhook**:
- Thay đổi Webhook URL cũ thành URL mới. Ví dụ:
  `https://domain-moi.com/api/payment/payos/webhook`
- Nhấn **Cập nhật** để PayOS gửi thông báo thanh toán thành công về đúng server mới, nếu không người dùng nạp tiền sẽ không được cộng số dư.

---

## Supabase (Setup Ban Đầu)

Chạy trong Supabase SQL Editor:

1. `supabase/schema.sql`
2. `supabase/seed.sql`

Schema có `profiles.balance` và `wallet_topups` cho trang nạp tiền `/payment`.

Template email xác nhận tài khoản nằm ở `supabase/email-confirm-signup.html`. Dán nội dung file này vào Supabase Dashboard > Authentication > Email Templates > Confirm sign up.

## payOS

Trang `/payment` tạo giao dịch nạp tiền payOS thật, hiển thị QR/chuyển khoản từ response payOS. Webhook verify chữ ký bằng SDK `@payos/node`; khi giao dịch thành công sẽ cập nhật `wallet_topups` và cộng `profiles.balance`.
