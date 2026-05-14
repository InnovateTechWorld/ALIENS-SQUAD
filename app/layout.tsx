import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "RecyclePay - Get Paid to Recycle",
  description: "Turn your plastic waste into instant cash with AI-powered smart recycling bins. Earn ₦10 for every bottle you recycle.",
  keywords: ["recycling", "sustainability", "cash rewards", "Nigeria", "plastic waste", "AI"],
  authors: [{ name: "RecyclePay Team" }],
  openGraph: {
    title: "RecyclePay - Get Paid to Recycle",
    description: "Turn your plastic waste into instant cash with AI-powered smart recycling bins.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
