import { Geist, Geist_Mono } from "next/font/google"
import type { Metadata } from "next"

import { ThemeProvider } from "@/components/theme-provider"
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
        "dark font-sans antialiased",
        fontMono.variable,
        geist.variable
      )}
    >
      <body>
        <ThemeProvider defaultTheme="dark" enableSystem={false}>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
