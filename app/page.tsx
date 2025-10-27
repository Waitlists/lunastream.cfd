"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { HeroBanner } from "@/components/hero-banner"
import { MediaCarousel } from "@/components/media-carousel"
import { ContinueWatching } from "@/components/continue-watching"
import { IntroAnimation } from "@/components/intro-animation"
import { tmdb } from "@/lib/tmdb"
import { storage } from "@/lib/storage"
import { trackUniqueVisitor } from "@/lib/track-statistics"

export default function HomePage() {
  const [showIntro, setShowIntro] = useState(false)
  const [introComplete, setIntroComplete] = useState(false)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    trackUniqueVisitor()

    const settings = storage.getSettings()
    const hasSeenIntro = sessionStorage.getItem("intro_seen")

    if (settings.showIntro && !hasSeenIntro) {
      setShowIntro(true)
    } else {
      setIntroComplete(true)
    }

    const fetchData = async () => {
      const [trending, popularMovies, popularTV, halloweenMovies] = await Promise.all([
        tmdb.getTrendingAll("week"),
        tmdb.getPopularMovies(),
        tmdb.getPopularTVShows(),
        tmdb.getHalloweenMovies(),
      ])

      setData({
        trending: trending.results.slice(0, 20).map((item: any) => ({
          ...item,
          media_type: item.media_type || "movie",
        })),
        trendingHero: trending.results.slice(0, 5).map((item: any) => ({
          ...item,
          media_type: item.media_type || "movie",
        })),
        popularMovies: popularMovies.results,
        popularTV: popularTV.results,
        halloweenMovies: halloweenMovies.results,
      })
    }

    fetchData()
  }, [])

  const handleIntroComplete = () => {
    sessionStorage.setItem("intro_seen", "true")
    setShowIntro(false)
    setIntroComplete(true)
  }

  const handleIntroSkip = () => {
    sessionStorage.setItem("intro_seen", "true")
    setShowIntro(false)
    setIntroComplete(true)
  }

  if (showIntro) {
    return <IntroAnimation onComplete={handleIntroComplete} onSkip={handleIntroSkip} />
  }

  if (!introComplete || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-16">
        <HeroBanner items={data.trendingHero} />

        <div className="container mx-auto px-4 py-8 space-y-12">
          <ContinueWatching />

          <MediaCarousel title="Trending This Month" items={data.trending} />

          <MediaCarousel title="Halloween Movies" items={data.halloweenMovies} mediaType="movie" />

          <MediaCarousel title="Popular Movies" items={data.popularMovies} mediaType="movie" />

          <MediaCarousel title="Popular TV Shows" items={data.popularTV} mediaType="tv" />
        </div>
      </main>
    </div>
  )
}
