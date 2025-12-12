import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { ThreeMapBackground } from "@/components/ui/ThreeMapBackground";
import { TimeTracker } from "@/components/TimeTracker";
import { I18nProvider } from "@/lib/i18n";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TIDE - GAME OA",
  description: "Advanced Resource Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[var(--end-bg)] text-[var(--end-text-main)] min-h-screen selection:bg-[var(--end-yellow)] selection:text-black overflow-x-hidden`}
      >
        <I18nProvider>
          <TimeTracker />
          <ThreeMapBackground />
          
          <Navbar />
          
          <main className="min-h-screen pt-24 md:pt-32 transition-all duration-300 relative">
            <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
              {children}
            </div>
          </main>
        </I18nProvider>
      </body>
    </html>
  );
}
