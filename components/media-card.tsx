"use client"

import Image from "next/image"
import Link from "next/link"
import { Play, Volume2 } from "lucide-react"
import { tmdb } from "@/lib/tmdb"
import { storage } from "@/lib/storage"
import { useState, useRef } from "react"

interface MediaCardProps {
  id: number
  title: string
  posterPath: string | null
  mediaType: "movie" | "tv"
  voteAverage?: number
  year?: string
}

export function MediaCard({ id, title, posterPath, mediaType, voteAverage, year }: MediaCardProps) {
  const posterUrl = posterPath ? tmdb.getImageUrl(posterPath, "w500") : "/placeholder.svg?height=270&width=180"
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null)
  const [isMuted, setIsMuted] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const videoRef = useRef<HTMLIFrameElement>(null)
  const settings = storage.getSettings()

  const fetchTrailer = async () => {
    if (!settings.playTrailers || trailerUrl) return

    try {
      const details = mediaType === "movie"
        ? await tmdb.getMovieDetails(id)
        : await tmdb.getTVShowDetails(id)

      const trailer = details.videos.results.find(
        (video: any) => video.type === "Trailer" && video.site === "YouTube"
      )

      if (trailer) {
        setTrailerUrl(`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1&loop=1&playlist=${trailer.key}&controls=0&modestbranding=1&rel=0`)
      }
    } catch (error) {
      console.error("Failed to fetch trailer:", error)
    }
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
    fetchTrailer()
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsMuted(!isMuted)
    // Update the iframe src to toggle mute
    if (videoRef.current && trailerUrl) {
      const newUrl = isMuted
        ? trailerUrl.replace('mute=1', 'mute=0')
        : trailerUrl.replace('mute=0', 'mute=1')
      setTrailerUrl(newUrl)
    }
  }

  return (
    <Link
      href={`/${mediaType}/${id}`}
      className="relative block rounded-lg overflow-hidden bg-card transition-all duration-300 hover:scale-105 hover:shadow-[0_4px_15px_rgba(251,201,255,0.25)]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="aspect-[2/3] relative">
        {settings.playTrailers && trailerUrl && isHovered ? (
          <iframe
            ref={videoRef}
            src={trailerUrl}
            className="w-full h-full object-cover"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        ) : (
          <Image
            src={posterUrl || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
            unoptimized={posterUrl.includes("placeholder.svg")}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-300">
          <div className="w-12 h-12 rounded-full bg-[#fbc9ff] flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-[0_0_10px_rgba(251,201,255,0.4)]">
            <Play className="w-6 h-6 text-black fill-black ml-1" />
          </div>
        </div>
        {settings.playTrailers && trailerUrl && isHovered && (
          <button
            onClick={toggleMute}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            <Volume2 className={`w-4 h-4 ${isMuted ? 'text-white' : 'text-[#fbc9ff]'}`} />
          </button>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm line-clamp-1 text-white hover:text-[#fbc9ff] transition-colors">
          {title}
        </h3>
        <div className="flex items-center justify-between mt-1">
          {year && <span className="text-xs text-white/60">{year}</span>}
          {voteAverage && <span className="text-xs text-[#fbc9ff]">★ {voteAverage.toFixed(1)}</span>}
        </div>
      </div>
    </Link>
  )
}
