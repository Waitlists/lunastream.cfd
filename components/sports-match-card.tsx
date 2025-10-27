import Link from "next/link"
import Image from "next/image"
import { Play } from "lucide-react"
import { type APIMatch, streamed } from "@/lib/streamed"
import { Badge } from "@/components/ui/badge"

interface SportsMatchCardProps {
  match: APIMatch
}

export function SportsMatchCard({ match }: SportsMatchCardProps) {
  const matchDate = new Date(match.date)
  const isLive = matchDate.getTime() <= Date.now()

  return (
    <Link
      href={`/sports/watch/${match.id}`}
      className="relative block rounded-lg overflow-hidden bg-card transition-all duration-300"
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        {/* Match poster or team badges */}
        {match.poster ? (
          <Image
            src={streamed.getProxyImageUrl(match.poster) || "/placeholder.svg"}
            alt={match.title}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : match.teams?.home && match.teams?.away ? (
          <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center gap-4 p-4">
            <div className="flex items-center justify-center gap-6">
              {match.teams.home.badge && (
                <Image
                  src={streamed.getBadgeUrl(match.teams.home.badge) || "/placeholder.svg"}
                  alt={match.teams.home.name}
                  width={60}
                  height={60}
                  className="object-contain"
                />
              )}
              <span className="text-white/50 text-xl font-bold">VS</span>
              {match.teams.away.badge && (
                <Image
                  src={streamed.getBadgeUrl(match.teams.away.badge) || "/placeholder.svg"}
                  alt={match.teams.away.name}
                  width={60}
                  height={60}
                  className="object-contain"
                />
              )}
            </div>
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800" />
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-[#fbc9ff]/90 flex items-center justify-center">
            <Play className="w-8 h-8 text-black fill-black" />
          </div>
        </div>

        {/* Live badge */}
        {isLive && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-red-600 text-white border-0">LIVE</Badge>
          </div>
        )}

        {/* Popular badge */}
        {match.popular && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-[#fbc9ff] text-black border-0">Popular</Badge>
          </div>
        )}
      </div>

      {/* Match info */}
      <div className="p-3">
        <h3 className="font-semibold text-white text-sm line-clamp-2 mb-1">{match.title}</h3>
        <p className="text-xs text-white/60 mb-1">
          {matchDate.toLocaleDateString()} • {matchDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
        <p className="text-xs text-[#fbc9ff] capitalize">{match.category}</p>
      </div>
    </Link>
  )
}
