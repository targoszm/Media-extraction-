import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Source_Sans_3 } from "next/font/google"
import "./globals.css"

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
  weight: ["400", "700"],
})

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-sans",
  weight: ["400", "600"],
})

export const metadata: Metadata = {
  title: "AI Media Extractor - Powered by Gemini 2.0 Flash",
  description: "Extract structured data from videos, audio, and PDFs using advanced AI",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${sourceSans.style.fontFamily};
  --font-playfair: ${playfair.variable};
  --font-source-sans: ${sourceSans.variable};
}
        `}</style>
      </head>
      <body className={`${playfair.variable} ${sourceSans.variable} antialiased font-sans`}>{children}</body>
    </html>
  )
}
