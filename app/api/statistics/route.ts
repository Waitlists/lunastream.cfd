import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.from("statistics").select("*")

    if (error) throw error

    // Convert to object for easier access
    const stats = data.reduce(
      (acc, stat) => {
        acc[stat.metric_name] = stat.metric_value
        return acc
      },
      {} as Record<string, number>,
    )

    // Get total users from profiles table
    const { count: userCount } = await supabase.from("profiles").select("*", { count: "exact", head: true })

    stats.user_signups = userCount || 0

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching statistics:", error)
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 })
  }
}
