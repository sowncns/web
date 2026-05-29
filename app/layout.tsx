import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "DigiLicense - Dịch vụ số hợp lệ",
  description: "Website bán gói dịch vụ số và hỗ trợ kích hoạt/license hợp lệ."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <Navbar />
        <main className="app-main">{children}</main>
        <Footer />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
