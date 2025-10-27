"use client"

import { useState } from "react"
import { X, ChevronDown } from "lucide-react"

interface AnimePlayerSelectorProps {
  anilistId: number
  episode: number
  title: string
  totalEpisodes: number
  onClose: () => void
}

type AnimePlayerType = "videasy" | "vidnest"

export function AnimePlayerSelector({ anilistId, episode, title, totalEpisodes, onClose }: AnimePlayerSelectorProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<AnimePlayerType>("videasy")
  const [isDub, setIsDub] = useState(false)
  const [isPlayerDropdownOpen, setIsPlayerDropdownOpen] = useState(false)
  const [isAudioDropdownOpen, setIsAudioDropdownOpen] = useState(false)

  const players = [
    { id: "videasy" as AnimePlayerType, name: "Videasy" },
    { id: "vidnest" as AnimePlayerType, name: "VidNest" },
  ]

  const getPlayerUrl = (): string => {
    if (selectedPlayer === "videasy") {
      // Videasy: https://player.videasy.net/anime/[ANILIST_ID]/[EPISODE]?dub=true|false
      return `https://player.videasy.net/anime/${anilistId}/${episode}${isDub ? "?dub=true" : ""}`
    } else {
      // Vidnest: https://vidnest.fun/anime/[ANILIST_ID]/[EPISODE]/[SUB_OR_DUB]
      return `https://vidnest.fun/anime/${anilistId}/${episode}/${isDub ? "dub" : "sub"}`
    }
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      <div className="absolute top-6 right-6 z-10 flex items-center space-x-4">
        {/* Sub/Dub Selector */}
        <div className="relative">
          <button
            onClick={() => setIsAudioDropdownOpen(!isAudioDropdownOpen)}
            className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-lg transition-all"
          >
            <span>{isDub ? "Dub" : "Sub"}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isAudioDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {isAudioDropdownOpen && (
            <div className="absolute top-full mt-2 right-0 bg-gray-900 rounded-lg shadow-xl overflow-hidden min-w-[100px] border border-gray-700">
              <button
                onClick={() => {
                  setIsDub(false)
                  setIsAudioDropdownOpen(false)
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-800 transition-colors ${
                  !isDub ? "bg-gradient-to-r from-[#fbc9ff] to-[#db97e2] text-black font-semibold" : "text-gray-300"
                }`}
              >
                Sub
              </button>
              <button
                onClick={() => {
                  setIsDub(true)
                  setIsAudioDropdownOpen(false)
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-800 transition-colors ${
                  isDub ? "bg-gradient-to-r from-[#fbc9ff] to-[#db97e2] text-black font-semibold" : "text-gray-300"
                }`}
              >
                Dub
              </button>
            </div>
          )}
        </div>

        {/* Player Selector */}
        <div className="relative">
          <button
            onClick={() => setIsPlayerDropdownOpen(!isPlayerDropdownOpen)}
            className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-lg transition-all"
          >
            <span>{players.find((p) => p.id === selectedPlayer)?.name}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isPlayerDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {isPlayerDropdownOpen && (
            <div className="absolute top-full mt-2 right-0 bg-gray-900 rounded-lg shadow-xl overflow-hidden min-w-[140px] border border-gray-700">
              {players.map((player) => (
                <button
                  key={player.id}
                  onClick={() => {
                    setSelectedPlayer(player.id)
                    setIsPlayerDropdownOpen(false)
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-800 transition-colors ${
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
          className="text-white hover:text-gray-300 transition-colors"
          aria-label="Close Player"
        >
          <X className="w-8 h-8" />
        </button>
      </div>

      <iframe
        key={`${selectedPlayer}-${episode}-${isDub}`}
        src={getPlayerUrl()}
        className="fixed top-0 left-0 w-full h-full border-0"
        title={title}
        allowFullScreen
        allow="encrypted-media"
      />
    </div>
  )
}
