"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { tmdb, type Episode } from "@/lib/tmdb"

interface EpisodeRatingChartProps {
  tvId: number
  totalSeasons: number
}

export function EpisodeRatingChart({ tvId, totalSeasons }: EpisodeRatingChartProps) {
  const [open, setOpen] = useState(false)
  const [allEpisodes, setAllEpisodes] = useState<{ [season: number]: Episode[] }>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return

    const fetchAllSeasons = async () => {
      setLoading(true)
      const episodesData: { [season: number]: Episode[] } = {}

      for (let season = 1; season <= totalSeasons; season++) {
        try {
          const seasonData = await tmdb.getSeasonDetails(tvId, season)
          episodesData[season] = seasonData.episodes || []
        } catch (err) {
          console.error(`Error fetching season ${season}:`, err)
          episodesData[season] = []
        }
      }

      setAllEpisodes(episodesData)
      setLoading(false)
    }

    fetchAllSeasons()
  }, [open, tvId, totalSeasons])

  const getRatingColor = (rating: number) => {
    if (rating >= 9.5) return "bg-[#0d8f0d]"
    if (rating >= 9.0) return "bg-[#10b010]"
    if (rating >= 8.5) return "bg-[#5fdb5f]"
    if (rating >= 8.0) return "bg-[#7ee87e]"
    if (rating >= 7.5) return "bg-[#c4e67c]"
    if (rating >= 7.0) return "bg-[#e8d55e]"
    if (rating >= 6.5) return "bg-[#f0b840]"
    if (rating >= 6.0) return "bg-[#d9534f]"
    return "bg-[#8b3a62]"
  }

  const getRatingTextColor = (rating: number) => {
    return rating >= 7.0 ? "text-black" : "text-white"
  }

  const maxEpisodes = Math.max(...Object.values(allEpisodes).map((eps) => eps.length), 0)

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="bg-white/5 backdrop-blur-sm border-white/10 text-white hover:bg-white/10 hover:text-[#fbc9ff]"
      >
        View Rating Chart
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-black/95 backdrop-blur-xl border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#fbc9ff]">Episode Ratings Chart</DialogTitle>
            <DialogDescription className="text-white/60">All seasons and episodes with TMDB ratings</DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-white/60">Loading ratings...</div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <div className="w-8 flex-shrink-0" />
                {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((season) => (
                  <div
                    key={season}
                    className="w-12 h-8 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white/60"
                  >
                    S{season}
                  </div>
                ))}
              </div>

              {Array.from({ length: maxEpisodes }, (_, episodeIndex) => (
                <div key={episodeIndex} className="flex items-center gap-1">
                  <div className="w-8 flex-shrink-0 text-xs font-bold text-white/60 text-right">
                    E{episodeIndex + 1}
                  </div>
                  {Array.from({ length: totalSeasons }, (_, seasonIndex) => {
                    const season = seasonIndex + 1
                    const episode = allEpisodes[season]?.[episodeIndex]
                    const rating = episode?.vote_average || 0
                    const isPerfect = rating >= 9.95

                    return (
                      <div
                        key={`${season}-${episodeIndex}`}
                        className={`w-12 h-12 flex-shrink-0 rounded flex items-center justify-center text-sm font-bold transition-all hover:scale-105 ${
                          episode
                            ? `${getRatingColor(rating)} ${getRatingTextColor(rating)} ${
                                isPerfect
                                  ? "animate-pulse shadow-[0_0_20px_rgba(251,201,255,0.9)] ring-2 ring-[#fbc9ff]"
                                  : ""
                              }`
                            : "bg-white/5"
                        }`}
                        title={
                          episode ? `S${season}E${episode.episode_number}: ${episode.name} - ${rating.toFixed(1)}` : ""
                        }
                      >
                        {episode && rating > 0 ? rating.toFixed(1) : "—"}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
