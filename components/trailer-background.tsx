"use client"

import { useEffect, useState } from "react"
import { Volume2, VolumeX } from "lucide-react"
import { storage } from "@/lib/storage"
import { Button } from "@/components/ui/button"

interface TrailerBackgroundProps {
  trailerKey: string | null
  title: string
}

export function TrailerBackground({ trailerKey, title }: TrailerBackgroundProps) {
  const [settings, setSettings] = useState(storage.getSettings())
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    const handleSettingsChange = (e: CustomEvent) => {
      setSettings(e.detail)
    }

    window.addEventListener("settingsChanged" as any, handleSettingsChange)
    return () => window.removeEventListener("settingsChanged" as any, handleSettingsChange)
  }, [])

  if (!trailerKey || !settings.playTrailers || !settings.autoplayTrailers) {
    return null
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      <iframe
        src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&showinfo=0&rel=0&loop=1&playlist=${trailerKey}&enablejsapi=1`}
        title={`${title} Trailer`}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[177.77vh] h-[56.25vw] min-h-full min-w-full"
        allow="autoplay; encrypted-media"
        allowFullScreen
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />

      <Button
        variant="ghost"
        size="icon"
        className="absolute top-6 right-6 bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm border border-white/20 transition-all hover:scale-110"
        onClick={() => setIsMuted(!isMuted)}
      >
        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-[#fbc9ff]" />}
      </Button>
    </div>
  )
}
