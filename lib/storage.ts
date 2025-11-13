export interface User {
  id: string
  name: string
  email: string
  password: string
  role: "employee" | "admin"
  tokens: number
  department: string
  createdAt: string
}

export interface AchievementTemplate {
  id: string
  title: string
  description: string
  reward: number
  badgeUrl: string
  platinumRequirement: number
  category: "esfuerzo" | "productividad" | "aprendizaje" | "innovacion" | "colaboracion"
}

export interface Achievement {
  id: string
  userId: string
  templateId: string
  title: string
  description: string
  tokensAwarded: number
  date: string
  count: number // How many times this achievement has been earned
}

export interface Prize {
  id: string
  name: string
  description: string
  cost: number
  image: string
  available: boolean
  discount?: number // Percentage discount (0-100)
  label?: string // Special label like "Por tiempo limitado"
  originalCost?: number // Original cost before discount
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
  type: "curso" | "proyecto" | "voluntariado" | "idea"
  description: string
  tokenReward: number
  evidenceRequired: boolean
  startAt?: string
  endAt?: string
  active: boolean
  tags: string[]
  maxPerUser: number
}

export interface MissionSubmission {
  id: string
  missionId: string
  userId: string
  evidenceUrl?: string
  evidenceText?: string
  status: "pending" | "approved" | "rejected"
  reviewedBy?: string
  reviewNotes?: string
  createdAt: string
  reviewedAt?: string
}

export interface Donation {
  id: string
  fromUserId: string
  toUserId: string
  amount: number
  date: string
  weekNumber: number // For weekly limit tracking
}

export interface Friendship {
  id: string
  user1Id: string
  user2Id: string
  createdAt: string
}

export interface UserBadge {
  userId: string
  templateId: string
  rank: "bronze" | "silver" | "gold" | "platinum"
  count: number
  earnedAt: string
}

export interface FriendRequest {
  id: string
  fromUserId: string
  toUserId: string
  status: "pending" | "accepted" | "rejected"
  createdAt: string
}

export type TransactionSource = "mission" | "play" | "admin" | "reward" | "bonus" | "achievement" | "donation"

export interface Transaction {
  id: string
  userId: string
  type: "credit" | "debit"
  amount: number
  source: TransactionSource
  sourceRef?: string
  description: string
  date: string
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
      name: "Admin User",
      email: "admin@motivaplay.com",
      password: "admin123",
      role: "admin",
      tokens: 10000,
      department: "Administración",
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      name: "Juan Empleado",
      email: "empleado@motivaplay.com",
      password: "empleado123",
      role: "employee",
      tokens: 500,
      department: "Tecnología",
      createdAt: new Date().toISOString(),
    },
    {
      id: "3",
      name: "María Amiga",
      email: "amiga@motivaplay.com",
      password: "amiga123",
      role: "employee",
      tokens: 350,
      department: "Ventas",
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
      templateId: "tmpl_9",
      title: "Misión Cumplida",
      description: "Completa 5 misiones del tablero",
      tokensAwarded: 200,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      count: 1,
    },
    {
      id: "2",
      userId: "2",
      templateId: "tmpl_3",
      title: "Campeón del Equipo",
      description: "Ayuda a 3 compañeros a resolver problemas",
      tokensAwarded: 200,
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      count: 1,
    },
  ]

  const missions: Mission[] = [
    {
      id: "1",
      title: "Completar curso de desarrollo profesional",
      type: "curso",
      description: "Completa cualquier curso en línea relacionado con tu rol y presenta el certificado",
      tokenReward: 300,
      evidenceRequired: true,
      active: true,
      tags: ["desarrollo", "educación"],
      maxPerUser: 3,
    },
    {
      id: "2",
      title: "Proponer idea innovadora",
      type: "idea",
      description: "Propón una idea para mejorar procesos internos o productos",
      tokenReward: 200,
      evidenceRequired: true,
      active: true,
      tags: ["innovación", "creatividad"],
      maxPerUser: 5,
    },
    {
      id: "3",
      title: "Completar proyecto especial",
      type: "proyecto",
      description: "Lidera o participa activamente en un proyecto especial de la empresa",
      tokenReward: 500,
      evidenceRequired: true,
      active: true,
      tags: ["liderazgo", "proyecto"],
      maxPerUser: 2,
    },
    {
      id: "4",
      title: "Voluntariado comunitario",
      type: "voluntariado",
      description: "Participa en actividades de voluntariado representando a la empresa",
      tokenReward: 250,
      evidenceRequired: true,
      active: true,
      tags: ["comunidad", "social"],
      maxPerUser: 4,
    },
  ]

  const achievementTemplates: AchievementTemplate[] = [
    {
      id: "tmpl_1",
      title: "Primer Día Productivo",
      description: "Completa todas tus tareas del primer día",
      reward: 100,
      badgeUrl: "/first-day-badge.jpg",
      platinumRequirement: 5,
      category: "productividad",
    },
    {
      id: "tmpl_2",
      title: "Maestro del Aprendizaje",
      description: "Completa un curso de desarrollo profesional",
      reward: 150,
      badgeUrl: "/learning-master-badge.jpg",
      platinumRequirement: 10,
      category: "aprendizaje",
    },
    {
      id: "tmpl_3",
      title: "Campeón del Equipo",
      description: "Ayuda a 3 compañeros a resolver problemas",
      reward: 200,
      badgeUrl: "/team-champion-badge.jpg",
      platinumRequirement: 15,
      category: "colaboracion",
    },
    {
      id: "tmpl_4",
      title: "Genio de la Innovación",
      description: "Propón una idea innovadora implementada",
      reward: 250,
      badgeUrl: "/innovation-genius-badge.jpg",
      platinumRequirement: 8,
      category: "innovacion",
    },
    {
      id: "tmpl_5",
      title: "Constancia de Oro",
      description: "Llega temprano 20 días consecutivos",
      reward: 180,
      badgeUrl: "/consistency-gold-badge.jpg",
      platinumRequirement: 12,
      category: "esfuerzo",
    },
    {
      id: "tmpl_6",
      title: "Puntualidad Premium",
      description: "Entrega todos los proyectos a tiempo durante un mes",
      reward: 220,
      badgeUrl: "/punctuality-premium-badge.jpg",
      platinumRequirement: 10,
      category: "productividad",
    },
    {
      id: "tmpl_7",
      title: "Jugador Estratega",
      description: "Participa en sesiones de planificación estratégica",
      reward: 170,
      badgeUrl: "/strategic-player-badge.jpg",
      platinumRequirement: 7,
      category: "innovacion",
    },
    {
      id: "tmpl_8",
      title: "Empleado 5 Estrellas",
      description: "Recibe evaluación perfecta del cliente",
      reward: 300,
      badgeUrl: "/five-star-employee-badge.jpg",
      platinumRequirement: 6,
      category: "esfuerzo",
    },
    {
      id: "tmpl_9",
      title: "Misión Cumplida",
      description: "Completa 5 misiones del tablero",
      reward: 200,
      badgeUrl: "/mission-accomplished-badge.jpg",
      platinumRequirement: 20,
      category: "productividad",
    },
    {
      id: "tmpl_10",
      title: "Espíritu Colaborativo",
      description: "Participa en evento de voluntariado",
      reward: 190,
      badgeUrl: "/collaborative-spirit-badge.jpg",
      platinumRequirement: 10,
      category: "colaboracion",
    },
  ]

  const friendships: Friendship[] = [
    {
      id: "1",
      user1Id: "2",
      user2Id: "3",
      createdAt: new Date().toISOString(),
    },
  ]

  const friendRequests: FriendRequest[] = []

  localStorage.setItem("motivaplay_users", JSON.stringify(users))
  localStorage.setItem("motivaplay_prizes", JSON.stringify(prizes))
  localStorage.setItem("motivaplay_achievements", JSON.stringify(achievements))
  localStorage.setItem("motivaplay_achievement_templates", JSON.stringify(achievementTemplates))
  localStorage.setItem("motivaplay_redemptions", JSON.stringify([]))
  localStorage.setItem("motivaplay_missions", JSON.stringify(missions))
  localStorage.setItem("motivaplay_submissions", JSON.stringify([]))
  localStorage.setItem("motivaplay_transactions", JSON.stringify([]))
  localStorage.setItem("motivaplay_friend_requests", JSON.stringify(friendRequests))
  localStorage.setItem("motivaplay_friendships", JSON.stringify(friendships))
  localStorage.setItem("motivaplay_donations", JSON.stringify([]))
  localStorage.setItem("motivaplay_user_badges", JSON.stringify([]))
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

export const getMissionSubmissions = (): MissionSubmission[] => {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem("motivaplay_submissions")
  return data ? JSON.parse(data) : []
}

export const saveMissionSubmissions = (submissions: MissionSubmission[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem("motivaplay_submissions", JSON.stringify(submissions))
}

export const getTransactions = (): Transaction[] => {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem("motivaplay_transactions")
  return data ? JSON.parse(data) : []
}

export const saveTransactions = (transactions: Transaction[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem("motivaplay_transactions", JSON.stringify(transactions))
}

export const getFriendRequests = (): FriendRequest[] => {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem("motivaplay_friend_requests")
  return data ? JSON.parse(data) : []
}

export const saveFriendRequests = (requests: FriendRequest[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem("motivaplay_friend_requests", JSON.stringify(requests))
}

export const getFriendships = (): Friendship[] => {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem("motivaplay_friendships")
  return data ? JSON.parse(data) : []
}

export const saveFriendships = (friendships: Friendship[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem("motivaplay_friendships", JSON.stringify(friendships))
}

export const getDonations = (): Donation[] => {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem("motivaplay_donations")
  return data ? JSON.parse(data) : []
}

export const saveDonations = (donations: Donation[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem("motivaplay_donations", JSON.stringify(donations))
}

export const getAchievementTemplates = (): AchievementTemplate[] => {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem("motivaplay_achievement_templates")
  return data ? JSON.parse(data) : []
}

export const saveAchievementTemplates = (templates: AchievementTemplate[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem("motivaplay_achievement_templates", JSON.stringify(templates))
}

export const getUserBadges = (): UserBadge[] => {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem("motivaplay_user_badges")
  return data ? JSON.parse(data) : []
}

export const saveUserBadges = (badges: UserBadge[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem("motivaplay_user_badges", JSON.stringify(badges))
}

export const resetStorage = () => {
  if (typeof window === "undefined") return

  // Clear all existing data
  localStorage.removeItem("motivaplay_initialized")
  localStorage.removeItem("motivaplay_users")
  localStorage.removeItem("motivaplay_prizes")
  localStorage.removeItem("motivaplay_achievements")
  localStorage.removeItem("motivaplay_achievement_templates")
  localStorage.removeItem("motivaplay_redemptions")
  localStorage.removeItem("motivaplay_missions")
  localStorage.removeItem("motivaplay_submissions")
  localStorage.removeItem("motivaplay_transactions")
  localStorage.removeItem("motivaplay_friend_requests")
  localStorage.removeItem("motivaplay_friendships")
  localStorage.removeItem("motivaplay_donations")
  localStorage.removeItem("motivaplay_user_badges")
  localStorage.removeItem("motivaplay_currentUser")

  // Reinitialize with fresh data
  initializeStorage()
}

export const getWeekNumber = (date: Date): number => {
  const startOfYear = new Date(date.getFullYear(), 0, 1)
  const diff = date.getTime() - startOfYear.getTime()
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000))
}
