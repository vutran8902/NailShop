import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

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

export const metadata: Metadata = {
  title: "Nail Salon Management",
  description: "Modern nail salon management application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased light-theme`}
      >
        <div className="min-h-screen">
          {children}
        </div>
        <Script id="theme-init">
          {`
            // Initialize theme based on user preference
            (function() {
              function getThemePreference() {
                if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
                  return localStorage.getItem('theme');
                }
                return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              }
              
              const theme = getThemePreference();
              
              if (theme === 'dark') {
                document.documentElement.classList.add('dark');
                document.body.classList.add('dark-theme');
                document.body.classList.remove('light-theme');
              } else {
                document.documentElement.classList.remove('dark');
                document.body.classList.add('light-theme');
                document.body.classList.remove('dark-theme');
              }
            })();
          `}
        </Script>
      </body>
    </html>
  );
}
