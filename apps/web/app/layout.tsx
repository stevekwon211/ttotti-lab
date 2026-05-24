import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google"
import type { Metadata } from "next"

import { TooltipProvider } from "@ttotti/ui/components/tooltip"
import "@ttotti/ui/globals.css"
import { cn } from "@ttotti/ui/lib/utils"

export const metadata: Metadata = {
  title: "ttotti lab",
  description:
    "browser-native creative coding lab for motion, vision, WebGL, and media art",
}

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const fontSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "font-sans antialiased",
        fontMono.variable,
        fontSerif.variable,
        geist.variable
      )}
    >
      <body>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  )
}
