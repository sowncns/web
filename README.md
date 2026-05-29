# DigiLicense

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
```

`SUPABASE_SERVICE_ROLE_KEY` chỉ dùng server-side. Không đưa key này vào client.

## Supabase

Chạy trong Supabase SQL Editor:

1. `supabase/schema.sql`
2. `supabase/seed.sql`

Schema có `profiles.balance` và `wallet_topups` cho trang nạp tiền `/payment`.

## payOS

Webhook URL trên Vercel:

```text
https://web-rouge-three-43.vercel.app/api/payment/payos/webhook
```

Trang `/payment` tạo giao dịch nạp tiền payOS thật, hiển thị QR/chuyển khoản từ response payOS. Webhook verify chữ ký bằng SDK `@payos/node`; khi giao dịch thành công sẽ cập nhật `wallet_topups` và cộng `profiles.balance`.
