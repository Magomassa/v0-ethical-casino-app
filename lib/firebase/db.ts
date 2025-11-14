import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  addDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"
import { db } from "./config"
import type {
  User,
  Prize,
  Achievement,
  AchievementTemplate,
  Redemption,
  Mission,
  MissionSubmission,
  Transaction,
  Friendship,
  FriendRequest,
  Donation,
  UserBadge,
} from "../storage"

// Users
export const getUser = async (userId: string): Promise<User | null> => {
  const userDoc = await getDoc(doc(db, "users", userId))
  return userDoc.exists() ? ({ id: userDoc.id, ...userDoc.data() } as User) : null
}

export const getAllUsers = async (): Promise<User[]> => {
  const usersSnap = await getDocs(collection(db, "users"))
  return usersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as User))
}

export const updateUser = async (userId: string, data: Partial<User>) => {
  await updateDoc(doc(db, "users", userId), data)
}

// Prizes
export const getAllPrizes = async (): Promise<Prize[]> => {
  const prizesSnap = await getDocs(collection(db, "prizes"))
  return prizesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Prize))
}

export const createPrize = async (prize: Omit<Prize, "id">) => {
  await addDoc(collection(db, "prizes"), prize)
}

export const updatePrize = async (prizeId: string, data: Partial<Prize>) => {
  await updateDoc(doc(db, "prizes", prizeId), data)
}

export const deletePrize = async (prizeId: string) => {
  await deleteDoc(doc(db, "prizes", prizeId))
}

// Achievements
export const getUserAchievements = async (userId: string): Promise<Achievement[]> => {
  if (!userId) {
    console.error("[v0] getUserAchievements called with undefined userId")
    return []
  }
  const achievementsSnap = await getDocs(
    query(collection(db, "achievements"), where("userId", "==", userId))
  )
  const achievements = achievementsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Achievement))
  // Sort on client to avoid composite index requirement
  return achievements.sort((a, b) => {
    const dateA = a.date instanceof Date ? a.date : new Date(a.date)
    const dateB = b.date instanceof Date ? b.date : new Date(b.date)
    return dateB.getTime() - dateA.getTime()
  })
}

export const createAchievement = async (achievement: Omit<Achievement, "id">) => {
  await addDoc(collection(db, "achievements"), achievement)
}

// Achievement Templates
export const getAllAchievementTemplates = async (): Promise<AchievementTemplate[]> => {
  const templatesSnap = await getDocs(collection(db, "achievementTemplates"))
  return templatesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as AchievementTemplate))
}

export const createAchievementTemplate = async (template: Omit<AchievementTemplate, "id">) => {
  await addDoc(collection(db, "achievementTemplates"), template)
}

export const updateAchievementTemplate = async (templateId: string, data: Partial<AchievementTemplate>) => {
  await updateDoc(doc(db, "achievementTemplates", templateId), data)
}

// Missions
export const getAllMissions = async (): Promise<Mission[]> => {
  const missionsSnap = await getDocs(collection(db, "missions"))
  return missionsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Mission))
}

export const createMission = async (mission: Omit<Mission, "id">) => {
  await addDoc(collection(db, "missions"), mission)
}

export const updateMission = async (missionId: string, data: Partial<Mission>) => {
  await updateDoc(doc(db, "missions", missionId), data)
}

// Mission Submissions
export const getMissionSubmissions = async (missionId?: string): Promise<MissionSubmission[]> => {
  let q = collection(db, "submissions")
  if (missionId) {
    q = query(collection(db, "submissions"), where("missionId", "==", missionId)) as any
  }
  const submissionsSnap = await getDocs(q)
  return submissionsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as MissionSubmission))
}

export const createSubmission = async (submission: Omit<MissionSubmission, "id">) => {
  await addDoc(collection(db, "submissions"), submission)
}

export const updateSubmission = async (submissionId: string, data: Partial<MissionSubmission>) => {
  await updateDoc(doc(db, "submissions", submissionId), data)
}

// Friendships
export const getUserFriendships = async (userId: string): Promise<Friendship[]> => {
  if (!userId) {
    console.error("[v0] getUserFriendships called with undefined userId")
    return []
  }
  const friendships1 = await getDocs(query(collection(db, "friendships"), where("user1Id", "==", userId)))
  const friendships2 = await getDocs(query(collection(db, "friendships"), where("user2Id", "==", userId)))

  return [...friendships1.docs, ...friendships2.docs].map((doc) => ({ id: doc.id, ...doc.data() } as Friendship))
}

export const createFriendship = async (friendship: Omit<Friendship, "id">) => {
  await addDoc(collection(db, "friendships"), friendship)
}

export const deleteFriendship = async (friendshipId: string) => {
  await deleteDoc(doc(db, "friendships", friendshipId))
}

// Friend Requests
export const getUserFriendRequests = async (userId: string): Promise<FriendRequest[]> => {
  if (!userId) {
    console.error("[v0] getUserFriendRequests called with undefined userId")
    return []
  }
  const requestsSnap = await getDocs(
    query(collection(db, "friendRequests"), where("toUserId", "==", userId), where("status", "==", "pending"))
  )
  return requestsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as FriendRequest))
}

export const createFriendRequest = async (request: Omit<FriendRequest, "id">) => {
  await addDoc(collection(db, "friendRequests"), request)
}

export const updateFriendRequest = async (requestId: string, data: Partial<FriendRequest>) => {
  await updateDoc(doc(db, "friendRequests", requestId), data)
}

// Donations
export const getUserDonations = async (userId: string): Promise<Donation[]> => {
  if (!userId) {
    console.error("[v0] getUserDonations called with undefined userId")
    return []
  }
  const donationsSnap = await getDocs(query(collection(db, "donations"), where("fromUserId", "==", userId)))
  return donationsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Donation))
}

export const createDonation = async (donation: Omit<Donation, "id">) => {
  await addDoc(collection(db, "donations"), donation)
}

// Transactions
export const getUserTransactions = async (userId: string): Promise<Transaction[]> => {
  if (!userId) {
    console.error("[v0] getUserTransactions called with undefined userId")
    return []
  }
  const transactionsSnap = await getDocs(
    query(collection(db, "transactions"), where("userId", "==", userId))
  )
  const transactions = transactionsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Transaction))
  // Sort on client to avoid composite index requirement
  return transactions.sort((a, b) => {
    const dateA = a.date instanceof Date ? a.date : new Date(a.date)
    const dateB = b.date instanceof Date ? b.date : new Date(b.date)
    return dateB.getTime() - dateA.getTime()
  })
}

export const createTransaction = async (transaction: Omit<Transaction, "id">) => {
  await addDoc(collection(db, "transactions"), transaction)
}

// Redemptions
export const getAllRedemptions = async (): Promise<Redemption[]> => {
  const redemptionsSnap = await getDocs(collection(db, "redemptions"))
  return redemptionsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Redemption))
}

export const createRedemption = async (redemption: Omit<Redemption, "id">) => {
  await addDoc(collection(db, "redemptions"), redemption)
}

// User Badges
export const getUserBadges = async (userId: string): Promise<UserBadge[]> => {
  if (!userId) {
    console.error("[v0] getUserBadges called with undefined userId")
    return []
  }
  const badgesSnap = await getDocs(query(collection(db, "userBadges"), where("userId", "==", userId)))
  return badgesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as UserBadge))
}
