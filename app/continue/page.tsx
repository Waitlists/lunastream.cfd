"use client"

import { Navbar } from "@/components/navbar"
import { ContinueWatching } from "@/components/continue-watching"

export default function ContinuePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-white mb-8">Continue Watching</h1>
          <ContinueWatching showTitle={false} />
        </div>
      </main>
    </div>
  )
}
