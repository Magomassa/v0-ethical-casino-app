import { 
  getAllUsers, 
  getAllPrizes, 
  getUserAchievements,
  getAllAchievementTemplates,
  getAllRedemptions,
  getAllMissions,
  getMissionSubmissions as getFirebaseMissionSubmissions,
  getUserTransactions,
  getUserFriendRequests as getFirebaseFriendRequests,
  getUserFriendships,
  getUserDonations as getFirebaseDonations,
  getUserBadges as getFirebaseUserBadges
} from "./firebase/db"

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

export const getUsers = async (): Promise<User[]> => {
  return await getAllUsers()
}

export const saveUsers = async (users: User[]) => {
  // Firebase saves users individually via updateUser
  console.warn("[v0] saveUsers is deprecated with Firebase. Use individual user updates instead.")
}

export const getPrizes = async (): Promise<Prize[]> => {
  return await getAllPrizes()
}

export const savePrizes = async (prizes: Prize[]) => {
  console.warn("[v0] savePrizes is deprecated with Firebase. Use individual prize updates instead.")
}

export const getAchievements = async (userId?: string): Promise<Achievement[]> => {
  if (userId) {
    return await getUserAchievements(userId)
  }
  // Get all achievements - need to implement in firebase/db.ts
  return []
}

export const saveAchievements = async (achievements: Achievement[]) => {
  console.warn("[v0] saveAchievements is deprecated with Firebase. Use createAchievement instead.")
}

export const getRedemptions = async (): Promise<Redemption[]> => {
  return await getAllRedemptions()
}

export const saveRedemptions = async (redemptions: Redemption[]) => {
  console.warn("[v0] saveRedemptions is deprecated with Firebase. Use createRedemption instead.")
}

export const getMissions = async (): Promise<Mission[]> => {
  return await getAllMissions()
}

export const saveMissions = async (missions: Mission[]) => {
  console.warn("[v0] saveMissions is deprecated with Firebase. Use individual mission updates instead.")
}

export const getMissionSubmissions = async (missionId?: string): Promise<MissionSubmission[]> => {
  return await getFirebaseMissionSubmissions(missionId)
}

export const saveMissionSubmissions = async (submissions: MissionSubmission[]) => {
  console.warn("[v0] saveMissionSubmissions is deprecated with Firebase. Use createSubmission or updateSubmission instead.")
}

export const getTransactions = async (userId?: string): Promise<Transaction[]> => {
  if (userId) {
    return await getUserTransactions(userId)
  }
  return []
}

export const saveTransactions = async (transactions: Transaction[]) => {
  console.warn("[v0] saveTransactions is deprecated with Firebase. Use createTransaction instead.")
}

export const getFriendRequests = async (userId?: string): Promise<FriendRequest[]> => {
  if (userId) {
    return await getFirebaseFriendRequests(userId)
  }
  return []
}

export const saveFriendRequests = async (requests: FriendRequest[]) => {
  console.warn("[v0] saveFriendRequests is deprecated with Firebase.")
}

export const getFriendships = async (userId?: string): Promise<Friendship[]> => {
  if (userId) {
    return await getUserFriendships(userId)
  }
  return []
}

export const saveFriendships = async (friendships: Friendship[]) => {
  console.warn("[v0] saveFriendships is deprecated with Firebase.")
}

export const getDonations = async (userId?: string): Promise<Donation[]> => {
  if (userId) {
    return await getFirebaseDonations(userId)
  }
  return []
}

export const saveDonations = async (donations: Donation[]) => {
  console.warn("[v0] saveDonations is deprecated with Firebase.")
}

export const getAchievementTemplates = async (): Promise<AchievementTemplate[]> => {
  return await getAllAchievementTemplates()
}

export const saveAchievementTemplates = async (templates: AchievementTemplate[]) => {
  console.warn("[v0] saveAchievementTemplates is deprecated with Firebase.")
}

export const getUserBadges = async (userId?: string): Promise<UserBadge[]> => {
  if (userId) {
    return await getFirebaseUserBadges(userId)
  }
  return []
}

export const saveUserBadges = async (badges: UserBadge[]) => {
  console.warn("[v0] saveUserBadges is deprecated with Firebase.")
}

export const resetStorage = () => {
  console.warn("[v0] resetStorage is not supported with Firebase. Use Firebase Console to reset data.")
}

export const getWeekNumber = (date: Date): number => {
  const startOfYear = new Date(date.getFullYear(), 0, 1)
  const diff = date.getTime() - startOfYear.getTime()
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000))
}

// Storage initialization is handled by Firebase. Run seed script if needed.
export const initializeStorage = () => {
  console.log("[v0] Storage initialization is handled by Firebase. Run seed script if needed.")
}
