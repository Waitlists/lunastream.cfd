import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("continue_watching")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(50) // Limit to prevent performance issues

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching continue watching:", error)
    return NextResponse.json({ error: "Failed to fetch continue watching" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { media_id, media_type, title, poster_path, episode, season, timestamp, duration } = body

    const { data, error } = await supabase
      .from("continue_watching")
      .upsert(
        {
          user_id: user.id,
          media_id,
          media_type,
          title,
          poster_path,
          episode,
          season,
          timestamp,
          duration,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,media_id,media_type,episode,season",
        },
      )
      .select()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error saving continue watching:", error)
    return NextResponse.json({ error: "Failed to save continue watching" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const media_id = searchParams.get("media_id")
    const media_type = searchParams.get("media_type")

    if (!media_id || !media_type) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
    }

    const { error } = await supabase
      .from("continue_watching")
      .delete()
      .eq("user_id", user.id)
      .eq("media_id", media_id)
      .eq("media_type", media_type)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting continue watching:", error)
    return NextResponse.json({ error: "Failed to delete continue watching" }, { status: 500 })
  }
}
