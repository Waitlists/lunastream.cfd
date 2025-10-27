import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Mark a notification as read
export async function POST(request: Request) {
  try {
    const { notificationId } = await request.json()
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { error } = await supabase.from("notification_reads").insert([
      {
        user_id: user.id,
        notification_id: notificationId,
      },
    ])

    if (error && error.code !== "23505") {
      // Ignore duplicate key errors
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return NextResponse.json({ error: "Failed to mark notification as read" }, { status: 500 })
  }
}
