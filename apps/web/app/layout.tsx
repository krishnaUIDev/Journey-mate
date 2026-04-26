import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Sora } from "next/font/google";

const sora = Sora({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Journey-mate | Modern Travel Companion Platform",
  description: "Connect with verified travel companions, coordinate flights, and travel safer together. The world's largest community for assisted travel.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "Journey-mate | Travel Together, Safely",
    description: "Find your perfect travel companion and never travel alone again.",
    url: "https://journey-mate.com",
    siteName: "Journey-mate",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  alternates: {
    canonical: "https://journey-mate.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Journey-mate | Travel Together, Safely",
    description: "Connect with verified travel companions for your next flight.",
    images: ["/og-image.png"],
  },
  robots: "index, follow",
};

import {
  ClerkProvider
} from '@clerk/nextjs';
import { BuyMeACoffeeFloating } from "../components/BuyMeACoffeeFloating";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY;

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="dns-prefetch" href="https://img.clerk.com" />
          <link rel="preconnect" href="https://img.clerk.com" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://c.basemaps.cartocdn.com" crossOrigin="anonymous" />
        </head>
        <body className={`${sora.className} overflow-x-hidden`} suppressHydrationWarning>
          {children}
          <BuyMeACoffeeFloating />
        </body>
      </html>
    </ClerkProvider>
  );
}
