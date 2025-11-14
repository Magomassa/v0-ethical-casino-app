import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono, Kanit } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })
const kanit = Kanit({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-display" })

export const metadata: Metadata = {
  title: "MotivaPlay - Casino Ético Corporativo",
  description: "Motiva a tus empleados con un sistema gamificado de fichas y premios",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/motivaplay-icon.svg",
        type: "image/svg+xml",
      },
      {
        url: "/motivaplay-icon.svg",
        sizes: "any",
      },
    ],
    apple: "/motivaplay-icon.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${geist.variable} ${geistMono.variable} ${kanit.variable} font-sans`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
