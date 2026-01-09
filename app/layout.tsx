
import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";
import { WebsiteLayoutWrapper } from "@/components/common/website-layout-wrapper";
import { SanityLiveWrapper } from "@/components/common/sanity-live-wrapper";
import { AuthProvider } from "@/components/auth/auth-provider";
import { CartProvider } from "@/components/cart/cart-provider";
import { getAllCategories } from "@/sanity/lib";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://bubblewrapshop.co.uk";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Bubble Wrap Shop - Premium Packaging Supplies",
    template: "%s | Bubble Wrap Shop",
  },
  description:
    "UK's leading supplier of packaging supplies. Buy bubble wrap, cardboard boxes, packing tape, and protective packaging. Wholesale pricing available. Next day delivery across the UK.",
  keywords: [
    "packaging supplies",
    "packaging supplies UK",
    "bubble wrap",
    "bubble wrap UK",
    "packaging boxes",
    "cardboard boxes UK",
    "packing tape",
    "packing tape UK",
    "shipping boxes",
    "shipping boxes UK",
    "wholesale packaging",
    "wholesale packaging UK",
    "bulk packaging supplies",
    "B2B packaging",
    "corporate packaging",
    "business packaging supplies",
    "packaging wholesale",
    "bulk bubble wrap",
    "wholesale cardboard boxes",
    "next day delivery",
    "next day delivery UK",
    "UK packaging supplier",
    "packaging supplier UK",
    "Blackburn packaging",
    "Lancashire packaging supplier",
    "protective packaging",
    "protective packaging UK",
    "eco-friendly packaging",
    "eco-friendly packaging UK",
    "packaging materials",
    "packaging materials UK",
    "bubble wrap online",
    "cheap packaging supplies",
    "packaging boxes online",
    "next day delivery packaging supplies UK",
    "cheap bubble wrap online",
    "wholesale packaging supplies UK",
    "bulk packaging UK",
    "packaging supplies next day delivery",
  ],
  authors: [{ name: "Bubble Wrap Shop" }],
  creator: "Bubble Wrap Shop",
  publisher: "Bubble Wrap Shop",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: baseUrl,
    siteName: "Bubble Wrap Shop - Premium Packaging Supplies",
    title: "Bubble Wrap Shop - Premium Packaging Supplies",
    description:
      "Professional packaging supplies with automatic bulk pricing. Next day delivery. Eco-friendly options.",
    images: [
      {
        url: "/logo.jpg",
        width: 1200,
        height: 630,
        alt: "Bubble Wrap Shop Premium Packaging Supplies",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bubble Wrap Shop - Premium Packaging Supplies",
    description:
      "Professional packaging supplies with automatic bulk pricing. Next day delivery. Eco-friendly options.",
    images: [
      {
        url: "/logo.jpg",
        width: 1200,
        height: 630,
        alt: "Bubble Wrap Shop Premium Packaging Supplies",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {},
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await getAllCategories();

  return (
    <html
      lang="en"
      className={`${inter.variable} font-sans`}
      suppressHydrationWarning
    >
      <head>
        {/* Only keep preconnect for critical LCP assets (Sanity Images) */}
        <link
          rel="preconnect"
          href="https://cdn.sanity.io"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="//cdn.sanity.io" />

        {/* Removed unused connections to r2.dev and unsplash to fix Lighthouse warnings */}
      </head>
      <body
        className="min-h-screen bg-background font-sans antialiased"
        suppressHydrationWarning
      >
        <Script id="silence-console" strategy="beforeInteractive">
          {`(function(){try{if(process&&process.env&&process.env.NODE_ENV==='production'){['log','info','debug','trace'].forEach(function(m){if(console&&console[m]){console[m]=function(){}}})}}catch(e){}})();`}
        </Script>
        <AuthProvider>
          <CartProvider>
            <WebsiteLayoutWrapper categories={categories || []}>
              {children}
            </WebsiteLayoutWrapper>

            {/* Optimized Wrapper: Only loads listener in Draft Mode */}
            <SanityLiveWrapper />
          </CartProvider>
        </AuthProvider>
        {process.env.NODE_ENV === "production" && (
          <>
            <SpeedInsights />
            <Analytics />
          </>
        )}
      </body>
    </html>
  );
}
