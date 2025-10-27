"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { anilist, type Anime } from "@/lib/anilist"
import Image from "next/image"
import Link from "next/link"
import { Play } from "lucide-react"

export default function AnimePage() {
  const [trending, setTrending] = useState<Anime[]>([])
  const [popular, setPopular] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnime = async () => {
      const [trendingData, popularData] = await Promise.all([anilist.getTrending(1, 20), anilist.getPopular(1, 20)])
      setTrending(trendingData)
      setPopular(popularData)
      setLoading(false)
    }
    fetchAnime()
  }, [])

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 space-y-12">
          <section>
            <h1 className="text-4xl font-bold text-white mb-8">Trending Anime</h1>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {trending.map((anime) => (
                <Link
                  key={anime.id}
                  href={`/anime/${anime.id}`}
                  className="relative block rounded-lg overflow-hidden bg-card transition-all duration-300 hover:scale-102 hover:shadow-[0_4px_15px_rgba(251,201,255,0.25)]"
                >
                  <div className="aspect-[2/3] relative">
                    <Image
                      src={anime.coverImage.extraLarge || "/placeholder.svg"}
                      alt={anime.title.english || anime.title.romaji}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-300 pointer-events-none">
                      <div className="w-12 h-12 rounded-full bg-[#fbc9ff] flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-[0_0_10px_rgba(251,201,255,0.4)] pointer-events-none">
                        <Play className="w-6 h-6 text-black fill-black ml-1" />
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm line-clamp-1 text-white hover:text-[#fbc9ff] transition-colors">
                      {anime.title.english || anime.title.romaji}
                    </h3>
                    <div className="flex items-center justify-between mt-1">
                      {anime.seasonYear && <span className="text-xs text-white/60">{anime.seasonYear}</span>}
                      {anime.averageScore && (
                        <span className="text-xs text-[#fbc9ff]">★ {(anime.averageScore / 10).toFixed(1)}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-8">Popular Anime</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {popular.map((anime) => (
                <Link
                  key={anime.id}
                  href={`/anime/${anime.id}`}
                  className="relative block rounded-lg overflow-hidden bg-card transition-all duration-300 hover:scale-102 hover:shadow-[0_4px_15px_rgba(251,201,255,0.25)]"
                >
                  <div className="aspect-[2/3] relative">
                    <Image
                      src={anime.coverImage.extraLarge || "/placeholder.svg"}
                      alt={anime.title.english || anime.title.romaji}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-300 pointer-events-none">
                      <div className="w-12 h-12 rounded-full bg-[#fbc9ff] flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-[0_0_10px_rgba(251,201,255,0.4)] pointer-events-none">
                        <Play className="w-6 h-6 text-black fill-black ml-1" />
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm line-clamp-1 text-white hover:text-[#fbc9ff] transition-colors">
                      {anime.title.english || anime.title.romaji}
                    </h3>
                    <div className="flex items-center justify-between mt-1">
                      {anime.seasonYear && <span className="text-xs text-white/60">{anime.seasonYear}</span>}
                      {anime.averageScore && (
                        <span className="text-xs text-[#fbc9ff]">★ {(anime.averageScore / 10).toFixed(1)}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
