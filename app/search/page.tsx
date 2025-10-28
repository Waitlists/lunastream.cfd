"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { MediaCard } from "@/components/media-card"
import { tmdb } from "@/lib/tmdb"
import { Search, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SearchPage() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [popularContent, setPopularContent] = useState<any[]>([])
  const [searchType, setSearchType] = useState<"all" | "movie" | "tv">("all")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchPopular = async () => {
      const [movies, tvShows] = await Promise.all([tmdb.getPopularMovies(), tmdb.getPopularTVShows()])
      const combined = [
        ...movies.results.slice(0, 10).map((m: any) => ({ ...m, media_type: "movie" })),
        ...tvShows.results.slice(0, 10).map((t: any) => ({ ...t, media_type: "tv" })),
      ]
      setPopularContent(combined.sort((a, b) => (b.popularity || 0) - (a.popularity || 0)))
    }
    fetchPopular()
  }, [])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const searchDebounce = setTimeout(async () => {
      setLoading(true)
      try {
        let data
        if (searchType === "all") {
          data = await tmdb.searchMulti(query)
        } else if (searchType === "movie") {
          data = await tmdb.searchMovies(query)
        } else {
          data = await tmdb.searchTVShows(query)
        }
        const filteredResults = data.results.filter(
          (r: any) => r.media_type !== "person" && (r.poster_path || r.profile_path),
        )
        // Sort by relevance based on title/name match, then by popularity
        const sortedResults = filteredResults.sort((a: any, b: any) => {
          const queryLower = query.toLowerCase()
          const aTitle = (a.title || a.name || '').toLowerCase()
          const bTitle = (b.title || b.name || '').toLowerCase()
          const aRelevance = aTitle === queryLower ? 100 : aTitle.startsWith(queryLower) ? 50 : aTitle.includes(queryLower) ? 10 : 0
          const bRelevance = bTitle === queryLower ? 100 : bTitle.startsWith(queryLower) ? 50 : bTitle.includes(queryLower) ? 10 : 0
          if (aRelevance !== bRelevance) return bRelevance - aRelevance
          return (b.popularity || 0) - (a.popularity || 0)
        })
        setResults(sortedResults)
      } catch (error) {
        console.error("[v0] Search error:", error)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(searchDebounce)
  }, [query, searchType])

  const handleSurpriseMe = async () => {
    const randomType = Math.random() > 0.5 ? "movie" : "tv"
    const randomPage = Math.floor(Math.random() * 5) + 1

    try {
      const data =
        randomType === "movie" ? await tmdb.getPopularMovies(randomPage) : await tmdb.getPopularTVShows(randomPage)

      const highRated = data.results.filter((item: any) => item.vote_average >= 7.5)
      if (highRated.length > 0) {
        const randomItem = highRated[Math.floor(Math.random() * highRated.length)]
        router.push(`/${randomType}/${randomItem.id}`)
      }
    } catch (error) {
      console.error("[v0] Surprise me error:", error)
    }
  }

  const displayContent = query.trim() ? results : popularContent

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto mb-8">
            <h1 className="text-4xl font-bold text-white mb-6 text-center">Search</h1>

            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
              <Input
                type="text"
                placeholder="Search for movies or TV shows..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-[#fbc9ff]"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <Tabs value={searchType} onValueChange={(v) => setSearchType(v as any)} className="flex-1">
                <TabsList className="grid w-full grid-cols-3 bg-white/10">
                  <TabsTrigger value="all" className="data-[state=active]:bg-[#fbc9ff] data-[state=active]:text-black">
                    All
                  </TabsTrigger>
                  <TabsTrigger
                    value="movie"
                    className="data-[state=active]:bg-[#fbc9ff] data-[state=active]:text-black"
                  >
                    Movies
                  </TabsTrigger>
                  <TabsTrigger value="tv" className="data-[state=active]:bg-[#fbc9ff] data-[state=active]:text-black">
                    TV Shows
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <Button
                onClick={handleSurpriseMe}
                className="bg-gradient-to-r from-[#fbc9ff] to-[#db97e2] hover:from-[#db97e2] hover:to-[#fbc9ff] text-black font-semibold"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Surprise Me
              </Button>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">
              {query.trim() ? (loading ? "Searching..." : `Results for "${query}"`) : "Popular Content"}
            </h2>
            {!query.trim() && <p className="text-white/60">Start typing to search for movies and TV shows</p>}
          </div>

          {displayContent.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {displayContent.map((item) => {
                const mediaType = searchType !== "all" ? searchType : item.media_type || "movie"
                const title = item.title || item.name || "Untitled"
                const year = item.release_date
                  ? new Date(item.release_date).getFullYear().toString()
                  : item.first_air_date
                    ? new Date(item.first_air_date).getFullYear().toString()
                    : undefined

                return (
                  <MediaCard
                    key={`${item.id}-${mediaType}`}
                    id={item.id}
                    title={title}
                    posterPath={item.poster_path}
                    mediaType={mediaType}
                    voteAverage={item.vote_average}
                    year={year}
                  />
                )
              })}
            </div>
          ) : query.trim() && !loading ? (
            <div className="text-center py-12">
              <p className="text-white/60 text-lg">No results found for "{query}"</p>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  )
}
