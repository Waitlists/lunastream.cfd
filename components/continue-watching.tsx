"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"
import { storage, type WatchProgress } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { tmdb } from "@/lib/tmdb"
import { createClient } from "@/lib/supabase/client"
import { DownloadPopup } from "@/components/download-popup"

interface ContinueWatchingProps {
  showTitle?: boolean
}

interface DBWatchProgress {
  id: string
  media_id: string
  media_type: string
  title: string
  poster_path: string | null
  episode: number | null
  season: number | null
  timestamp: number
  duration: number | null
  updated_at: string
}

export function ContinueWatching({ showTitle = true }: ContinueWatchingProps) {
  const [watchList, setWatchList] = useState<WatchProgress[]>([])
  const [user, setUser] = useState<any>(null)
  const [downloadPopup, setDownloadPopup] = useState<{
    isOpen: boolean
    mediaId: number
    mediaType: "movie" | "tv"
    title: string
    season?: number
    episode?: number
  } | null>(null)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    // Check if user is logged in
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        loadFromDatabase()
      } else {
        loadFromLocalStorage()
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadFromDatabase()
      } else {
        loadFromLocalStorage()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadFromDatabase = async () => {
    try {
      const response = await fetch("/api/continue-watching")
      if (response.ok) {
        const data: DBWatchProgress[] = await response.json()

        // Group by media_id and media_type, keeping only the most recent entry for each show/movie
        const grouped = data.reduce((acc, item) => {
          const key = `${item.media_type}-${item.media_id}`
          if (!acc[key] || new Date(item.updated_at) > new Date(acc[key].updated_at)) {
            acc[key] = item
          }
          return acc
        }, {} as Record<string, DBWatchProgress>)

        const uniqueData = Object.values(grouped)

        const formatted: WatchProgress[] = uniqueData.map((item) => ({
          id: Number.parseInt(item.media_id),
          mediaType: item.media_type as "movie" | "tv",
          title: item.title,
          posterPath: item.poster_path || "",
          episode: item.episode || undefined,
          season: item.season || undefined,
          timestamp: item.timestamp,
          duration: item.duration || undefined,
          lastWatched: new Date(item.updated_at).getTime(),
        }))
        setWatchList(formatted)
      }
    } catch (error) {
      console.error("Failed to load continue watching from database:", error)
    }
  }

  const loadFromLocalStorage = () => {
    const allProgress = storage.getWatchProgress()
    const validProgress = allProgress.filter((item) => !Number.isNaN(item.id) && item.id > 0)

    // For TV shows, keep only the most recent episode per show
    const uniqueProgress = validProgress.reduce((acc, item) => {
      const key = `${item.mediaType}-${item.id}`
      const existing = acc.find((existingItem) => `${existingItem.mediaType}-${existingItem.id}` === key)

      if (!existing) {
        acc.push(item)
      } else if (item.mediaType === "tv" && existing.mediaType === "tv") {
        // For TV shows, compare season and episode to keep the most recent
        const existingSeason = existing.season || 0
        const existingEpisode = existing.episode || 0
        const itemSeason = item.season || 0
        const itemEpisode = item.episode || 0

        if (itemSeason > existingSeason || (itemSeason === existingSeason && itemEpisode > existingEpisode)) {
          // Replace with more recent episode
          const index = acc.indexOf(existing)
          acc[index] = item
        }
      } else if (item.lastWatched > existing.lastWatched) {
        // For movies or same type, keep the most recently watched
        const index = acc.indexOf(existing)
        acc[index] = item
      }

      return acc
    }, [] as WatchProgress[])

    setWatchList(uniqueProgress)
  }

  useEffect(() => {
    if (!user) {
      const handleStorageChange = () => loadFromLocalStorage()
      window.addEventListener("storage", handleStorageChange)
      window.addEventListener("watchProgressUpdated" as any, handleStorageChange)

      return () => {
        window.removeEventListener("storage", handleStorageChange)
        window.removeEventListener("watchProgressUpdated" as any, handleStorageChange)
      }
    } else {
      // For logged-in users, refresh from database when watch progress updates
      const handleStorageChange = () => loadFromDatabase()
      window.addEventListener("watchProgressUpdated" as any, handleStorageChange)

      return () => {
        window.removeEventListener("watchProgressUpdated" as any, handleStorageChange)
      }
    }
  }, [user])

  const handleRemove = async (id: number, mediaType: "movie" | "tv") => {
    if (user) {
      try {
        await fetch(`/api/continue-watching?media_id=${id}&media_type=${mediaType}`, {
          method: "DELETE",
        })
        loadFromDatabase()
      } catch (error) {
        console.error("Failed to remove from database:", error)
      }
    } else {
      storage.removeWatchProgress(id, mediaType)
      loadFromLocalStorage()
    }
  }

  const handleDownload = (item: WatchProgress) => {
    setDownloadPopup({
      isOpen: true,
      mediaId: item.id,
      mediaType: item.mediaType,
      title: item.title,
      season: item.season,
      episode: item.episode,
    })
  }

  if (watchList.length === 0) {
    return (
      <div className="mb-12">
        {showTitle && <h2 className="text-2xl font-bold text-white mb-4">Download</h2>}
        <div className="text-center py-12">
          <p className="text-white/60 text-lg">Watch stuff to fill up your download list</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-12">
      {showTitle && <h2 className="text-2xl font-bold text-white mb-4">Download</h2>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {watchList.map((item) => (
          <div key={`${item.mediaType}-${item.id}`} className="relative group">
            <button
              onClick={() => handleDownload(item)}
              className="relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-white/5 hover:ring-2 hover:ring-[#fbc9ff] transition-all duration-300 hover:scale-105 hover:-translate-y-2 hover:shadow-[0_8px_30px_rgba(251,201,255,0.4)]"
            >
              {item.posterPath ? (
                <Image
                  src={tmdb.getImageUrl(item.posterPath, "w500") || "/placeholder.svg"}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/20">No Image</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="text-white text-sm font-medium line-clamp-2 group-hover:text-[#fbc9ff] transition-colors">
                  {item.title}
                </h3>
                {item.season && item.episode && (
                  <p className="text-xs text-white/80 mt-1">
                    S{item.season} E{item.episode}
                  </p>
                )}
              </div>
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 w-6 h-6 bg-black/70 hover:bg-black/90 text-white opacity-0 group-hover:opacity-100 transition-all z-10 hover:scale-125 hover:rotate-90"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleRemove(item.id, item.mediaType)
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {downloadPopup && (
        <DownloadPopup
          isOpen={downloadPopup.isOpen}
          onClose={() => setDownloadPopup(null)}
          mediaId={downloadPopup.mediaId}
          mediaType={downloadPopup.mediaType}
          title={downloadPopup.title}
          season={downloadPopup.season}
          episode={downloadPopup.episode}
        />
      )}
    </div>
  )
}
