import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "RIPPERDOC — Chrome. Implants. Survival.",
  description: "Night City's premier ripperdoc shop. Military-grade chrome, neural implants, and street-legal cyberware.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Orbitron:wght@500;700;900&family=Rajdhani:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <Suspense fallback={null}>
          <Header />
        </Suspense>
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster theme="dark" richColors position="top-right" />
      </body>
    </html>
  );
}
