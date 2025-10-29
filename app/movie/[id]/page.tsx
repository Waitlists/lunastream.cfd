"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { TrailerBackground } from "@/components/trailer-background"
import { CastList } from "@/components/cast-list"
import { DownloadPopup } from "@/components/download-popup"
import { tmdb } from "@/lib/tmdb"
import Image from "next/image"
import Link from "next/link"
import { Play, Clock, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function MoviePage() {
  const params = useParams()
  const [movie, setMovie] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDownloadOpen, setIsDownloadOpen] = useState(false)

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const idParam = Array.isArray(params.id) ? params.id[0] : params.id
        const movieId = Number.parseInt(idParam as string)

        if (Number.isNaN(movieId) || movieId <= 0) {
          setError("Invalid movie ID")
          setLoading(false)
          return
        }

        const movieData = await tmdb.getMovieDetails(movieId)
        setMovie(movieData)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching movie:", err)
        setError("Failed to load movie")
        setLoading(false)
      }
    }
    fetchMovie()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    )
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">{error || "Movie not found"}</h1>
            <Link href="/" className="text-[#fbc9ff] hover:underline">
              Go back home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const trailer = movie.videos.results.find((v) => v.type === "Trailer" && v.site === "YouTube")

  const hours = Math.floor(movie.runtime / 60)
  const minutes = movie.runtime % 60

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-16">
        <div className="relative h-[80vh] w-full overflow-hidden">
          <TrailerBackground trailerKey={trailer?.key || null} title={movie.title} />

          {!trailer && (
            <>
              <Image
                src={tmdb.getImageUrl(movie.backdrop_path, "original") || "/placeholder.svg"}
                alt={movie.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />
            </>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <div className="container mx-auto">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-none w-[200px] hidden md:block">
                  <Image
                    src={tmdb.getImageUrl(movie.poster_path) || "/placeholder.svg"}
                    alt={movie.title}
                    width={200}
                    height={300}
                    className="rounded-lg shadow-2xl"
                  />
                </div>

                <div className="flex-1">
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{movie.title}</h1>
                  <div className="flex items-center gap-4 text-white/80 mb-4">
                    <span>{new Date(movie.release_date).getFullYear()}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        {hours}h {minutes}m
                      </span>
                    </div>
                    <span>•</span>
                    <span className="text-[#fbc9ff]">★ {movie.vote_average.toFixed(1)}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {movie.genres.map((genre) => (
                      <span key={genre.id} className="px-3 py-1 bg-white/10 rounded-full text-sm text-white">
                        {genre.name}
                      </span>
                    ))}
                  </div>

                  <p className="text-lg text-white/90 mb-6 max-w-3xl text-pretty">{movie.overview}</p>

                  <div className="flex gap-3">
                    <Link href={`/watch/movie/${movie.id}`}>
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
          <CastList cast={movie.credits.cast} />
        </div>
      </main>

      <DownloadPopup
        isOpen={isDownloadOpen}
        onClose={() => setIsDownloadOpen(false)}
        mediaType="movie"
        mediaId={movie.id}
        title={movie.title}
      />
    </div>
  )
}
