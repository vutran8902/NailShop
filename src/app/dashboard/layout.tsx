"use client";

import Sidebar from '@/components/Sidebar';
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-6 ml-[5rem] transition-all duration-300 group-hover/sidebar:ml-[16rem] overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
