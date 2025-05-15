import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ისლამური ლოცვის დროების სერვერი",
  description: "სერვერი ისლამური ლოცვის დროების API-სთვის კეშირებით",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ka">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
