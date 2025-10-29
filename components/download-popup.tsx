"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { tmdb, type TVShowDetails, type Season, type Episode } from "@/lib/tmdb"

interface DownloadPopupProps {
  isOpen: boolean
  onClose: () => void
  mediaType: "movie" | "tv"
  mediaId: number
  title: string
}

export function DownloadPopup({ isOpen, onClose, mediaType, mediaId, title }: DownloadPopupProps) {
  const [selectedSeason, setSelectedSeason] = useState(1)
  const [selectedEpisode, setSelectedEpisode] = useState(1)
  const [seasons, setSeasons] = useState<Season[]>([])
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && mediaType === "tv") {
      fetchSeasons()
    }
  }, [isOpen, mediaType, mediaId])

  useEffect(() => {
    if (mediaType === "tv" && selectedSeason) {
      fetchEpisodes(selectedSeason)
    }
  }, [selectedSeason])

  const fetchSeasons = async () => {
    try {
      const showDetails = await tmdb.getTVShowDetails(mediaId)
      setSeasons(showDetails.seasons.filter(season => season.season_number > 0))
    } catch (error) {
      console.error("Failed to fetch seasons:", error)
    }
  }

  const fetchEpisodes = async (seasonNumber: number) => {
    try {
      setLoading(true)
      const seasonDetails = await tmdb.getSeasonDetails(mediaId, seasonNumber)
      setEpisodes(seasonDetails.episodes || [])
    } catch (error) {
      console.error("Failed to fetch episodes:", error)
    } finally {
      setLoading(false)
    }
  }

  const getEmbedUrl = () => {
    if (mediaType === "movie") {
      return `https://dl.vidsrc.vip/movie/${mediaId}`
    } else {
      return `https://dl.vidsrc.vip/tv/${mediaId}/${selectedSeason}/${selectedEpisode}`
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[80vh] bg-black/90 backdrop-blur-sm border-white/20">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-white">Download {title}</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/10"
          >
            <X className="w-6 h-6" />
          </Button>
        </DialogHeader>

        {mediaType === "tv" && (
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label className="text-white text-sm mb-2 block">Season</label>
              <Select value={selectedSeason.toString()} onValueChange={(value) => setSelectedSeason(Number(value))}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-white/20">
                  {seasons.map((season) => (
                    <SelectItem key={season.id} value={season.season_number.toString()} className="text-white">
                      Season {season.season_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-white text-sm mb-2 block">Episode</label>
              <Select value={selectedEpisode.toString()} onValueChange={(value) => setSelectedEpisode(Number(value))}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-white/20">
                  {episodes.map((episode) => (
                    <SelectItem key={episode.id} value={episode.episode_number.toString()} className="text-white">
                      Episode {episode.episode_number}: {episode.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div className="flex-1">
          <iframe
            src={getEmbedUrl()}
            className="w-full h-full rounded-lg"
            allowFullScreen
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}