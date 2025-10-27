"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { X, Search, ChevronDown } from "lucide-react"
import { tmdb, type Movie, type TVShow } from "@/lib/tmdb"
import { anilist, type Anime } from "@/lib/anilist"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface SearchOverlayProps {
  isOpen: boolean
  onClose: () => void
  initialQuery?: string
}

export function SearchOverlay({ isOpen, onClose, initialQuery = "" }: SearchOverlayProps) {
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<(Movie | TVShow | Anime)[]>([])
  const [loading, setLoading] = useState(false)
  const [mediaType, setMediaType] = useState<"all" | "movie" | "tv" | "anime">("all")
  const [sortBy, setSortBy] = useState<
    "relevance" | "rating" | "popularity" | "release_date_desc" | "release_date_asc"
  >("relevance")
  const [showMediaDropdown, setShowMediaDropdown] = useState(false)
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true)
      try {
        let searchResults
        if (mediaType === "anime") {
          searchResults = await anilist.searchAnime(query)
          setResults(searchResults.slice(0, 8))
        } else if (mediaType === "movie") {
          searchResults = await tmdb.searchMovies(query)
          let items = Array.isArray(searchResults.results) ? searchResults.results : []
          items = sortResults(items)
          setResults(items.slice(0, 8))
        } else if (mediaType === "tv") {
          searchResults = await tmdb.searchTVShows(query)
          let items = Array.isArray(searchResults.results) ? searchResults.results : []
          items = sortResults(items)
          setResults(items.slice(0, 8))
        } else {
          // Search all types
          const [movieResults, tvResults, animeResults] = await Promise.all([
            tmdb.searchMovies(query),
            tmdb.searchTVShows(query),
            anilist.searchAnime(query, 1, 8),
          ])
          const combined = [...(movieResults.results || []), ...(tvResults.results || []), ...(animeResults || [])]
          setResults(sortResults(combined).slice(0, 8))
        }
      } catch (error) {
        console.error("[v0] Search error:", error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, mediaType, sortBy])

  const sortResults = (items: any[]) => {
    if (sortBy === "rating") {
      return items.sort((a, b) => {
        const ratingA = "vote_average" in a ? a.vote_average : "averageScore" in a ? a.averageScore / 10 : 0
        const ratingB = "vote_average" in b ? b.vote_average : "averageScore" in b ? b.averageScore / 10 : 0
        return (ratingB || 0) - (ratingA || 0)
      })
    } else if (sortBy === "popularity") {
      return items.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0))
    } else if (sortBy === "release_date_desc") {
      return items.sort((a, b) => {
        const dateA =
          "release_date" in a
            ? a.release_date
            : "first_air_date" in a
              ? a.first_air_date
              : "seasonYear" in a
                ? String(a.seasonYear)
                : ""
        const dateB =
          "release_date" in b
            ? b.release_date
            : "first_air_date" in b
              ? b.first_air_date
              : "seasonYear" in b
                ? String(b.seasonYear)
                : ""
        return dateB.localeCompare(dateA)
      })
    } else if (sortBy === "release_date_asc") {
      return items.sort((a, b) => {
        const dateA =
          "release_date" in a
            ? a.release_date
            : "first_air_date" in a
              ? a.first_air_date
              : "seasonYear" in a
                ? String(a.seasonYear)
                : ""
        const dateB =
          "release_date" in b
            ? b.release_date
            : "first_air_date" in b
              ? b.first_air_date
              : "seasonYear" in b
                ? String(b.seasonYear)
                : ""
        return dateA.localeCompare(dateB)
      })
    }
    return items
  }

  const handleResultClick = (item: Movie | TVShow | Anime) => {
    if ("title" in item && "coverImage" in item) {
      // It's an anime
      router.push(`/anime/${item.id}`)
    } else {
      const type = "title" in item ? "movie" : "tv"
      router.push(`/${type}/${item.id}`)
    }
    onClose()
  }

  const handleViewAll = () => {
    router.push(`/search?q=${encodeURIComponent(query)}&type=${mediaType}&sort=${sortBy}`)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-visible">
          <div className="p-6 border-b border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-[#fbc9ff]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for movies, TV shows, and anime..."
                className="flex-1 bg-transparent text-white text-lg placeholder:text-white/40 focus:outline-none"
                autoFocus
              />
              <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex items-center gap-3 relative">
              <div className="relative z-20">
                <button
                  onClick={() => {
                    setShowMediaDropdown(!showMediaDropdown)
                    setShowSortDropdown(false)
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/80 text-sm transition-colors"
                >
                  <span className="capitalize">
                    {mediaType === "all"
                      ? "All"
                      : mediaType === "movie"
                        ? "Movies"
                        : mediaType === "tv"
                          ? "TV Shows"
                          : "Anime"}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showMediaDropdown && (
                  <div className="absolute top-full mt-2 left-0 bg-black/90 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden shadow-xl z-50 min-w-[140px]">
                    {["all", "movie", "tv", "anime"].map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setMediaType(type as any)
                          setShowMediaDropdown(false)
                        }}
                        className="w-full px-4 py-2 text-left text-white/80 hover:bg-white/10 hover:text-[#fbc9ff] transition-colors text-sm capitalize"
                      >
                        {type === "all" ? "All" : type === "movie" ? "Movies" : type === "tv" ? "TV Shows" : "Anime"}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative z-20">
                <button
                  onClick={() => {
                    setShowSortDropdown(!showSortDropdown)
                    setShowMediaDropdown(false)
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/80 text-sm transition-colors"
                >
                  <span>
                    {sortBy === "relevance"
                      ? "Relevance"
                      : sortBy === "rating"
                        ? "Rating"
                        : sortBy === "popularity"
                          ? "Popularity"
                          : sortBy === "release_date_desc"
                            ? "Newest"
                            : "Oldest"}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showSortDropdown && (
                  <div className="absolute top-full mt-2 left-0 bg-black/90 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden shadow-xl z-50 min-w-[160px]">
                    {[
                      { value: "relevance", label: "Relevance" },
                      { value: "rating", label: "Rating" },
                      { value: "popularity", label: "Popularity" },
                      { value: "release_date_desc", label: "Newest First" },
                      { value: "release_date_asc", label: "Oldest First" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value as any)
                          setShowSortDropdown(false)
                        }}
                        className="w-full px-4 py-2 text-left text-white/80 hover:bg-white/10 hover:text-[#fbc9ff] transition-colors text-sm"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {loading && (
              <div className="p-8 text-center text-white/60">
                <div className="inline-block w-6 h-6 border-2 border-[#fbc9ff] border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {!loading && results.length === 0 && query.trim() && (
              <div className="p-8 text-center text-white/60">No results found for "{query}"</div>
            )}

            {!loading && results.length === 0 && !query.trim() && (
              <div className="p-8 text-center text-white/60">Start typing to search...</div>
            )}

            {!loading && results.length > 0 && (
              <div className="p-4 space-y-2">
                {results.map((item) => {
                  const isAnime = "coverImage" in item
                  const title = isAnime
                    ? item.title.english || item.title.romaji
                    : "title" in item
                      ? item.title
                      : item.name
                  const type = isAnime ? "anime" : "title" in item ? "movie" : "tv"
                  const year = isAnime
                    ? item.seasonYear
                    : "release_date" in item
                      ? item.release_date?.split("-")[0]
                      : "first_air_date" in item
                        ? item.first_air_date?.split("-")[0]
                        : ""
                  const posterPath = isAnime
                    ? item.coverImage.large
                    : "poster_path" in item
                      ? tmdb.getImageUrl(item.poster_path)
                      : null

                  return (
                    <button
                      key={`${type}-${item.id}`}
                      onClick={() => handleResultClick(item)}
                      className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors group"
                    >
                      <div className="relative w-16 h-24 flex-shrink-0 rounded overflow-hidden bg-white/5">
                        {posterPath ? (
                          <Image
                            src={posterPath || "/placeholder.svg"}
                            alt={title}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/20">
                            <Search className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="text-white font-medium group-hover:text-[#fbc9ff] transition-colors">{title}</h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-white/60">
                          <span className="capitalize">{type}</span>
                          {year && (
                            <>
                              <span>•</span>
                              <span>{year}</span>
                            </>
                          )}
                          {((isAnime && item.averageScore) ||
                            (!isAnime && "vote_average" in item && item.vote_average > 0)) && (
                            <>
                              <span>•</span>
                              <span className="text-[#fbc9ff]">
                                ★{" "}
                                {isAnime
                                  ? (item.averageScore! / 10).toFixed(1)
                                  : "vote_average" in item
                                    ? item.vote_average.toFixed(1)
                                    : ""}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}

                {results.length >= 8 && (
                  <Button
                    onClick={handleViewAll}
                    className="w-full mt-4 bg-[#fbc9ff]/10 hover:bg-[#fbc9ff]/20 text-[#fbc9ff] border border-[#fbc9ff]/30"
                  >
                    View All Results
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
