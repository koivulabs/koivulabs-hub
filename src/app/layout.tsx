import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://koivulabs.com'),
  title: "Koivu Labs | Pragmatic Intelligence",
  description: "A Finnish Software Studio focused on AI-driven utility. Bridging human common sense with AI power.",
  keywords: ["Koivu Labs", "AI", "Software Studio", "Finland", "Pragmatic Intelligence", "BrainBuffer", "Human Dashboard"],
  authors: [{ name: "Koivu Labs" }],
  openGraph: {
    title: "Koivu Labs | Pragmatic Intelligence",
    description: "A Finnish Software Studio focused on AI-driven utility.",
    url: "https://koivulabs.com",
    siteName: "Koivu Labs",
    locale: "en_FI",
    type: "website",
    images: [
      {
        url: '/images/og-main.png',
        width: 1200,
        height: 630,
        alt: 'Koivu Labs - Pragmatic Intelligence',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Koivu Labs | Pragmatic Intelligence",
    description: "A Finnish Software Studio focused on AI-driven utility.",
    images: ['/images/og-main.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-slate-950 text-slate-50`}>
        {children}
      </body>
    </html>
  );
}
