"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { tmdb, type TVShowDetails } from "@/lib/tmdb"

interface DownloadPopupProps {
  isOpen: boolean
  onClose: () => void
  mediaId: number
  mediaType: "movie" | "tv"
  title: string
  season?: number
  episode?: number
}

export function DownloadPopup({ isOpen, onClose, mediaId, mediaType, title, season, episode }: DownloadPopupProps) {
  const [selectedSeason, setSelectedSeason] = useState(season || 1)
  const [selectedEpisode, setSelectedEpisode] = useState(episode || 1)
  const [showDetails, setShowDetails] = useState<TVShowDetails | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (mediaType === "tv" && isOpen) {
      setLoading(true)
      tmdb.getTVShowDetails(mediaId).then((details) => {
        setShowDetails(details)
        setLoading(false)
      }).catch(() => {
        setLoading(false)
      })
    }
  }, [mediaId, mediaType, isOpen])

  const getEmbedUrl = () => {
    if (mediaType === "movie") {
      return `https://dl.vidsrc.vip/movie/${mediaId}`
    } else {
      return `https://dl.vidsrc.vip/tv/${mediaId}/${selectedSeason}/${selectedEpisode}`
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[80vh] bg-black/90 backdrop-blur-sm border-[#fbc9ff]/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Download {title}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {mediaType === "tv" && showDetails && (
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-2">
              <label className="text-white text-sm">Season:</label>
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(Number(e.target.value))}
                className="bg-black/50 border border-[#fbc9ff]/30 rounded px-3 py-1 text-white text-sm"
              >
                {showDetails.seasons
                  .filter(season => season.season_number > 0)
                  .map(season => (
                    <option key={season.season_number} value={season.season_number}>
                      Season {season.season_number}
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-white text-sm">Episode:</label>
              <select
                value={selectedEpisode}
                onChange={(e) => setSelectedEpisode(Number(e.target.value))}
                className="bg-black/50 border border-[#fbc9ff]/30 rounded px-3 py-1 text-white text-sm"
              >
                {Array.from({ length: showDetails.seasons.find(s => s.season_number === selectedSeason)?.episode_count || 1 }, (_, i) => i + 1).map(ep => (
                  <option key={ep} value={ep}>
                    Episode {ep}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="flex-1">
          <iframe
            src={getEmbedUrl()}
            className="w-full h-full rounded-lg border border-[#fbc9ff]/20"
            allowFullScreen
            title={`Download ${title}`}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}