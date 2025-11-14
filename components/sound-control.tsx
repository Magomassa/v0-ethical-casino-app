"use client"

import { useState, useEffect } from "react"
import { Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { soundManager } from "@/lib/sounds"

export function SoundControl() {
  const [volume, setVolume] = useState(0.5)
  const [enabled, setEnabled] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setVolume(soundManager.getVolume())
    setEnabled(soundManager.isEnabled())
  }, [])

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    soundManager.setVolume(newVolume)
    if (newVolume > 0 && !enabled) {
      setEnabled(true)
      soundManager.setEnabled(true)
    }
    // Test sound
    soundManager.play("click")
  }

  const toggleEnabled = () => {
    const newEnabled = !enabled
    setEnabled(newEnabled)
    soundManager.setEnabled(newEnabled)
    if (newEnabled) {
      soundManager.play("coin")
    }
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full border border-primary/30 bg-secondary/20 text-muted-foreground hover:text-primary hover:bg-primary/10"
        aria-label="Control de sonido"
      >
        {enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
      </Button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 rounded-2xl border border-primary/30 bg-background/95 backdrop-blur-xl p-4 shadow-gold min-w-[200px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Sonido</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleEnabled}
                className="h-8 w-8 p-0"
                aria-label={enabled ? "Silenciar" : "Activar sonido"}
              >
                {enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
            </div>
            {enabled && (
              <div className="space-y-2">
                <label htmlFor="volume-slider" className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
                  Volumen
                </label>
                <input
                  id="volume-slider"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-secondary/30 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>{Math.round(volume * 100)}%</span>
                  <span>100%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  )
}

