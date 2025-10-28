"use client"

import { useState, useEffect } from "react"
import { X, ChevronDown } from "lucide-react"
import { trackWatch } from "@/lib/track-statistics"

interface PlayerSelectorProps {
  tmdbId: string | number
  mediaType: "movie" | "tv"
  season?: number
  episode?: number
  title: string
  onClose: () => void
}

type PlayerType =
  | "videasy"
  | "vidify"
  | "vidplus"
  | "vidfast"
  | "mapple"
  | "vidsrc.cc"
  | "vidsrc.xyz"
  | "vidzee"
  | "vidora"
  | "vidlink"
  | "vidrock"
  | "autoembed"
  | "smashystream"
  | "moviesapi"
  | "letsembed"
  | "vidplay"
  | "vidnest"
  | "cinemaos"
  | "spenembed"
  | "vidking"
  | "111movies"
  | "vixsrc"
  | "vidsrc.cx"
  | "xprime"
  | "bludclart"
  | "vidup"

export function PlayerSelector({ tmdbId, mediaType, season, episode, title, onClose }: PlayerSelectorProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerType>("videasy")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const players = [
    { id: "xprime" as PlayerType, name: "XPrime" },
    { id: "videasy" as PlayerType, name: "Videasy" },
    { id: "vidify" as PlayerType, name: "Vidify" },
    { id: "vidplus" as PlayerType, name: "VidPlus" },
    { id: "vidfast" as PlayerType, name: "VidFast" },
    { id: "mapple" as PlayerType, name: "Mapple" },
    { id: "vidsrc.cc" as PlayerType, name: "vidsrc.cc" },
    { id: "vidsrc.xyz" as PlayerType, name: "vidsrc.xyz" },
    { id: "vidzee" as PlayerType, name: "VidZee" },
    { id: "vidora" as PlayerType, name: "Vidora" },
    { id: "vidlink" as PlayerType, name: "VidLink" },
    { id: "vidrock" as PlayerType, name: "VidRock" },
    { id: "autoembed" as PlayerType, name: "AutoEmbed" },
    { id: "smashystream" as PlayerType, name: "SmashyStream" },
    { id: "moviesapi" as PlayerType, name: "MoviesAPI" },
    { id: "letsembed" as PlayerType, name: "LetsEmbed" },
    { id: "vidplay" as PlayerType, name: "VidPlay" },
    { id: "vidnest" as PlayerType, name: "VidNest" },
    { id: "cinemaos" as PlayerType, name: "CinemaOS" },
    { id: "spenembed" as PlayerType, name: "SpenEmbed" },
    { id: "vidking" as PlayerType, name: "VidKing" },
    { id: "111movies" as PlayerType, name: "111Movies" },
    { id: "vixsrc" as PlayerType, name: "VixSrc" },
    { id: "vidsrc.cx" as PlayerType, name: "Vidsrc.cx" },
    { id: "bludclart" as PlayerType, name: "BludClart" },
    { id: "vidup" as PlayerType, name: "VidUp" },
  ]

  useEffect(() => {
    trackWatch()

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "MEDIA_DATA") {
        const mediaData = event.data.data
        if (mediaData.id && (mediaData.type === "movie" || mediaData.type === "tv")) {
          const watchProgress = JSON.parse(localStorage.getItem("watch_progress") || "{}")
          watchProgress[mediaData.id] = {
            ...watchProgress[mediaData.id],
            ...mediaData,
            last_updated: Date.now(),
          }
          localStorage.setItem("watch_progress", JSON.stringify(watchProgress))
        }
      }

      if (event.data?.type === "PLAYER_EVENT") {
        const { event: eventType, currentTime, duration } = event.data.data
        console.log(`[v0] Player ${eventType} at ${currentTime}s of ${duration}s`)
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  const getPlayerUrl = (): string => {
    const color = "fbc9ff"

    if (mediaType === "movie") {
      switch (selectedPlayer) {
        case "videasy":
          return `https://player.videasy.net/movie/${tmdbId}?color=${color}&chromecast=false&nextEpisode=true&autoplayNextEpisode=true`
        case "vidify":
          return `https://player.vidify.top/embed/movie/${tmdbId}?primarycolor=${color}&chromecast=false&poster=true`
        case "vidplus":
          return `https://player.vidplus.to/embed/movie/${tmdbId}?primarycolor=${color}&chromecast=false&nextButton=true&autoNext=true`
        case "vidfast":
          return `https://vidfast.pro/movie/${tmdbId}?theme=${color}&chromecast=false&nextButton=true&autoNext=true&poster=true`
        case "mapple":
          return `https://mapple.uk/watch/movie/${tmdbId}?theme=${color}&autoPlay=true&nextButton=true`
        case "vidzee":
          return `https://player.vidzee.wtf/embed/movie/${tmdbId}`
        case "vidora":
          return `https://vidora.su/movie/${tmdbId}?colour=${color}&autonextepisode=true&pausescreen=true`
        case "vidlink":
          return `https://vidlink.pro/movie/${tmdbId}?primaryColor=${color}&secondaryColor=a2a2a2&iconColor=eefdec&autoplay=false&nextbutton=true`
        case "vidrock":
          return `https://vidrock.net/movie/${tmdbId}?theme=${color}&autoplay=false&autonext=true&download=true&nextbutton=true`
        case "autoembed":
          return `https://player.autoembed.cc/embed/movie/${tmdbId}`
        case "vidsrc.cc":
          return `https://vidsrc.cc/v3/embed/movie/${tmdbId}?poster=1&autoPlay=false`
        case "vidsrc.xyz":
          return `https://vidsrc.xyz/embed/movie/${tmdbId}?autoplay=1`
        case "smashystream":
          return `https://player.smashy.stream/movie/${tmdbId}`
        case "moviesapi":
          return `https://moviesapi.club/movie/${tmdbId}`
        case "letsembed":
          return `https://letsembed.cc/embed/movie/?id=${tmdbId}`
        case "vidplay":
          return `https://vidplay.to/movie/${tmdbId}`
        case "vidnest":
          return `https://vidnest.fun/movie/${tmdbId}`
        case "cinemaos":
          return `https://cinemaos.tech/player/${tmdbId}`
        case "spenembed":
          return `https://spencerdevs.xyz/movie/${tmdbId}?theme=${color}`
        case "vidking":
          return `https://www.vidking.net/embed/movie/${tmdbId}?color=${color}&autoPlay=true`
        case "111movies":
          return `https://111movies.com/movie/${tmdbId}`
        case "vixsrc":
          return `https://vixsrc.to/movie/${tmdbId}?primaryColor=B20710&secondaryColor=170000&autoplay=false&startAt=0&lang=en`
        case "vidsrc.cx":
          return `https://vidsrc.cx/embed/movie/${tmdbId}`
        case "xprime":
          return `https://xprime.tv/watch/${tmdbId}`
        case "bludclart":
          return `https://watch.bludclart.com/movie/${tmdbId}/watch`
        case "vidup":
          return `https://vidup.to/movie/${tmdbId}?autoPlay=true`
        default:
          return `https://player.videasy.net/movie/${tmdbId}?color=${color}&chromecast=false`
      }
    } else {
      switch (selectedPlayer) {
        case "videasy":
          return `https://player.videasy.net/tv/${tmdbId}/${season}/${episode}?color=${color}&chromecast=false&nextEpisode=true&autoplayNextEpisode=true`
        case "vidify":
          return `https://player.vidify.top/embed/tv/${tmdbId}/${season}/${episode}?primarycolor=${color}&chromecast=false&poster=true`
        case "vidplus":
          return `https://player.vidplus.to/embed/tv/${tmdbId}/${season}/${episode}?primarycolor=${color}&chromecast=false&nextButton=true&autoNext=true`
        case "vidfast":
          return `https://vidfast.pro/tv/${tmdbId}/${season}/${episode}?theme=${color}&chromecast=false&nextButton=true&autoNext=true&poster=true`
        case "mapple":
          return `https://mapple.uk/watch/tv/${tmdbId}-${season}-${episode}?theme=${color}&autoPlay=true&nextButton=true&autoNext=true`
        case "vidzee":
          return `https://player.vidzee.wtf/embed/tv/${tmdbId}/${season}/${episode}`
        case "vidora":
          return `https://vidora.su/tv/${tmdbId}/${season}/${episode}?colour=${color}&autonextepisode=true&pausescreen=true`
        case "vidlink":
          return `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}?primaryColor=${color}&secondaryColor=a2a2a2&iconColor=eefdec&autoplay=false&nextbutton=true`
        case "vidrock":
          return `https://vidrock.net/tv/${tmdbId}/${season}/${episode}?theme=${color}&autoplay=false&autonext=true&download=true&nextbutton=true`
        case "autoembed":
          return `https://player.autoembed.cc/embed/tv/${tmdbId}/${season}/${episode}`
        case "vidsrc.cc":
          return `https://vidsrc.cc/v3/embed/tv/${tmdbId}/${season}/${episode}?poster=1&autoPlay=false`
        case "vidsrc.xyz":
          return `https://vidsrc.xyz/embed/tv/${tmdbId}/${season}-${episode}?autoplay=1&autonext=1`
        case "smashystream":
          return `https://player.smashy.stream/tv/${tmdbId}/${season}/${episode}`
        case "moviesapi":
          return `https://moviesapi.club/tv/${tmdbId}/${season}/${episode}`
        case "letsembed":
          return `https://letsembed.cc/embed/tv/?id=${tmdbId}/${season}/${episode}`
        case "vidplay":
          return `https://vidplay.to/series/${tmdbId}/${season}/${episode}`
        case "vidnest":
          return `https://vidnest.fun/tv/${tmdbId}/${season}/${episode}`
        case "cinemaos":
          return `https://cinemaos.tech/player/${tmdbId}/${season}/${episode}`
        case "spenembed":
          return `https://spencerdevs.xyz/tv/${tmdbId}/${season}/${episode}?theme=${color}`
        case "vidking":
          return `https://www.vidking.net/embed/tv/${tmdbId}/${season}/${episode}?color=${color}&autoPlay=true&nextEpisode=true&episodeSelector=true`
        case "111movies":
          return `https://111movies.com/tv/${tmdbId}/${season}/${episode}`
        case "vixsrc":
          return `https://vixsrc.to/tv/${tmdbId}/${season}/${episode}?primaryColor=B20710&secondaryColor=170000&autoplay=false&startAt=0&lang=en`
        case "vidsrc.cx":
          return `https://vidsrc.cx/embed/tv/${tmdbId}/${season}/${episode}`
        case "xprime":
          return `https://xprime.tv/watch/${tmdbId}/${season}/${episode}`
        case "bludclart":
          return `https://watch.bludclart.com/tv/${tmdbId}/${season}/${episode}`
        case "vidup":
          return `https://vidup.to/tv/${tmdbId}/${season}/${episode}?autoPlay=true`
        default:
          return `https://player.videasy.net/tv/${tmdbId}/${season}/${episode}?color=${color}&chromecast=false`
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      <div className="absolute top-6 right-6 z-10 flex items-center space-x-4">
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-5 py-3 rounded-lg transition-all active:scale-95"
          >
            <span className="font-medium">{players.find((p) => p.id === selectedPlayer)?.name}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full mt-2 right-0 bg-gray-900 rounded-lg shadow-xl overflow-y-auto max-h-[400px] min-w-[160px] border border-gray-700">
              {players.map((player) => (
                <button
                  key={player.id}
                  onClick={() => {
                    setSelectedPlayer(player.id)
                    setIsDropdownOpen(false)
                  }}
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-800 transition-colors active:scale-95 ${
                    selectedPlayer === player.id
                      ? "bg-gradient-to-r from-[#fbc9ff] to-[#db97e2] text-black font-semibold"
                      : "text-gray-300"
                  }`}
                >
                  {player.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="text-white hover:text-gray-300 transition-all active:scale-95 p-2 hover:bg-white/10 rounded-lg"
          aria-label="Close Player"
        >
          <X className="w-8 h-8" />
        </button>
      </div>

      <iframe
        key={selectedPlayer}
        src={getPlayerUrl()}
        className="fixed top-0 left-0 w-full h-full border-0"
        title={title}
        allowFullScreen
        allow="encrypted-media"
      />
    </div>
  )
}
