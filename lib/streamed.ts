// Streamed API client for sports streaming
const STREAMED_API_BASE = "https://streamed.pk/api"

export interface APIMatch {
  id: string
  title: string
  category: string
  date: number
  poster?: string
  popular: boolean
  teams?: {
    home?: {
      name: string
      badge: string
    }
    away?: {
      name: string
      badge: string
    }
  }
  sources: {
    source: string
    id: string
  }[]
}

export interface Stream {
  id: string
  streamNo: number
  language: string
  hd: boolean
  embedUrl: string
  source: string
}

export interface Sport {
  id: string
  name: string
}

export const streamed = {
  // Get all available sports
  async getSports(): Promise<Sport[]> {
    const response = await fetch(`${STREAMED_API_BASE}/sports`)
    if (!response.ok) throw new Error("Failed to fetch sports")
    return response.json()
  },

  // Get live matches
  async getLiveMatches(): Promise<APIMatch[]> {
    const response = await fetch(`${STREAMED_API_BASE}/matches/live`)
    if (!response.ok) throw new Error("Failed to fetch live matches")
    return response.json()
  },

  // Get popular live matches
  async getPopularLiveMatches(): Promise<APIMatch[]> {
    const response = await fetch(`${STREAMED_API_BASE}/matches/live/popular`)
    if (!response.ok) throw new Error("Failed to fetch popular live matches")
    return response.json()
  },

  // Get matches by sport
  async getMatchesBySport(sportId: string): Promise<APIMatch[]> {
    const response = await fetch(`${STREAMED_API_BASE}/matches/${sportId}`)
    if (!response.ok) throw new Error("Failed to fetch matches")
    return response.json()
  },

  // Get popular matches by sport
  async getPopularMatchesBySport(sportId: string): Promise<APIMatch[]> {
    const response = await fetch(`${STREAMED_API_BASE}/matches/${sportId}/popular`)
    if (!response.ok) throw new Error("Failed to fetch popular matches")
    return response.json()
  },

  // Get all matches
  async getAllMatches(): Promise<APIMatch[]> {
    const response = await fetch(`${STREAMED_API_BASE}/matches/all`)
    if (!response.ok) throw new Error("Failed to fetch all matches")
    return response.json()
  },

  // Get today's matches
  async getTodayMatches(): Promise<APIMatch[]> {
    const response = await fetch(`${STREAMED_API_BASE}/matches/all-today`)
    if (!response.ok) throw new Error("Failed to fetch today matches")
    return response.json()
  },

  // Get streams for a match
  async getStreams(source: string, id: string): Promise<Stream[]> {
    const response = await fetch(`${STREAMED_API_BASE}/stream/${source}/${id}`)
    if (!response.ok) throw new Error("Failed to fetch streams")
    return response.json()
  },

  // Helper to get team badge URL
  getBadgeUrl(badgeId: string): string {
    return `${STREAMED_API_BASE}/images/badge/${badgeId}.webp`
  },

  // Helper to get match poster URL
  getPosterUrl(homeBadge: string, awayBadge: string): string {
    return `${STREAMED_API_BASE}/images/poster/${homeBadge}/${awayBadge}.webp`
  },

  // Helper to get proxied image URL
  getProxyImageUrl(poster: string): string {
    return `https://streamed.pk${poster}.webp`
  },
}
