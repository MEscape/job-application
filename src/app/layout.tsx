import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import React from "react";
import {NextAuthProvider} from "@/providers";

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
    description: 'Ein innovatives Portfolio mit 3D-Technologie und modernen Web-Standards',
    keywords: ['Portfolio', '3D', 'Next.js', 'Three.js', 'React', 'TypeScript', 'Bewerbung'],
    authors: [{ name: 'Marvin Eschenbach' }],
    creator: 'Marvin Eschenbach',
    metadataBase: new URL('http://localhost:3000'),
    openGraph: {
        title: 'Interactive 3D Portfolio',
        description: 'Ein innovatives Portfolio mit 3D-Technologie',
        type: 'website',
        locale: 'de_DE',
        siteName: 'Interactive 3D Portfolio'
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Interactive 3D Portfolio',
        description: 'Ein innovatives Portfolio mit 3D-Technologie'
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
                  {children}
              </body>
          </html>
      </NextAuthProvider>
  );
}
