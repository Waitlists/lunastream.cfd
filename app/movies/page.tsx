"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { MediaCard } from "@/components/media-card"
import { tmdb, type Movie } from "@/lib/tmdb"
import { Button } from "@/components/ui/button"

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true)
      const data = await tmdb.getPopularMovies(page)
      setMovies((prev) => (page === 1 ? data.results : [...prev, ...data.results]))
      setHasMore(data.page < data.total_pages)
      setLoading(false)
    }
    fetchMovies()
  }, [page])

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-white mb-8">Popular Movies</h1>

          {movies.length === 0 && loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-[#fbc9ff] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {movies.map((movie) => (
                  <MediaCard
                    key={movie.id}
                    id={movie.id}
                    title={movie.title}
                    posterPath={movie.poster_path}
                    mediaType="movie"
                    voteAverage={movie.vote_average}
                    year={movie.release_date ? new Date(movie.release_date).getFullYear().toString() : undefined}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-8">
                  <Button onClick={loadMore} disabled={loading} className="bg-[#fbc9ff] text-black hover:bg-[#db97e2]">
                    {loading ? "Loading..." : "Load More"}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
