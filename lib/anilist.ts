const ANILIST_API_URL = "https://graphql.anilist.co"

export interface Anime {
  id: number
  title: {
    romaji: string
    english: string | null
    native: string
  }
  coverImage: {
    large: string
    extraLarge: string
  }
  bannerImage: string | null
  description: string
  episodes: number | null
  format: string
  status: string
  averageScore: number | null
  seasonYear: number | null
  genres: string[]
  studios: {
    nodes: Array<{
      name: string
    }>
  }
  trailer: {
    id: string
    site: string
  } | null
}

export interface AnimeDetails extends Anime {
  relations: {
    edges: Array<{
      node: Anime
      relationType: string
    }>
  }
  recommendations: {
    nodes: Array<{
      mediaRecommendation: Anime
    }>
  }
}

const query = (queryString: string, variables: any) => {
  return fetch(ANILIST_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: queryString,
      variables,
    }),
  }).then((res) => res.json())
}

export const anilist = {
  getTrending: async (page = 1, perPage = 20) => {
    const queryString = `
      query ($page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          media(sort: TRENDING_DESC, type: ANIME) {
            id
            title {
              romaji
              english
              native
            }
            coverImage {
              large
              extraLarge
            }
            bannerImage
            description
            episodes
            format
            status
            averageScore
            seasonYear
            genres
          }
        }
      }
    `
    const data = await query(queryString, { page, perPage })
    return data.data.Page.media
  },

  getPopular: async (page = 1, perPage = 20) => {
    const queryString = `
      query ($page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          media(sort: POPULARITY_DESC, type: ANIME) {
            id
            title {
              romaji
              english
              native
            }
            coverImage {
              large
              extraLarge
            }
            bannerImage
            description
            episodes
            format
            status
            averageScore
            seasonYear
            genres
          }
        }
      }
    `
    const data = await query(queryString, { page, perPage })
    return data.data.Page.media
  },

  getAnimeDetails: async (id: number): Promise<AnimeDetails> => {
    const queryString = `
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          id
          title {
            romaji
            english
            native
          }
          coverImage {
            large
            extraLarge
          }
          bannerImage
          description
          episodes
          format
          status
          averageScore
          seasonYear
          genres
          studios {
            nodes {
              name
            }
          }
          trailer {
            id
            site
          }
          relations {
            edges {
              node {
                id
                title {
                  romaji
                  english
                  native
                }
                coverImage {
                  large
                  extraLarge
                }
                format
              }
              relationType
            }
          }
          recommendations {
            nodes {
              mediaRecommendation {
                id
                title {
                  romaji
                  english
                  native
                }
                coverImage {
                  large
                  extraLarge
                }
                averageScore
              }
            }
          }
        }
      }
    `
    const data = await query(queryString, { id })
    return data.data.Media
  },

  searchAnime: async (searchQuery: string, page = 1, perPage = 20) => {
    const queryString = `
      query ($search: String, $page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          media(search: $search, type: ANIME) {
            id
            title {
              romaji
              english
              native
            }
            coverImage {
              large
              extraLarge
            }
            bannerImage
            description
            episodes
            format
            status
            averageScore
            seasonYear
            genres
          }
        }
      }
    `
    const data = await query(queryString, { search: searchQuery, page, perPage })
    return data.data.Page.media
  },

  getImageUrl: (path: string | null) => {
    return path || "/placeholder.svg?height=750&width=500"
  },
}
