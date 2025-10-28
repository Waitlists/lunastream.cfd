import { Navbar } from "@/components/navbar"
import { TrailerBackground } from "@/components/trailer-background"
import { CastList } from "@/components/cast-list"
import { tmdb } from "@/lib/tmdb"
import Image from "next/image"
import Link from "next/link"
import { Play, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { notFound } from "next/navigation"

export default async function MoviePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const movieId = Number.parseInt(id)

  if (Number.isNaN(movieId) || movieId <= 0) {
    notFound()
  }

  const [movie] = await Promise.all([
    tmdb.getMovieDetails(movieId),
  ])

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

                  <Link href={`/watch/movie/${movie.id}`}>
                    <Button size="lg" className="bg-[#fbc9ff] hover:bg-[#db97e2] text-black font-semibold">
                      <Play className="w-5 h-5 mr-2 fill-black" />
                      Play Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 space-y-12">
          <CastList cast={movie.credits.cast} />
        </div>
      </main>
    </div>
  )
}
