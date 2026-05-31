import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin", "vietnamese"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "SHOPMMOGIARE - Dịch vụ số hợp lệ",
  description: "Website bán gói dịch vụ số và hỗ trợ kích hoạt/license hợp lệ."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={inter.variable}>
      <body className="font-sans antialiased bg-background text-foreground">
        <div className="fixed inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20"></div>
        <Navbar />
        <main className="app-main">{children}</main>
        <Footer />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
