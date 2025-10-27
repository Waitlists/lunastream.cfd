export async function saveContinueWatching(data: {
  media_id: string
  media_type: string
  title: string
  poster_path: string | null
  episode?: number
  season?: number
  timestamp: number
  duration?: number
}) {
  try {
    const response = await fetch("/api/continue-watching", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to save continue watching")
    }

    return await response.json()
  } catch (error) {
    console.error("Error saving continue watching:", error)
    return null
  }
}
