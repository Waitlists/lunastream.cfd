"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { PlayerSelector } from "@/components/player-selector"
import { tmdb, type MovieDetails } from "@/lib/tmdb"
import { storage } from "@/lib/storage"
import { createClient } from "@/lib/supabase/client"

export default function WatchMoviePage() {
  const params = useParams()
  const router = useRouter()
  const [movie, setMovie] = useState<MovieDetails | null>(null)

  useEffect(() => {
    const fetchMovie = async () => {
      const idParam = Array.isArray(params.id) ? params.id[0] : params.id
      const movieId = Number.parseInt(idParam as string)

      if (Number.isNaN(movieId)) {
        router.push("/")
        return
      }

      const movieData = await tmdb.getMovieDetails(movieId)
      setMovie(movieData)

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
            media_id: movieData.id.toString(),
            media_type: "movie",
            title: movieData.title,
            poster_path: movieData.poster_path,
            timestamp: 0,
          }),
        })
      } else {
        // Save to localStorage for guests
        storage.addWatchProgress({
          id: movieData.id,
          mediaType: "movie",
          title: movieData.title,
          posterPath: movieData.poster_path,
          lastWatched: Date.now(),
        })
      }

      // Trigger event for continue watching to update
      window.dispatchEvent(new Event("watchProgressUpdated"))
    }
    fetchMovie()
  }, [params.id, router])

  if (!movie) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <PlayerSelector
      tmdbId={movie.id}
      mediaType="movie"
      title={movie.title}
      onClose={() => router.push(`/movie/${movie.id}`)}
    />
  )
}
