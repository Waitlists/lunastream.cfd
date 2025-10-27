import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Mark all notifications as read
export async function POST() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all notification IDs
    const { data: notifications } = await supabase.from("notifications").select("id")

    if (!notifications) {
      return NextResponse.json({ success: true })
    }

    // Insert read records for all notifications
    const reads = notifications.map((n) => ({
      user_id: user.id,
      notification_id: n.id,
    }))

    const { error } = await supabase.from("notification_reads").upsert(reads, {
      onConflict: "user_id,notification_id",
      ignoreDuplicates: true,
    })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    return NextResponse.json({ error: "Failed to mark all notifications as read" }, { status: 500 })
  }
}
