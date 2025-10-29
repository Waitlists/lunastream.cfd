const TMDB_API_KEY = "a222e5eda9654d1c6974da834e756c12"
const TMDB_BASE_URL = "https://api.themoviedb.org/3"
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p"

export interface Movie {
  id: number
  title: string
  poster_path: string | null
  backdrop_path: string | null
  overview: string
  release_date: string
  vote_average: number
  genre_ids: number[]
}

export interface TVShow {
  id: number
  name: string
  poster_path: string | null
  backdrop_path: string | null
  overview: string
  first_air_date: string
  vote_average: number
  genre_ids: number[]
}

export interface MovieDetails extends Movie {
  genres: { id: number; name: string }[]
  runtime: number
  videos: { results: { key: string; type: string; site: string }[] }
  credits: { cast: CastMember[] }
}

export interface TVShowDetails extends TVShow {
  genres: { id: number; name: string }[]
  number_of_seasons: number
  seasons: Season[]
  videos: { results: { key: string; type: string; site: string }[] }
  credits: { cast: CastMember[] }
}

export interface Season {
  id: number
  season_number: number
  episode_count: number
  name: string
  overview: string
  poster_path: string | null
  air_date: string
}

export interface Episode {
  id: number
  episode_number: number
  name: string
  overview: string
  still_path: string | null
  air_date: string
  runtime: number
  vote_average: number
  guest_stars: CastMember[]
}

export interface CastMember {
  id: number
  name: string
  character?: string
  profile_path: string | null
  known_for_department?: string
}

export interface PersonDetails {
  id: number
  name: string
  biography: string
  birthday: string | null
  deathday: string | null
  place_of_birth: string | null
  profile_path: string | null
  known_for_department: string
  combined_credits: {
    cast: Array<Movie | TVShow>
  }
}

export const tmdb = {
  getPopularMovies: async (page = 1) => {
    const res = await fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}`)
    return res.json()
  },

  getPopularTVShows: async (page = 1) => {
    const res = await fetch(`${TMDB_BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}&page=${page}`)
    return res.json()
  },

  getTrendingAll: async (timeWindow: "day" | "week" = "week") => {
    const res = await fetch(`${TMDB_BASE_URL}/trending/all/${timeWindow}?api_key=${TMDB_API_KEY}`)
    return res.json()
  },

  getMovieDetails: async (id: number): Promise<MovieDetails> => {
    const res = await fetch(`${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=videos,credits`)
    return res.json()
  },

  getTVShowDetails: async (id: number): Promise<TVShowDetails> => {
    const res = await fetch(`${TMDB_BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}&append_to_response=videos,credits`)
    return res.json()
  },

  getSeasonDetails: async (tvId: number, seasonNumber: number) => {
    const res = await fetch(`${TMDB_BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${TMDB_API_KEY}`)
    return res.json()
  },

  getPersonDetails: async (id: number): Promise<PersonDetails> => {
    const res = await fetch(`${TMDB_BASE_URL}/person/${id}?api_key=${TMDB_API_KEY}&append_to_response=combined_credits`)
    return res.json()
  },

  searchMulti: async (query: string, page = 1) => {
    const res = await fetch(
      `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}`,
    )
    return res.json()
  },

  searchMovies: async (query: string, page = 1) => {
    const res = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}`,
    )
    return res.json()
  },

  searchTVShows: async (query: string, page = 1) => {
    const res = await fetch(
      `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}`,
    )
    return res.json()
  },

  getImageUrl: (path: string | null, size: "w500" | "original" = "w500") => {
    if (!path) return "/placeholder.svg?height=750&width=500"
    return `${TMDB_IMAGE_BASE}/${size}${path}`
  },

  getHalloweenMovies: async (page = 1) => {
    const res = await fetch(
      `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=27&sort_by=popularity.desc&page=${page}`,
    )
    return res.json()
  },
}
