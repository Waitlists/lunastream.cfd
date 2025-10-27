export interface WatchProgress {
  id: number
  mediaType: "movie" | "tv"
  title: string
  posterPath: string | null
  lastWatched: number
  season?: number
  episode?: number
  progress?: number
}

export interface UserSettings {
  playTrailers: boolean
  showIntro: boolean
}

export const storage = {
  getWatchProgress: (): WatchProgress[] => {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem("watch_progress")
    if (!data) return []
    try {
      const parsed = JSON.parse(data)
      return Object.values(parsed)
    } catch {
      return []
    }
  },

  addWatchProgress: (item: WatchProgress) => {
    if (typeof window === "undefined") return
    const current = storage.getWatchProgress()

    // For TV shows, remove any existing entries for the same show
    const filtered =
      item.mediaType === "tv"
        ? current.filter((p) => !(p.id === item.id && p.mediaType === "tv"))
        : current.filter((p) => p.id !== item.id)

    const updated = [{ ...item, lastWatched: Date.now() }, ...filtered]

    const progressObj = updated.reduce(
      (acc, item) => {
        acc[`${item.mediaType}-${item.id}`] = item
        return acc
      },
      {} as Record<string, WatchProgress>,
    )

    localStorage.setItem("watch_progress", JSON.stringify(progressObj))
  },

  removeWatchProgress: (id: number, mediaType: "movie" | "tv") => {
    if (typeof window === "undefined") return
    const current = storage.getWatchProgress()
    const filtered = current.filter((p) => !(p.id === id && p.mediaType === mediaType))

    const progressObj = filtered.reduce(
      (acc, item) => {
        acc[`${item.mediaType}-${item.id}`] = item
        return acc
      },
      {} as Record<string, WatchProgress>,
    )

    localStorage.setItem("watch_progress", JSON.stringify(progressObj))
  },

  getSettings: (): UserSettings => {
    if (typeof window === "undefined")
      return {
        playTrailers: true,
        showIntro: false,
      }
    const data = localStorage.getItem("user_settings")
    if (!data)
      return {
        playTrailers: true,
        showIntro: false,
      }
    try {
      return JSON.parse(data)
    } catch {
      return {
        playTrailers: true,
        showIntro: false,
      }
    }
  },

  saveSettings: (settings: UserSettings) => {
    if (typeof window === "undefined") return
    localStorage.setItem("user_settings", JSON.stringify(settings))
    window.dispatchEvent(new CustomEvent("settingsChanged", { detail: settings }))
  },
}
