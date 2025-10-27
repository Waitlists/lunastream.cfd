import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { headers } from "next/headers"

export async function POST(request: Request) {
  try {
    const { metric } = await request.json()
    const supabase = await createClient()

    // Get IP address for unique visitor tracking
    const headersList = await headers()
    const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown"

    if (metric === "unique_visitor") {
      const { data: existingIp } = await supabase.from("visitor_ips").select("id").eq("ip_address", ip).maybeSingle()

      if (!existingIp) {
        // New visitor
        await supabase.from("visitor_ips").insert([{ ip_address: ip }])

        // Increment unique visitors count
        await supabase.rpc("increment_statistic", { metric_name: "unique_visitors" })
      } else {
        // Update last visit
        await supabase.from("visitor_ips").update({ last_visit: new Date().toISOString() }).eq("ip_address", ip)
      }
    } else if (metric === "watch") {
      // Increment watch count
      await supabase.rpc("increment_statistic", { metric_name: "watch_count" })
    } else if (metric === "tmdb_request") {
      // Increment TMDB request count
      await supabase.rpc("increment_statistic", { metric_name: "tmdb_requests" })
    } else if (metric === "user_signup") {
      // Increment user signup count
      await supabase.rpc("increment_statistic", { metric_name: "user_signups" })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error tracking statistic:", error)
    return NextResponse.json({ error: "Failed to track statistic" }, { status: 500 })
  }
}
