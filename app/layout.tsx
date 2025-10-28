import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LunaStream - Watch Movies & TV Shows",
  description: "Stream your favorite movies and TV shows on LunaStream",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "LunaStream - Watch Movies & TV Shows",
    description: "Stream your favorite movies and TV shows on LunaStream",
    images: [{ url: "/image.png" }],
  },
  other: {
    "dns-prefetch": [
      "//www.youtube.com",
      "//player.videasy.net",
      "//player.vidify.top",
      "//player.vidplus.to",
      "//vidfast.pro",
      "//mapple.uk",
      "//player.vidzee.wtf",
      "//vidora.su",
      "//vidlink.pro",
      "//vidrock.net",
      "//player.autoembed.cc",
      "//vidsrc.cc",
      "//vidsrc.xyz",
      "//player.smashy.stream",
      "//moviesapi.club",
      "//letsembed.cc",
      "//vidplay.to",
      "//vidnest.fun",
      "//cinemaos.tech",
      "//spencerdevs.xyz",
      "//www.vidking.net",
      "//111movies.com",
      "//vixsrc.to",
      "//vidsrc.cx",
      "//xprime.tv",
      "//watch.bludclart.com",
      "//vidup.to",
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
