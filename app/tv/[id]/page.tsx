"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { TrailerBackground } from "@/components/trailer-background"
import { CastList } from "@/components/cast-list"
import { SeasonSelector } from "@/components/season-selector"
import { EpisodeList } from "@/components/episode-list"
import { EpisodeRatingChart } from "@/components/episode-rating-chart"
import { DownloadPopup } from "@/components/download-popup"
import { tmdb, type TVShowDetails, type Episode } from "@/lib/tmdb"
import Image from "next/image"
import Link from "next/link"
import { Play, Calendar, Star, Tv, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TVShowPage() {
  const params = useParams()
  const [show, setShow] = useState<TVShowDetails | null>(null)
  const [currentSeason, setCurrentSeason] = useState(1)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDownloadOpen, setIsDownloadOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const idParam = Array.isArray(params.id) ? params.id[0] : params.id
        const tvId = Number.parseInt(idParam as string)

        if (Number.isNaN(tvId) || tvId <= 0) {
          setError("Invalid TV show ID")
          setLoading(false)
          return
        }

        const [showData] = await Promise.all([
          tmdb.getTVShowDetails(tvId),
        ])
        setShow(showData)
        setCurrentSeason(1)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching TV show:", err)
        setError("Failed to load TV show")
        setLoading(false)
      }
    }
    fetchData()
  }, [params.id])

  useEffect(() => {
    if (!show) return
    const fetchEpisodes = async () => {
      try {
        const seasonData = await tmdb.getSeasonDetails(show.id, currentSeason)
        setEpisodes(seasonData.episodes || [])
      } catch (err) {
        console.error("Error fetching episodes:", err)
        setEpisodes([])
      }
    }
    fetchEpisodes()
  }, [show, currentSeason])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    )
  }

  if (error || !show) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">{error || "TV show not found"}</h1>
            <Link href="/" className="text-[#fbc9ff] hover:underline">
              Go back home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const trailer = show.videos?.results?.find((v) => v.type === "Trailer" && v.site === "YouTube")

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      <Navbar />

      <main className="pt-16">
        <div className="relative h-[80vh] w-full overflow-hidden">
          <TrailerBackground trailerKey={trailer?.key || null} title={show.name} />

          {!trailer && (
            <>
              <Image
                src={tmdb.getImageUrl(show.backdrop_path, "original") || "/placeholder.svg"}
                alt={show.name}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />
            </>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <div className="max-w-6xl">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-none w-[200px] hidden md:block">
                  <Image
                    src={tmdb.getImageUrl(show.poster_path) || "/placeholder.svg"}
                    alt={show.name}
                    width={200}
                    height={300}
                    className="rounded-lg shadow-2xl"
                  />
                </div>

                <div className="flex-1">
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">{show.name}</h1>

                  <div className="flex flex-wrap items-center gap-3 text-white/80 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(show.first_air_date).getFullYear()}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1.5">
                      <Tv className="w-4 h-4" />
                      <span>
                        {show.number_of_seasons} Season{show.number_of_seasons !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 fill-[#fbc9ff] text-[#fbc9ff]" />
                      <span className="text-[#fbc9ff] font-semibold">{show.vote_average.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {show.genres.map((genre) => (
                      <span
                        key={genre.id}
                        className="px-3 py-1 bg-white/10 rounded-full text-sm text-white backdrop-blur-sm"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>

                  <p className="text-lg text-white/90 mb-6 max-w-3xl text-pretty leading-relaxed">{show.overview}</p>

                  <div className="flex gap-3">
                    <Link href={`/watch/tv/${show.id}/1/1`}>
                      <Button size="lg" className="bg-[#fbc9ff] hover:bg-[#db97e2] text-black font-semibold">
                        <Play className="w-5 h-5 mr-2 fill-black" />
                        Play Now
                      </Button>
                    </Link>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-[#fbc9ff] text-[#fbc9ff] hover:bg-[#fbc9ff] hover:text-black font-semibold"
                      onClick={() => setIsDownloadOpen(true)}
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 space-y-12">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Episodes</h2>
              <div className="flex items-center gap-3">
                <EpisodeRatingChart tvId={show.id} totalSeasons={show.number_of_seasons} />
                <SeasonSelector
                  seasons={show.seasons}
                  currentSeason={currentSeason}
                  onSeasonChange={setCurrentSeason}
                />
              </div>
            </div>
            <EpisodeList episodes={episodes} tvId={show.id} seasonNumber={currentSeason} />
          </div>

          <CastList cast={show.credits.cast} />
        </div>
      </main>

      <DownloadPopup
        isOpen={isDownloadOpen}
        onClose={() => setIsDownloadOpen(false)}
        mediaType="tv"
        mediaId={show.id}
        title={show.name}
      />
    </div>
  )
}
