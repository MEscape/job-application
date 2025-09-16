import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import React from "react";
import {NextAuthProvider, ActivityProvider} from "@/providers";
import { CookieConsent } from "@/features/shared/components";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
    display: 'swap'
})

export const metadata: Metadata = {
    title: {
        template: '%s | Interactive 3D Portfolio',
        default: 'Interactive 3D Portfolio | Marvin Eschenbach'
    },
    description: 'An innovative portfolio with 3D technology and modern web standards',
    keywords: ['Portfolio', '3D', 'Next.js', 'Three.js', 'React', 'TypeScript', 'Application'],
    authors: [{ name: 'Marvin Eschenbach' }],
    creator: 'Marvin Eschenbach',
    openGraph: {
        title: 'Interactive 3D Portfolio',
        description: 'An innovative portfolio with 3D technology',
        type: 'website',
        locale: 'en_US',
        siteName: 'Interactive 3D Portfolio'
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Interactive 3D Portfolio',
        description: 'An innovative portfolio with 3D technology'
    },
    robots: {
        index: process.env.NODE_ENV === 'production',
        follow: process.env.NODE_ENV === 'production'
    }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <NextAuthProvider>
          <html lang="de" suppressHydrationWarning>
              <body
                  className={`${inter.variable} antialiased`}
              >
                  <ActivityProvider>
                      {children}
                      <CookieConsent />
                  </ActivityProvider>
              </body>
          </html>
      </NextAuthProvider>
  );
}
