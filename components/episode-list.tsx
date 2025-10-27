"use client"

import Image from "next/image"
import Link from "next/link"
import { Play, Clock } from "lucide-react"
import { tmdb, type Episode } from "@/lib/tmdb"

interface EpisodeListProps {
  episodes: Episode[]
  tvId: number
  seasonNumber: number
}

export function EpisodeList({ episodes, tvId, seasonNumber }: EpisodeListProps) {
  const getCountdown = (airDate: string) => {
    const now = new Date().getTime()
    const air = new Date(airDate).getTime()
    const diff = air - now

    if (diff <= 0) return null

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    return { days, hours, minutes, seconds }
  }

  return (
    <div className="space-y-4">
      {episodes.map((episode) => {
        const countdown = episode.air_date ? getCountdown(episode.air_date) : null
        const hasAired = !countdown

        return (
          <div
            key={episode.id}
            className="group relative bg-white/5 backdrop-blur-sm rounded-lg overflow-hidden hover:ring-2 hover:ring-[#fbc9ff] transition-all"
          >
            <div className="flex flex-col sm:flex-row gap-4 p-4">
              <Link
                href={hasAired ? `/watch/tv/${tvId}/${seasonNumber}/${episode.episode_number}` : "#"}
                className={`relative flex-none w-full sm:w-[240px] aspect-video rounded overflow-hidden ${!hasAired ? "pointer-events-none" : ""}`}
              >
                <Image
                  src={tmdb.getImageUrl(episode.still_path) || "/placeholder.svg?height=135&width=240"}
                  alt={episode.name}
                  fill
                  className="object-cover"
                  sizes="240px"
                />
                {hasAired && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <div className="w-16 h-16 rounded-full bg-[#fbc9ff] flex items-center justify-center transform group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-black fill-black ml-1" />
                    </div>
                  </div>
                )}
                {!hasAired && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">Not Aired</span>
                  </div>
                )}
              </Link>

              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="text-lg font-semibold text-white">
                    {episode.episode_number}. {episode.name}
                  </h3>
                  {episode.runtime && (
                    <div className="flex items-center gap-1 text-white/60 text-sm flex-none">
                      <Clock className="w-4 h-4" />
                      <span>{episode.runtime}m</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-white/60 mb-2">
                  {episode.air_date && <span>{new Date(episode.air_date).toLocaleDateString()}</span>}
                  {episode.vote_average > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-[#fbc9ff]">★ {episode.vote_average.toFixed(1)}</span>
                    </>
                  )}
                </div>

                <p className="text-white/80 text-sm line-clamp-2 mb-3">{episode.overview}</p>

                {countdown && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#fbc9ff]/20 rounded-full text-sm text-[#fbc9ff]">
                    <span>
                      Airs in: {countdown.days}d {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
