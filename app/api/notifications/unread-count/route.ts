import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Get unread notification count
export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      // For guests, return 0 (they'll use localStorage)
      return NextResponse.json({ count: 0 })
    }

    // Get all notifications
    const { data: allNotifications } = await supabase.from("notifications").select("id")

    if (!allNotifications || allNotifications.length === 0) {
      return NextResponse.json({ count: 0 })
    }

    // Get read notifications for this user
    const { data: readNotifications } = await supabase
      .from("notification_reads")
      .select("notification_id")
      .eq("user_id", user.id)

    const readIds = new Set(readNotifications?.map((r) => r.notification_id) || [])
    const unreadCount = allNotifications.filter((n) => !readIds.has(n.id)).length

    return NextResponse.json({ count: unreadCount })
  } catch (error) {
    console.error("Error getting unread count:", error)
    return NextResponse.json({ error: "Failed to get unread count" }, { status: 500 })
  }
}
