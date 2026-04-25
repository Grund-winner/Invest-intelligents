import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Invest Intelligents — Académie de Trading Premium",
  description:
    "Assistant IA officiel de Invest Intelligents. Obtenez des informations sur nos abonnements VIP, formations et services de trading.",
  keywords: [
    "Invest Intelligents",
    "trading",
    "académie",
    "VIP",
    "signaux",
    "forex",
    "crypto",
  ],
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "Invest Intelligents",
    description: "Académie de Trading Premium — Assistant IA",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
