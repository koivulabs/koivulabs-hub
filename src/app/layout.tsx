import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";
import BackToTop from "@/components/BackToTop";

const inter = Inter({ subsets: ["latin"] });

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif-display",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://koivulabs.com'),
  title: "Koivu Labs | Pragmatic Intelligence",
  description: "A Finnish Software Studio focused on AI-driven utility. Bridging human common sense with AI power.",
  keywords: ["Koivu Labs", "AI", "Software Studio", "Finland", "Saarijärvi", "Pragmatic Intelligence", "web development", "AI integration"],
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
    // Image comes from app/opengraph-image.tsx (file convention) — do not
    // override here: the previous hardcoded /images/og-main.png did not exist.
  },
  twitter: {
    card: "summary_large_image",
    title: "Koivu Labs | Pragmatic Intelligence",
    description: "A Finnish Software Studio focused on AI-driven utility.",
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
      <body className={`${inter.className} ${instrumentSerif.variable} min-h-screen bg-slate-950 text-slate-50`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[70] focus:px-4 focus:py-2 focus:bg-teal-500 focus:text-slate-950 focus:font-bold focus:rounded-lg"
        >
          Skip to content
        </a>
        <ScrollProgress />
        <Navbar />
        <div id="main-content">
          {children}
        </div>
        <Footer />
        <BackToTop />
      </body>
    </html>
  );
}
