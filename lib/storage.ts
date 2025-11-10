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

  localStorage.setItem("motivaplay_users", JSON.stringify(users))
  localStorage.setItem("motivaplay_prizes", JSON.stringify(prizes))
  localStorage.setItem("motivaplay_achievements", JSON.stringify(achievements))
  localStorage.setItem("motivaplay_redemptions", JSON.stringify([]))
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
