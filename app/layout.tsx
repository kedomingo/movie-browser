import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import Script from "next/script";
import InstallButton from "@/components/InstallButton";
import Header from "@/components/Header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PiraTV Watch Movies and TV",
  description: "Watch movies and TV shows",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          src="https://cdn.jsdelivr.net/npm/disable-devtool@latest"
          disable-devtool-auto
          suppressHydrationWarning
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Suspense
          fallback={
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
              <p className="text-gray-400">Loading...</p>
            </div>
          }
        >
          {children}
        </Suspense>
        <div className="relative z-20 flex flex-col items-center justify-center w-full p-16 gap-4">
          <p>PiraTV Watch Movies and TV - All content is provided by external third-party providers</p>

          <a
            href="https://ko-fi.com/pppira"
            target="_blank"
            rel="noopener noreferrer"
            className="block flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors"
          >
            <img src="/coffee.png" width="24" />
            <span>Buy me a coffee</span>
          </a>
        </div>
        <InstallButton />
      </body>
    </html>
  );
}
