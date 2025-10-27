"use client"

import { useState, useEffect } from "react"
import { X, SettingsIcon } from "lucide-react"
import { storage } from "@/lib/storage"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface SettingsOverlayProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsOverlay({ isOpen, onClose }: SettingsOverlayProps) {
  const [settings, setSettings] = useState(storage.getSettings())

  useEffect(() => {
    setSettings(storage.getSettings())
  }, [isOpen])

  const updateSetting = (key: keyof typeof settings, value: boolean) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    storage.saveSettings(newSettings)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="container mx-auto px-4 pt-24 max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SettingsIcon className="w-5 h-5 text-[#fbc9ff]" />
                <h2 className="text-2xl font-bold text-white">Settings</h2>
              </div>
              <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="play-trailers" className="text-white font-medium">
                  Show Trailers
                </Label>
                <p className="text-sm text-white/60">Display trailers on movie and TV show pages (muted by default)</p>
              </div>
              <Switch
                id="play-trailers"
                checked={settings.playTrailers}
                onCheckedChange={(checked) => updateSetting("playTrailers", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="show-intro" className="text-white font-medium">
                  Show Intro Animation
                </Label>
                <p className="text-sm text-white/60">Display the LunaStream intro animation on first visit</p>
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
    </div>
  )
}
