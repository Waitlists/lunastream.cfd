"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { AnimePlayerSelector } from "@/components/anime-player-selector"
import { anilist, type AnimeDetails } from "@/lib/anilist"

export default function WatchAnimePage() {
  const params = useParams()
  const router = useRouter()
  const animeId = Number.parseInt(params.id as string)
  const episode = Number.parseInt(params.episode as string)

  const [anime, setAnime] = useState<AnimeDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnime = async () => {
      const data = await anilist.getAnimeDetails(animeId)
      setAnime(data)
      setLoading(false)
    }
    fetchAnime()
  }, [animeId])

  const handleClose = () => {
    router.push(`/anime/${animeId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="w-8 h-8 border-2 border-[#fbc9ff] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!anime) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <p className="text-white/60 text-lg">Anime not found</p>
        </div>
      </div>
    )
  }

  const title = anime.title.english || anime.title.romaji

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <AnimePlayerSelector
          anilistId={animeId}
          episode={episode}
          title={`${title} - Episode ${episode}`}
          totalEpisodes={anime.episodes || 1}
          onClose={handleClose}
        />
      </main>
    </div>
  )
}
