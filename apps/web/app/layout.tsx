import "./globals.css";
import type { Metadata } from "next";
import { Sora } from "next/font/google";

const sora = Sora({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Journey-mate | Find Your Travel Companion",
  description: "Connect with verified travel companions for a safer and more enjoyable journey.",
};

import {
  ClerkProvider
} from '@clerk/nextjs';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={sora.className} suppressHydrationWarning>{children}</body>
      </html>
    </ClerkProvider>
  );
}
