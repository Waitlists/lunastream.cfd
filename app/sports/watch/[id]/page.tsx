"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { streamed, type APIMatch, type Stream } from "@/lib/streamed"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import Image from "next/image"

export default function WatchSportsPage() {
  const params = useParams()
  const matchId = params.id as string

  const [match, setMatch] = useState<APIMatch | null>(null)
  const [streams, setStreams] = useState<Stream[]>([])
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        const allMatches = await streamed.getLiveMatches()
        const foundMatch = allMatches.find((m) => m.id === matchId)

        if (foundMatch) {
          setMatch(foundMatch)

          if (foundMatch.sources.length > 0) {
            const firstSource = foundMatch.sources[0]
            try {
              const streamData = await streamed.getStreams(firstSource.source, firstSource.id)
              setStreams(streamData)

              const hdStream = streamData.find((s) => s.hd) || streamData[0]
              setSelectedStream(hdStream)
            } catch (streamError) {
              console.error("[v0] Error fetching streams:", streamError)
              setError("Unable to load streams. The streaming service may be temporarily unavailable.")
            }
          } else {
            setError("No streams available for this match.")
          }
        } else {
          setError("Match not found.")
        }

        setLoading(false)
      } catch (error) {
        console.error("[v0] Error fetching match data:", error)
        setError("Failed to load match data. Please try again later.")
        setLoading(false)
      }
    }

    fetchMatchData()
  }, [matchId])

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

  if (error || !match) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-screen px-4">
          <Alert className="max-w-md bg-red-500/10 border-red-500/50">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-white">{error || "Match not found"}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  const matchDate = new Date(match.date)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Video player */}
          <div className="mb-8">
            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
              {selectedStream ? (
                <iframe
                  src={selectedStream.embedUrl}
                  className="w-full h-full"
                  allowFullScreen
                  allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                  frameBorder="0"
                  scrolling="no"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-white/60">No streams available</p>
                </div>
              )}
            </div>
          </div>

          {/* Match info */}
          <div className="mb-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">{match.title}</h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge className="bg-[#fbc9ff] text-black border-0 capitalize">{match.category}</Badge>
                  <span className="text-white/60">
                    {matchDate.toLocaleDateString()} •{" "}
                    {matchDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>

              {/* Team badges */}
              {match.teams?.home && match.teams?.away && (
                <div className="flex items-center gap-4">
                  {match.teams.home.badge && (
                    <div className="text-center">
                      <Image
                        src={streamed.getBadgeUrl(match.teams.home.badge) || "/placeholder.svg"}
                        alt={match.teams.home.name}
                        width={60}
                        height={60}
                        className="object-contain mb-2"
                      />
                      <p className="text-xs text-white/80">{match.teams.home.name}</p>
                    </div>
                  )}
                  <span className="text-white/50 text-xl font-bold">VS</span>
                  {match.teams.away.badge && (
                    <div className="text-center">
                      <Image
                        src={streamed.getBadgeUrl(match.teams.away.badge) || "/placeholder.svg"}
                        alt={match.teams.away.name}
                        width={60}
                        height={60}
                        className="object-contain mb-2"
                      />
                      <p className="text-xs text-white/80">{match.teams.away.name}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Stream selection */}
          {streams.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Available Streams</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {streams.map((stream) => (
                  <button
                    key={stream.id}
                    onClick={() => setSelectedStream(stream)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedStream?.id === stream.id
                        ? "border-[#fbc9ff] bg-[#fbc9ff]/10"
                        : "border-white/10 bg-white/5 hover:border-white/30"
                    }`}
                  >
                    <div className="text-sm font-medium text-white mb-1">Stream {stream.streamNo}</div>
                    <div className="text-xs text-white/60 mb-1">{stream.language}</div>
                    {stream.hd && <Badge className="bg-green-600 text-white border-0 text-xs">HD</Badge>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
