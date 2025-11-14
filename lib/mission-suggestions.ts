// Sistema de sugerencias automáticas de misiones

import type { Mission } from "./storage"

const dailySuggestions: Omit<Mission, "id" | "createdAt" | "expiresAt" | "currentProgress" | "completed">[] = [
  {
    title: "Completar 3 tareas del backlog",
    description: "Marca 3 tareas como completadas en tu sistema de gestión",
    category: "development",
    type: "daily",
    tokensReward: 50,
    maxProgress: 3,
    createdBy: "system",
  },
  {
    title: "Asistir a reunión de equipo",
    description: "Participa activamente en la reunión diaria de sincronización",
    category: "collaboration",
    type: "daily",
    tokensReward: 30,
    maxProgress: 1,
    createdBy: "system",
  },
  {
    title: "Tomar descanso de 15 minutos",
    description: "Tómate un descanso de al menos 15 minutos para recargar energías",
    category: "wellness",
    type: "daily",
    tokensReward: 25,
    maxProgress: 1,
    createdBy: "system",
  },
  {
    title: "Escribir documentación",
    description: "Documenta una función o proceso importante que hayas trabajado",
    category: "development",
    type: "daily",
    tokensReward: 40,
    maxProgress: 1,
    createdBy: "system",
  },
  {
    title: "Code review a compañero",
    description: "Revisa y comenta al menos un pull request de un compañero",
    category: "collaboration",
    type: "daily",
    tokensReward: 35,
    maxProgress: 1,
    createdBy: "system",
  },
  {
    title: "Hidratación constante",
    description: "Bebe al menos 6 vasos de agua durante tu jornada",
    category: "wellness",
    type: "daily",
    tokensReward: 20,
    maxProgress: 1,
    createdBy: "system",
  },
  {
    title: "Resolver 2 bugs",
    description: "Identifica y resuelve al menos 2 bugs en el proyecto",
    category: "development",
    type: "daily",
    tokensReward: 60,
    maxProgress: 2,
    createdBy: "system",
  },
]

const weeklySuggestions: Omit<Mission, "id" | "createdAt" | "expiresAt" | "currentProgress" | "completed">[] = [
  {
    title: "Completar 5 code reviews",
    description: "Revisa y aprueba al menos 5 pull requests esta semana",
    category: "development",
    type: "weekly",
    tokensReward: 200,
    maxProgress: 5,
    createdBy: "system",
  },
  {
    title: "Mentoría a compañero",
    description: "Ayuda a un compañero con su onboarding o proyecto",
    category: "collaboration",
    type: "weekly",
    tokensReward: 150,
    maxProgress: 1,
    createdBy: "system",
  },
  {
    title: "Completar sprint sin bloqueos",
    description: "Termina la semana sin tareas bloqueadas en tu sprint",
    category: "development",
    type: "weekly",
    tokensReward: 180,
    maxProgress: 1,
    createdBy: "system",
  },
  {
    title: "Organizar sesión de conocimiento",
    description: "Comparte conocimiento con el equipo en una sesión o documentación",
    category: "collaboration",
    type: "weekly",
    tokensReward: 175,
    maxProgress: 1,
    createdBy: "system",
  },
  {
    title: "Ejercicio físico",
    description: "Realiza al menos 3 sesiones de ejercicio esta semana",
    category: "wellness",
    type: "weekly",
    tokensReward: 120,
    maxProgress: 3,
    createdBy: "system",
  },
]

export function generateDailyMissions(): Mission[] {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)

  // Seleccionar 3-5 misiones diarias aleatorias
  const selected = dailySuggestions
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.floor(Math.random() * 3) + 3) // Entre 3 y 5 misiones

  return selected.map((suggestion, index) => ({
    ...suggestion,
    id: `daily-${Date.now()}-${index}`,
    createdAt: today.toISOString(),
    expiresAt: tomorrow.toISOString(),
    currentProgress: 0,
    completed: false,
  }))
}

export function generateWeeklyMissions(): Mission[] {
  const today = new Date()
  const nextMonday = new Date(today)
  const daysUntilMonday = (8 - today.getDay()) % 7 || 7
  nextMonday.setDate(today.getDate() + daysUntilMonday)
  nextMonday.setHours(0, 0, 0, 0)

  // Seleccionar exactamente 3 misiones semanales
  const selected = weeklySuggestions.sort(() => Math.random() - 0.5).slice(0, 3)

  return selected.map((suggestion, index) => ({
    ...suggestion,
    id: `weekly-${Date.now()}-${index}`,
    createdAt: today.toISOString(),
    expiresAt: nextMonday.toISOString(),
    currentProgress: 0,
    completed: false,
  }))
}

export function shouldRegenerateDailyMissions(lastGenerationDate?: string): boolean {
  if (!lastGenerationDate) return true

  const lastGen = new Date(lastGenerationDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  lastGen.setHours(0, 0, 0, 0)

  return lastGen.getTime() < today.getTime()
}

export function shouldRegenerateWeeklyMissions(lastGenerationDate?: string): boolean {
  if (!lastGenerationDate) return true

  const lastGen = new Date(lastGenerationDate)
  const today = new Date()

  // Si es lunes y la última generación fue antes de hoy
  if (today.getDay() === 1) {
    const lastMonday = new Date(lastGen)
    lastMonday.setDate(lastGen.getDate() - ((lastGen.getDay() + 6) % 7))
    lastMonday.setHours(0, 0, 0, 0)

    const thisMonday = new Date(today)
    thisMonday.setDate(today.getDate() - ((today.getDay() + 6) % 7))
    thisMonday.setHours(0, 0, 0, 0)

    return lastMonday.getTime() < thisMonday.getTime()
  }

  return false
}

