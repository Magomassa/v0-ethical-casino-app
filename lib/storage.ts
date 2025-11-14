export interface User {
  id: string
  email: string
  password: string
  role: "employee" | "admin"
  tokens: number
  createdAt: string
}

export interface Achievement {
  id: string
  userId: string
  title: string
  description: string
  tokensAwarded: number
  date: string
}

export interface Prize {
  id: string
  name: string
  description: string
  cost: number
  image: string
  available: boolean
}

export interface Redemption {
  id: string
  userId: string
  prizeId: string
  prizeName: string
  tokensCost: number
  date: string
  status: "pending" | "completed"
}

export interface Mission {
  id: string
  title: string
  description: string
  category: "development" | "collaboration" | "wellness"
  type: "daily" | "weekly"
  tokensReward: number
  maxProgress: number
  currentProgress: number
  completed: boolean
  createdAt: string
  expiresAt: string
  createdBy: "admin" | "system"
  assignedTo?: string // userId, undefined = todos los empleados
}

// Initialize demo data
export const initializeStorage = () => {
  if (typeof window === "undefined") return

  // Check if already initialized
  if (localStorage.getItem("motivaplay_initialized")) return

  // Demo users
  const users: User[] = [
    {
      id: "1",
      email: "admin@motivaplay.com",
      password: "admin123",
      role: "admin",
      tokens: 10000,
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      email: "empleado@motivaplay.com",
      password: "empleado123",
      role: "employee",
      tokens: 500,
      createdAt: new Date().toISOString(),
    },
  ]

  // Demo prizes
  const prizes: Prize[] = [
    {
      id: "1",
      name: "Día libre extra",
      description: "Un día adicional de vacaciones",
      cost: 1000,
      image: "/vacation-day-calendar.jpg",
      available: true,
    },
    {
      id: "2",
      name: "Almuerzo especial",
      description: "Almuerzo en restaurante premium",
      cost: 300,
      image: "/gourmet-lunch-restaurant.jpg",
      available: true,
    },
    {
      id: "3",
      name: "Curso online",
      description: "Acceso a curso de tu elección",
      cost: 500,
      image: "/online-course-learning.jpg",
      available: true,
    },
    {
      id: "4",
      name: "Membresía gimnasio",
      description: "3 meses de membresía",
      cost: 800,
      image: "/gym-membership-fitness.jpg",
      available: true,
    },
  ]

  // Demo achievements
  const achievements: Achievement[] = [
    {
      id: "1",
      userId: "2",
      title: "Proyecto exitoso",
      description: "Completó el proyecto Q4 antes de tiempo",
      tokensAwarded: 200,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "2",
      userId: "2",
      title: "Mentor del mes",
      description: "Ayudó a 5 compañeros en su onboarding",
      tokensAwarded: 150,
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "3",
      userId: "2",
      title: "Innovación",
      description: "Propuso mejora que aumentó eficiencia 20%",
      tokensAwarded: 150,
      date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]

  // Demo missions
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)

  const nextMonday = new Date(today)
  const daysUntilMonday = (8 - today.getDay()) % 7 || 7
  nextMonday.setDate(today.getDate() + daysUntilMonday)
  nextMonday.setHours(0, 0, 0, 0)

  const missions: Mission[] = [
    {
      id: "1",
      title: "Completar 3 tareas del backlog",
      description: "Marca 3 tareas como completadas en tu sistema de gestión",
      category: "development",
      type: "daily",
      tokensReward: 50,
      maxProgress: 3,
      currentProgress: 0,
      completed: false,
      createdAt: today.toISOString(),
      expiresAt: tomorrow.toISOString(),
      createdBy: "system",
    },
    {
      id: "2",
      title: "Asistir a reunión de equipo",
      description: "Participa activamente en la reunión diaria de sincronización",
      category: "collaboration",
      type: "daily",
      tokensReward: 30,
      maxProgress: 1,
      currentProgress: 0,
      completed: false,
      createdAt: today.toISOString(),
      expiresAt: tomorrow.toISOString(),
      createdBy: "system",
    },
    {
      id: "3",
      title: "Tomar descanso de 15 minutos",
      description: "Tómate un descanso de al menos 15 minutos para recargar energías",
      category: "wellness",
      type: "daily",
      tokensReward: 25,
      maxProgress: 1,
      currentProgress: 0,
      completed: false,
      createdAt: today.toISOString(),
      expiresAt: tomorrow.toISOString(),
      createdBy: "system",
    },
    {
      id: "4",
      title: "Completar 5 code reviews",
      description: "Revisa y aprueba al menos 5 pull requests esta semana",
      category: "development",
      type: "weekly",
      tokensReward: 200,
      maxProgress: 5,
      currentProgress: 0,
      completed: false,
      createdAt: today.toISOString(),
      expiresAt: nextMonday.toISOString(),
      createdBy: "system",
    },
    {
      id: "5",
      title: "Mentoría a compañero",
      description: "Ayuda a un compañero con su onboarding o proyecto",
      category: "collaboration",
      type: "weekly",
      tokensReward: 150,
      maxProgress: 1,
      currentProgress: 0,
      completed: false,
      createdAt: today.toISOString(),
      expiresAt: nextMonday.toISOString(),
      createdBy: "system",
    },
  ]

  localStorage.setItem("motivaplay_users", JSON.stringify(users))
  localStorage.setItem("motivaplay_prizes", JSON.stringify(prizes))
  localStorage.setItem("motivaplay_achievements", JSON.stringify(achievements))
  localStorage.setItem("motivaplay_redemptions", JSON.stringify([]))
  localStorage.setItem("motivaplay_missions", JSON.stringify(missions))
  localStorage.setItem("motivaplay_initialized", "true")
}

// Storage helpers
export const getUsers = (): User[] => {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem("motivaplay_users")
  return data ? JSON.parse(data) : []
}

export const saveUsers = (users: User[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem("motivaplay_users", JSON.stringify(users))
}

export const getPrizes = (): Prize[] => {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem("motivaplay_prizes")
  return data ? JSON.parse(data) : []
}

export const savePrizes = (prizes: Prize[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem("motivaplay_prizes", JSON.stringify(prizes))
}

export const getAchievements = (): Achievement[] => {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem("motivaplay_achievements")
  return data ? JSON.parse(data) : []
}

export const saveAchievements = (achievements: Achievement[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem("motivaplay_achievements", JSON.stringify(achievements))
}

export const getRedemptions = (): Redemption[] => {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem("motivaplay_redemptions")
  return data ? JSON.parse(data) : []
}

export const saveRedemptions = (redemptions: Redemption[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem("motivaplay_redemptions", JSON.stringify(redemptions))
}

export const getMissions = (): Mission[] => {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem("motivaplay_missions")
  return data ? JSON.parse(data) : []
}

export const saveMissions = (missions: Mission[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem("motivaplay_missions", JSON.stringify(missions))
}

export const getUserMissions = (userId?: string): Mission[] => {
  const allMissions = getMissions()
  const now = new Date()

  return allMissions.filter((mission) => {
    // Filtrar misiones expiradas
    if (new Date(mission.expiresAt) < now) return false

    // Si tiene assignedTo, solo mostrar si es para este usuario
    if (mission.assignedTo && mission.assignedTo !== userId) return false

    // Si no tiene assignedTo, es para todos
    return true
  })
}

export const updateMissionProgress = (missionId: string, progress: number, userId?: string): boolean => {
  const missions = getMissions()
  const mission = missions.find((m) => m.id === missionId)

  if (!mission) return false

  // Verificar que la misión no esté expirada
  if (new Date(mission.expiresAt) < new Date()) return false

  // Verificar que no esté ya completada
  if (mission.completed) return false

  // Actualizar progreso
  mission.currentProgress = Math.min(progress, mission.maxProgress)

  // Si alcanzó el máximo, marcar como completada
  if (mission.currentProgress >= mission.maxProgress) {
    mission.completed = true
  }

  saveMissions(missions)
  return mission.completed
}
