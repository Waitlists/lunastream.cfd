// Utility functions for tracking statistics

export async function trackUniqueVisitor() {
  try {
    await fetch("/api/statistics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ metric: "unique_visitor" }),
    })
  } catch (error) {
    console.error("Failed to track unique visitor:", error)
  }
}

export async function trackWatch() {
  try {
    await fetch("/api/statistics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ metric: "watch" }),
    })
  } catch (error) {
    console.error("Failed to track watch:", error)
  }
}

export async function trackTMDBRequest() {
  try {
    await fetch("/api/statistics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ metric: "tmdb_request" }),
    })
  } catch (error) {
    console.error("Failed to track TMDB request:", error)
  }
}

export async function trackUserSignup() {
  try {
    await fetch("/api/statistics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ metric: "user_signup" }),
    })
  } catch (error) {
    console.error("Failed to track user signup:", error)
  }
}
