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
        <Header />
        <Suspense fallback={<div className="min-h-screen bg-gray-900 flex items-center justify-center"><p className="text-gray-400">Loading...</p></div>}>
          {children}
        </Suspense>
        <InstallButton />
        <div className="flex items-center justify-center w-full p-16">
            PiraTV Watch Movies and TV
        </div>

      </body>
    </html>
  );
}
