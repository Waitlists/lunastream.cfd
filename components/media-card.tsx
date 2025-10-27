"use client"

import Image from "next/image"
import Link from "next/link"
import { Play } from "lucide-react"
import { tmdb } from "@/lib/tmdb"

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

  return (
    <Link
      href={`/${mediaType}/${id}`}
      className="relative block rounded-lg overflow-hidden bg-card transition-all duration-300 hover:scale-105 hover:shadow-[0_4px_15px_rgba(251,201,255,0.25)]"
    >
      <div className="aspect-[2/3] relative">
        <Image
          src={posterUrl || "/placeholder.svg"}
          alt={title}
          fill
          className="object-cover transition-transform duration-300"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
          unoptimized={posterUrl.includes("placeholder.svg")}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-300">
          <div className="w-12 h-12 rounded-full bg-[#fbc9ff] flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-[0_0_10px_rgba(251,201,255,0.4)]">
            <Play className="w-6 h-6 text-black fill-black ml-1" />
          </div>
        </div>
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
