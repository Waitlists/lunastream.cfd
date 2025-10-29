"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { MediaCard } from "@/components/media-card"
import { tmdb } from "@/lib/tmdb"
import { Search, Sparkles, Filter, SortAsc, SortDesc, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface Genre {
  id: number
  name: string
}

export default function SearchPage() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [popularContent, setPopularContent] = useState<any[]>([])
  const [searchType, setSearchType] = useState<"all" | "movie" | "tv">("all")
  const [loading, setLoading] = useState(false)
  const [genres, setGenres] = useState<Genre[]>([])
  const [selectedGenres, setSelectedGenres] = useState<number[]>([])
  const [yearRange, setYearRange] = useState<[number, number]>([1900, new Date().getFullYear()])
  const [ratingRange, setRatingRange] = useState<[number, number]>([0, 10])
  const [sortBy, setSortBy] = useState<"relevance" | "popularity" | "rating" | "year" | "title">("relevance")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const [movieGenres, tvGenres] = await Promise.all([tmdb.getMovieGenres(), tmdb.getTVGenres()])
        const combinedGenres = [...movieGenres.genres, ...tvGenres.genres]
        const uniqueGenres = combinedGenres.filter(
          (genre, index, self) => self.findIndex(g => g.id === genre.id) === index
        )
        setGenres(uniqueGenres.sort((a, b) => a.name.localeCompare(b.name)))
      } catch (error) {
        console.error("Error fetching genres:", error)
      }
    }
    fetchGenres()
  }, [])

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
      setCurrentPage(1)
      setTotalPages(1)
      return
    }

    const searchDebounce = setTimeout(async () => {
      setLoading(true)
      try {
        let data
        if (searchType === "all") {
          data = await tmdb.searchMulti(query, currentPage)
        } else if (searchType === "movie") {
          data = await tmdb.searchMovies(query, currentPage)
        } else {
          data = await tmdb.searchTVShows(query, currentPage)
        }

        let filteredResults = data.results.filter(
          (r: any) => r.media_type !== "person" && (r.poster_path || r.profile_path),
        )

        // Apply filters
        if (selectedGenres.length > 0) {
          filteredResults = filteredResults.filter((r: any) =>
            r.genre_ids?.some((id: number) => selectedGenres.includes(id))
          )
        }

        const getYear = (item: any) => {
          const date = item.release_date || item.first_air_date
          return date ? new Date(date).getFullYear() : 0
        }

        filteredResults = filteredResults.filter((r: any) => {
          const year = getYear(r)
          const rating = r.vote_average || 0
          return year >= yearRange[0] && year <= yearRange[1] && rating >= ratingRange[0] && rating <= ratingRange[1]
        })

        // Apply sorting
        filteredResults = sortResults(filteredResults, sortBy, sortOrder)

        setResults(filteredResults)
        setTotalPages(data.total_pages || 1)
      } catch (error) {
        console.error("[v0] Search error:", error)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(searchDebounce)
  }, [query, searchType, selectedGenres, yearRange, ratingRange, sortBy, sortOrder, currentPage])

  const sortResults = (results: any[], sortBy: string, sortOrder: "asc" | "desc") => {
    return results.sort((a, b) => {
      let aValue, bValue

      switch (sortBy) {
        case "relevance":
          // TMDB returns results in relevance order by default
          return 0
        case "popularity":
          aValue = a.popularity || 0
          bValue = b.popularity || 0
          break
        case "rating":
          aValue = a.vote_average || 0
          bValue = b.vote_average || 0
          break
        case "year":
          aValue = new Date(a.release_date || a.first_air_date || "1900-01-01").getFullYear()
          bValue = new Date(b.release_date || b.first_air_date || "1900-01-01").getFullYear()
          break
        case "title":
          aValue = (a.title || a.name || "").toLowerCase()
          bValue = (b.title || b.name || "").toLowerCase()
          break
        default:
          return 0
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
      }
    })
  }

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

  const clearFilters = () => {
    setSelectedGenres([])
    setYearRange([1900, new Date().getFullYear()])
    setRatingRange([0, 10])
    setSortBy("relevance")
    setSortOrder("desc")
  }

  const displayContent = query.trim() ? results : popularContent

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (selectedGenres.length > 0) count++
    if (yearRange[0] !== 1900 || yearRange[1] !== new Date().getFullYear()) count++
    if (ratingRange[0] !== 0 || ratingRange[1] !== 10) count++
    if (sortBy !== "relevance" || sortOrder !== "desc") count++
    return count
  }, [selectedGenres, yearRange, ratingRange, sortBy, sortOrder])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto mb-8">
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

            <div className="flex items-center justify-between gap-4 mb-4">
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

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-2 bg-[#fbc9ff] text-black">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>

                <Button
                  onClick={handleSurpriseMe}
                  className="bg-gradient-to-r from-[#fbc9ff] to-[#db97e2] hover:from-[#db97e2] hover:to-[#fbc9ff] text-black font-semibold"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Surprise Me
                </Button>
              </div>
            </div>

            <Collapsible open={showFilters} onOpenChange={setShowFilters}>
              <CollapsibleContent className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10 mb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Filters & Sorting</h3>
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-white/60 hover:text-white">
                    Clear All
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Genres */}
                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">Genres</label>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {genres.slice(0, 10).map((genre) => (
                        <div key={genre.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`genre-${genre.id}`}
                            checked={selectedGenres.includes(genre.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedGenres([...selectedGenres, genre.id])
                              } else {
                                setSelectedGenres(selectedGenres.filter(id => id !== genre.id))
                              }
                            }}
                          />
                          <label htmlFor={`genre-${genre.id}`} className="text-sm text-white/80 cursor-pointer">
                            {genre.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Year Range */}
                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">
                      Year: {yearRange[0]} - {yearRange[1]}
                    </label>
                    <Slider
                      value={yearRange}
                      onValueChange={(value) => setYearRange(value as [number, number])}
                      min={1900}
                      max={new Date().getFullYear()}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Rating Range */}
                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">
                      Rating: {ratingRange[0].toFixed(1)} - {ratingRange[1].toFixed(1)}
                    </label>
                    <Slider
                      value={ratingRange}
                      onValueChange={(value) => setRatingRange(value as [number, number])}
                      min={0}
                      max={10}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  {/* Sort */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white block">Sort By</label>
                    <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Relevance</SelectItem>
                        <SelectItem value="popularity">Popularity</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                        <SelectItem value="year">Year</SelectItem>
                        <SelectItem value="title">Title</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex gap-1">
                      <Button
                        variant={sortOrder === "asc" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSortOrder("asc")}
                        className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                      >
                        <SortAsc className="w-3 h-3" />
                      </Button>
                      <Button
                        variant={sortOrder === "desc" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSortOrder("desc")}
                        className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                      >
                        <SortDesc className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">
              {query.trim() ? (loading ? "Searching..." : `Results for "${query}"`) : "Popular Content"}
            </h2>
            {!query.trim() && <p className="text-white/60">Start typing to search for movies and TV shows</p>}
          </div>

          {displayContent.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
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

              {query.trim() && totalPages > 1 && (
                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    Previous
                  </Button>
                  <span className="text-white/60 self-center">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : query.trim() && !loading ? (
            <div className="text-center py-12">
              <p className="text-white/60 text-lg">No results found for "{query}"</p>
              <p className="text-white/40 text-sm mt-2">Try adjusting your filters or search terms</p>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  )
}
