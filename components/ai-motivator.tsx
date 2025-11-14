"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles } from "lucide-react"

const motivationalMessages = [
  "¡Excelente trabajo! Tus fichas están creciendo. 💪",
  "Recuerda tomar un descanso de 5 minutos cada hora. ☕",
  "Tu progreso es impresionante. ¡Sigue así! 🌟",
  "Hora de estirarte un poco. Tu bienestar es importante. 🧘",
  "¡Has logrado mucho hoy! Mantén el ritmo. 🚀",
  "Tomar agua es clave para mantener la concentración. 💧",
  "Tu dedicación marca la diferencia. ¡Eres increíble! ⭐",
  "Un breve paseo puede renovar tu energía. 🚶",
]

const tokenMilestones = [
  { threshold: 1000, message: "¡Wow! Has alcanzado 1000 fichas. ¡Eres una estrella! 🌟" },
  { threshold: 500, message: "¡Medio millar de fichas! Vas por buen camino. 🎯" },
  { threshold: 100, message: "¡Primera centena! Tu esfuerzo está dando frutos. 🌱" },
]

export function AIMotivator({ userName, tokens }: { userName: string; tokens: number }) {
  const [message, setMessage] = useState("")
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Check for token milestones
    const milestone = tokenMilestones.find((m) => tokens >= m.threshold)
    if (milestone) {
      setMessage(milestone.message)
      return
    }

    // Random motivational message
    const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]
    setMessage(`¡Hola ${userName}! ${randomMessage}`)

    // Rotate message every 2 minutes
    const interval = setInterval(() => {
      const newMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]
      setMessage(`¡Hola ${userName}! ${newMessage}`)
    }, 120000)

    return () => clearInterval(interval)
  }, [userName, tokens])

  if (!isVisible) return null

  return (
    <Card className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-r from-secondary/30 via-background/70 to-secondary/20 shadow-gold">
      <div className="absolute inset-0 opacity-40 blur-2xl bg-[radial-gradient(circle_at_20%_20%,rgba(249,200,81,0.25),transparent_55%),radial-gradient(circle_at_80%_40%,rgba(12,143,120,0.25),transparent_55%)]" />
      <CardContent className="relative flex items-start gap-4 p-6">
        <div className="bg-primary/90 text-primary-foreground p-3 rounded-2xl shrink-0 shadow-gold">
          <Sparkles className="h-6 w-6" />
        </div>
        <div className="flex-1 space-y-2">
          <p className="text-base font-semibold leading-relaxed text-pretty">{message}</p>
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">MotivaAI · Tu asistente motivacional</p>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-muted-foreground hover:text-primary text-sm transition-colors"
          aria-label="Ocultar mensaje motivacional"
        >
          ✕
        </button>
      </CardContent>
    </Card>
  )
}
