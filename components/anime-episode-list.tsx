"use client"

import Link from "next/link"
import { Play } from "lucide-react"

interface AnimeEpisodeListProps {
  animeId: number
  totalEpisodes: number
  animeTitle: string
}

export function AnimeEpisodeList({ animeId, totalEpisodes, animeTitle }: AnimeEpisodeListProps) {
  // Generate episode array
  const episodes = Array.from({ length: totalEpisodes }, (_, i) => i + 1)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      {episodes.map((episodeNumber) => (
        <Link
          key={episodeNumber}
          href={`/watch/anime/${animeId}/${episodeNumber}`}
          className="group relative bg-white/5 backdrop-blur-sm rounded-lg overflow-hidden hover:ring-2 hover:ring-[#fbc9ff] transition-all p-4 flex flex-col items-center justify-center aspect-video"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#fbc9ff]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-[#fbc9ff]/20 flex items-center justify-center group-hover:bg-[#fbc9ff] transition-colors">
              <Play className="w-6 h-6 text-[#fbc9ff] group-hover:text-black fill-current ml-0.5" />
            </div>
            <span className="text-white font-semibold text-sm">Episode {episodeNumber}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}
