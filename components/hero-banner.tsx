"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Play, Info, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { tmdb } from "@/lib/tmdb"

interface HeroItem {
  id: number
  title?: string
  name?: string
  overview: string
  backdrop_path: string | null
  media_type: "movie" | "tv"
}

interface HeroBannerProps {
  items: HeroItem[]
}

export function HeroBanner({ items }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [items.length])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "<") {
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)
      } else if (e.key === "ArrowRight" || e.key === ">") {
        setCurrentIndex((prev) => (prev + 1) % items.length)
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [items.length])

  if (items.length === 0) return null

  const current = items[currentIndex]
  const title = current.title || current.name || "Untitled"

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length)
  }

  return (
    <div className="relative h-[70vh] w-full overflow-hidden">
      <Image
        src={tmdb.getImageUrl(current.backdrop_path, "original") || "/placeholder.svg"}
        alt={title}
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white/70 hover:text-[#fbc9ff] transition-all hover:scale-125 hover:drop-shadow-[0_0_10px_rgba(251,201,255,0.8)]"
        aria-label="Previous"
      >
        <ChevronLeft className="w-16 h-16" strokeWidth={2.5} />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white/70 hover:text-[#fbc9ff] transition-all hover:scale-125 hover:drop-shadow-[0_0_10px_rgba(251,201,255,0.8)]"
        aria-label="Next"
      >
        <ChevronRight className="w-16 h-16" strokeWidth={2.5} />
      </button>

      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 text-balance">{title}</h1>
          <p className="text-lg text-white/90 mb-6 line-clamp-3 text-pretty">{current.overview}</p>
          <div className="flex gap-4">
            <Link href={`/${current.media_type}/${current.id}`}>
              <Button
                size="lg"
                className="bg-[#fbc9ff] hover:bg-[#db97e2] text-black font-semibold transition-all hover:scale-110 hover:shadow-[0_0_25px_rgba(251,201,255,0.6)]"
              >
                <Play className="w-5 h-5 mr-2 fill-black" />
                Play
              </Button>
            </Link>
            <Link href={`/${current.media_type}/${current.id}`}>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/30 transition-all hover:scale-110"
              >
                <Info className="w-5 h-5 mr-2" />
                More Info
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 flex gap-2">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all hover:scale-150 ${
              index === currentIndex ? "bg-[#fbc9ff] w-8" : "bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
