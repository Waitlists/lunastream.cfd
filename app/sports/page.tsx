"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { SportsMatchCard } from "@/components/sports-match-card"
import { streamed, type APIMatch, type Sport } from "@/lib/streamed"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SportsPage() {
  const [sports, setSports] = useState<Sport[]>([])
  const [liveMatches, setLiveMatches] = useState<APIMatch[]>([])
  const [selectedSport, setSelectedSport] = useState<string>("all")
  const [filteredMatches, setFilteredMatches] = useState<APIMatch[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sportsData, liveData] = await Promise.all([streamed.getSports(), streamed.getLiveMatches()])
        setSports(sportsData)
        setLiveMatches(liveData)
        setFilteredMatches(liveData)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching sports data:", error)
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedSport === "all") {
      setFilteredMatches(liveMatches)
    } else {
      setFilteredMatches(liveMatches.filter((match) => match.category === selectedSport))
    }
  }, [selectedSport, liveMatches])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-white mb-8">Live Sports</h1>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-[#fbc9ff] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Sport filter tabs */}
              <Tabs value={selectedSport} onValueChange={setSelectedSport} className="mb-8">
                <TabsList className="bg-white/5 border border-white/10">
                  <TabsTrigger value="all">All Sports</TabsTrigger>
                  {sports.map((sport) => (
                    <TabsTrigger key={sport.id} value={sport.id}>
                      {sport.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              {/* Matches grid */}
              {filteredMatches.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {filteredMatches.map((match) => (
                    <SportsMatchCard key={match.id} match={match} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-white/60 text-lg">
                    No live matches available for {selectedSport === "all" ? "any sport" : selectedSport}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
