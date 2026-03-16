import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ScrollProgress from "@/components/ScrollProgress";
import BackToTop from "@/components/BackToTop";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://koivulabs.com'),
  title: "Koivu Labs | Pragmatic Intelligence",
  description: "A Finnish Software Studio focused on AI-driven utility. Bridging human common sense with AI power.",
  keywords: ["Koivu Labs", "AI", "Software Studio", "Finland", "Pragmatic Intelligence", "KoivuChat", "AI chatbot", "chatbotti suomi", "BrainBuffer", "Human Dashboard"],
  authors: [{ name: "Koivu Labs" }],
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
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

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Koivu Labs',
  url: 'https://koivulabs.com',
  email: 'hello@koivulabs.com',
  description: 'A Finnish Software Studio focused on AI-driven utility. Bridging human common sense with AI power.',
  foundingDate: '2026',
  foundingLocation: {
    '@type': 'Place',
    name: 'Saarijärvi, Finland',
  },
  sameAs: ['https://github.com/koivulabs'],
  makesOffer: {
    '@type': 'Offer',
    itemOffered: {
      '@type': 'SoftwareApplication',
      name: 'KoivuChat',
      url: 'https://koivulabs.com/koivuchat',
      description: 'AI-chatbotti suomalaiselle yritykselle. Oppii yrityksesi tiedoista ja vastaa asiakkaidesi kysymyksiin ympäri vuorokauden.',
      applicationCategory: 'BusinessApplication',
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} min-h-screen bg-slate-950 text-slate-50`}>
        <ScrollProgress />
        <Navbar />
        {children}
        <BackToTop />
      </body>
    </html>
  );
}
