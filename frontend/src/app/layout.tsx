import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import "./globals.css"
import { AppProviders } from "@/providers/app-providers"

export const metadata: Metadata = {
  title: "Inventory SaaS",
  description: "Sistema de gestión de inventario",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={GeistSans.className}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}