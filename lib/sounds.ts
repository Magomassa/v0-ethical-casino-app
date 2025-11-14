// Sistema de sonidos para MotivaPlay
// Usa Web Audio API para generar sonidos sintéticos (sin archivos externos)

type SoundType = "win" | "lose" | "spin" | "coin" | "click" | "redeem" | "achievement"

class SoundManager {
  private audioContext: AudioContext | null = null
  private volume: number = 0.5
  private enabled: boolean = true

  constructor() {
    if (typeof window !== "undefined") {
      // Inicializar AudioContext solo cuando sea necesario (lazy initialization)
      this.loadSettings()
    }
  }

  private loadSettings() {
    if (typeof window === "undefined") return
    const savedVolume = localStorage.getItem("motivaplay_volume")
    const savedEnabled = localStorage.getItem("motivaplay_sounds_enabled")
    if (savedVolume) this.volume = parseFloat(savedVolume)
    if (savedEnabled !== null) this.enabled = savedEnabled === "true"
  }

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return this.audioContext
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume))
    if (typeof window !== "undefined") {
      localStorage.setItem("motivaplay_volume", this.volume.toString())
    }
  }

  getVolume(): number {
    return this.volume
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled
    if (typeof window !== "undefined") {
      localStorage.setItem("motivaplay_sounds_enabled", enabled.toString())
    }
  }

  isEnabled(): boolean {
    return this.enabled
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = "sine", volume: number = 1) {
    if (!this.enabled || this.volume === 0) return

    try {
      const ctx = this.getAudioContext()
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.frequency.value = frequency
      oscillator.type = type

      const finalVolume = this.volume * volume
      gainNode.gain.setValueAtTime(0, ctx.currentTime)
      gainNode.gain.linearRampToValueAtTime(finalVolume, ctx.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + duration)
    } catch (error) {
      // Silently fail if audio context is not available
      console.debug("Audio not available:", error)
    }
  }

  private playChord(frequencies: number[], duration: number, type: OscillatorType = "sine", volume: number = 1) {
    if (!this.enabled || this.volume === 0) return

    try {
      const ctx = this.getAudioContext()
      frequencies.forEach((freq) => {
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)

        oscillator.frequency.value = freq
        oscillator.type = type

        const finalVolume = (this.volume * volume) / frequencies.length
        gainNode.gain.setValueAtTime(0, ctx.currentTime)
        gainNode.gain.linearRampToValueAtTime(finalVolume, ctx.currentTime + 0.01)
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + duration)
      })
    } catch (error) {
      console.debug("Audio not available:", error)
    }
  }

  play(type: SoundType) {
    switch (type) {
      case "win":
        // Acorde ascendente de victoria (mayor)
        this.playChord([523.25, 659.25, 783.99], 0.6, "sine", 0.4)
        break
      case "lose":
        // Tono descendente de derrota
        this.playTone(200, 0.4, "sawtooth", 0.3)
        setTimeout(() => this.playTone(150, 0.3, "sawtooth", 0.3), 200)
        break
      case "spin":
        // Sonido de giro (ruido blanco con filtro)
        this.playTone(300, 0.1, "square", 0.15)
        break
      case "coin":
        // Sonido de ficha (ping metálico)
        this.playTone(800, 0.15, "triangle", 0.3)
        setTimeout(() => this.playTone(1000, 0.1, "triangle", 0.2), 50)
        break
      case "click":
        // Click suave
        this.playTone(1000, 0.05, "square", 0.2)
        break
      case "redeem":
        // Sonido de canje (acorde de éxito)
        this.playChord([392, 523.25, 659.25], 0.5, "sine", 0.35)
        break
      case "achievement":
        // Sonido de logro desbloqueado (fanfarria)
        this.playChord([523.25, 659.25], 0.2, "sine", 0.3)
        setTimeout(() => this.playChord([659.25, 783.99], 0.2, "sine", 0.3), 150)
        setTimeout(() => this.playChord([783.99, 987.77], 0.3, "sine", 0.35), 300)
        break
    }
  }
}

// Singleton instance
export const soundManager = typeof window !== "undefined" ? new SoundManager() : ({} as SoundManager)

