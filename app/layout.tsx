import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { TeamsProvider } from "@/context/TeamsContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GOATProno — Football",
  description: "Pronostique. Gagne. Devance les autres.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={`${inter.className} bg-slate-900 text-slate-100 min-h-screen antialiased`}>
        <TeamsProvider>
          {children}
        </TeamsProvider>
      </body>
    </html>
  )
}
