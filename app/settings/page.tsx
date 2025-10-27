"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { storage } from "@/lib/storage"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function SettingsPage() {
  const [settings, setSettings] = useState(storage.getSettings())

  useEffect(() => {
    setSettings(storage.getSettings())
  }, [])

  const updateSetting = (key: keyof typeof settings, value: boolean) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    storage.saveSettings(newSettings)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <h1 className="text-4xl font-bold text-white mb-8">Settings</h1>

          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="play-trailers" className="text-white font-semibold">
                    Play Trailers
                  </Label>
                  <p className="text-sm text-white/60">Automatically play trailers on movie and TV show pages</p>
                </div>
                <Switch
                  id="play-trailers"
                  checked={settings.playTrailers}
                  onCheckedChange={(checked) => updateSetting("playTrailers", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="show-intro" className="text-white font-semibold">
                    Show Intro Animation
                  </Label>
                  <p className="text-sm text-white/60">Display the LunaStream intro animation on startup</p>
                </div>
                <Switch
                  id="show-intro"
                  checked={settings.showIntro}
                  onCheckedChange={(checked) => updateSetting("showIntro", checked)}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
