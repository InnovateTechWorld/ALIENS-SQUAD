import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "RecyclePay - Get Paid to Recycle",
  description: "Turn your plastic waste into instant cash with AI-powered smart recycling bins.",
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
    <html lang="en" className="h-full antialiased">
      <body className={`${plusJakarta.className} min-h-full flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
