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
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
      <CardContent className="flex items-start gap-3 p-4">
        <div className="bg-primary text-primary-foreground p-2 rounded-lg shrink-0">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-balance">{message}</p>
          <p className="text-xs text-muted-foreground mt-1">MotivaAI - Tu asistente motivacional</p>
        </div>
        <button onClick={() => setIsVisible(false)} className="text-muted-foreground hover:text-foreground text-xs">
          ✕
        </button>
      </CardContent>
    </Card>
  )
}
