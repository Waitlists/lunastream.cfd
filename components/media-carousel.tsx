"use client"

import { useRef, useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { MediaCard } from "./media-card"

interface MediaItem {
  id: number
  title?: string
  name?: string
  poster_path: string | null
  media_type?: "movie" | "tv"
  vote_average?: number
  release_date?: string
  first_air_date?: string
}

interface MediaCarouselProps {
  title: string
  items: MediaItem[]
  mediaType?: "movie" | "tv"
}

export function MediaCarousel({ title, items, mediaType }: MediaCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const updateScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    const scrollElement = scrollRef.current
    if (scrollElement) {
      scrollElement.addEventListener("scroll", updateScrollButtons)
      updateScrollButtons()
      return () => scrollElement.removeEventListener("scroll", updateScrollButtons)
    }
  }, [])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "<") {
        scroll("left")
      } else if (e.key === "ArrowRight" || e.key === ">") {
        scroll("right")
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [])

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 400
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  return (
    <div className="relative group">
      <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>

      {canScrollLeft && (
        <button
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 text-white/60 hover:text-[#fbc9ff] transition-all hover:scale-125 hover:drop-shadow-[0_0_10px_rgba(251,201,255,0.8)]"
          onClick={() => scroll("left")}
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-14 h-14" strokeWidth={2.5} />
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((item) => {
          const itemMediaType = mediaType || item.media_type || "movie"
          const itemTitle = item.title || item.name || "Untitled"
          const year = item.release_date
            ? new Date(item.release_date).getFullYear().toString()
            : item.first_air_date
              ? new Date(item.first_air_date).getFullYear().toString()
              : undefined

          return (
            <div key={item.id} className="flex-none w-[180px]">
              <MediaCard
                id={item.id}
                title={itemTitle}
                posterPath={item.poster_path}
                mediaType={itemMediaType}
                voteAverage={item.vote_average}
                year={year}
              />
            </div>
          )
        })}
      </div>

      {canScrollRight && (
        <button
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 text-white/60 hover:text-[#fbc9ff] transition-all hover:scale-125 hover:drop-shadow-[0_0_10px_rgba(251,201,255,0.8)]"
          onClick={() => scroll("right")}
          aria-label="Scroll right"
        >
          <ChevronRight className="w-14 h-14" strokeWidth={2.5} />
        </button>
      )}
    </div>
  )
}
