"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { PlayerSelector } from "@/components/player-selector"
import { tmdb, type TVShowDetails } from "@/lib/tmdb"
import { storage } from "@/lib/storage"
import { createClient } from "@/lib/supabase/client"

export default function WatchTVPage() {
  const params = useParams()
  const router = useRouter()
  const [show, setShow] = useState<TVShowDetails | null>(null)

  const season = Number.parseInt(Array.isArray(params.season) ? params.season[0] : (params.season as string))
  const episode = Number.parseInt(Array.isArray(params.episode) ? params.episode[0] : (params.episode as string))

  useEffect(() => {
    const fetchShow = async () => {
      const idParam = Array.isArray(params.id) ? params.id[0] : params.id
      const tvId = Number.parseInt(idParam as string)

      if (Number.isNaN(tvId) || Number.isNaN(season) || Number.isNaN(episode)) {
        router.push("/")
        return
      }

      const showData = await tmdb.getTVShowDetails(tvId)
      setShow(showData)

      // Check if user is logged in
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Save to database for logged-in users
        await fetch("/api/continue-watching", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            media_id: showData.id.toString(),
            media_type: "tv",
            title: showData.name,
            poster_path: showData.poster_path,
            season,
            episode,
            timestamp: 0,
          }),
        })
      } else {
        // Save to localStorage for guests
        storage.addWatchProgress({
          id: showData.id,
          mediaType: "tv",
          title: showData.name,
          posterPath: showData.poster_path,
          lastWatched: Date.now(),
          season,
          episode,
        })
      }

      // Trigger event for continue watching to update
      window.dispatchEvent(new Event("watchProgressUpdated"))
    }
    fetchShow()
  }, [params.id, season, episode, router])

  if (!show) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <PlayerSelector
      tmdbId={show.id}
      mediaType="tv"
      season={season}
      episode={episode}
      title={show.name}
      onClose={() => router.push(`/tv/${show.id}`)}
    />
  )
}
