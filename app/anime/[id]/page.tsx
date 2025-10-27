"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { AnimeEpisodeList } from "@/components/anime-episode-list"
import { anilist, type AnimeDetails } from "@/lib/anilist"
import Image from "next/image"
import { Play, Calendar, Star, Film } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function AnimeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const animeId = Number.parseInt(params.id as string)

  const [anime, setAnime] = useState<AnimeDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnime = async () => {
      const data = await anilist.getAnimeDetails(animeId)
      setAnime(data)
      setLoading(false)
    }
    fetchAnime()
  }, [animeId])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="w-8 h-8 border-2 border-[#fbc9ff] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!anime) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <p className="text-white/60 text-lg">Anime not found</p>
        </div>
      </div>
    )
  }

  const title = anime.title.english || anime.title.romaji

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-16">
        {/* Hero Section */}
        <div className="relative h-[70vh] overflow-hidden">
          {anime.bannerImage && (
            <Image src={anime.bannerImage || "/placeholder.svg"} alt={title} fill className="object-cover" priority />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container mx-auto flex gap-8">
              <div className="relative w-64 h-96 flex-shrink-0 rounded-lg overflow-hidden shadow-2xl">
                <Image
                  src={anime.coverImage.extraLarge || "/placeholder.svg"}
                  alt={title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 flex flex-col justify-end pb-4">
                <h1 className="text-5xl font-bold text-white mb-4">{title}</h1>
                <div className="flex items-center gap-4 mb-4">
                  {anime.seasonYear && (
                    <div className="flex items-center gap-2 text-white/80">
                      <Calendar className="w-4 h-4" />
                      <span>{anime.seasonYear}</span>
                    </div>
                  )}
                  {anime.averageScore && (
                    <div className="flex items-center gap-2 text-[#fbc9ff]">
                      <Star className="w-4 h-4 fill-current" />
                      <span>{(anime.averageScore / 10).toFixed(1)}</span>
                    </div>
                  )}
                  {anime.episodes && (
                    <div className="flex items-center gap-2 text-white/80">
                      <Film className="w-4 h-4" />
                      <span>{anime.episodes} Episodes</span>
                    </div>
                  )}
                  <Badge className="bg-[#fbc9ff] text-black border-0 capitalize">{anime.format}</Badge>
                </div>

                <div className="flex gap-2 mb-4 flex-wrap">
                  {anime.genres.slice(0, 5).map((genre) => (
                    <Badge key={genre} variant="outline" className="border-white/30 text-white">
                      {genre}
                    </Badge>
                  ))}
                </div>

                <Button
                  onClick={() => router.push(`/watch/anime/${animeId}/1`)}
                  className="w-fit bg-[#fbc9ff] hover:bg-[#fbc9ff]/90 text-black font-semibold px-8 py-6 text-lg"
                >
                  <Play className="w-5 h-5 mr-2 fill-current" />
                  Watch Now
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Synopsis</h2>
            <div
              className="text-white/80 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: anime.description || "No description available." }}
            />
          </div>

          {anime.episodes && anime.episodes > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6">Episodes</h2>
              <AnimeEpisodeList animeId={animeId} totalEpisodes={anime.episodes} animeTitle={title} />
            </div>
          )}

          {/* Recommendations */}
          {anime.recommendations?.nodes && anime.recommendations.nodes.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-white mb-6">You May Also Like</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {anime.recommendations.nodes.slice(0, 12).map((rec) => {
                  const recAnime = rec.mediaRecommendation
                  if (!recAnime) return null
                  return (
                    <button
                      key={recAnime.id}
                      onClick={() => router.push(`/anime/${recAnime.id}`)}
                      className="relative block rounded-lg overflow-hidden bg-card transition-all duration-300 hover:scale-102 hover:shadow-[0_4px_15px_rgba(251,201,255,0.25)]"
                    >
                      <div className="aspect-[2/3] relative">
                        <Image
                          src={recAnime.coverImage.extraLarge || "/placeholder.svg"}
                          alt={recAnime.title.english || recAnime.title.romaji}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-sm line-clamp-1 text-white">
                          {recAnime.title.english || recAnime.title.romaji}
                        </h3>
                        {recAnime.averageScore && (
                          <span className="text-xs text-[#fbc9ff]">★ {(recAnime.averageScore / 10).toFixed(1)}</span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
