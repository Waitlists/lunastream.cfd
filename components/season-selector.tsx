"use client"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Season } from "@/lib/tmdb"

interface SeasonSelectorProps {
  seasons: Season[]
  currentSeason: number
  onSeasonChange: (seasonNumber: number) => void
}

export function SeasonSelector({ seasons, currentSeason, onSeasonChange }: SeasonSelectorProps) {
  const validSeasons = seasons.filter((s) => s.season_number > 0)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
          Season {currentSeason}
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-card border-white/20">
        {validSeasons.map((season) => (
          <DropdownMenuItem
            key={season.id}
            onClick={() => onSeasonChange(season.season_number)}
            className={`text-white cursor-pointer ${season.season_number === currentSeason ? "bg-[#fbc9ff]/20" : ""}`}
          >
            {season.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
