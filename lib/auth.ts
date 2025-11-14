import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { auth, db } from "./firebase/config"
import type { User } from "./storage"
import { loginUser, logoutUser, registerUser, getCurrentFirebaseUser } from "./firebase/auth"

export const getCurrentUser = async (): Promise<User | null> => {
  if (typeof window === "undefined") return null
  const user = await getCurrentFirebaseUser()
  return user
}

export const setCurrentUser = (user: User | null) => {
  // Firebase handles session management automatically
}

export const login = async (email: string, password: string): Promise<User | null> => {
  try {
    const user = await loginUser(email, password)
    return user
  } catch (error) {
    console.error("[v0] Login failed:", error)
    return null
  }
}

export const register = async (email: string, password: string, name?: string, department?: string): Promise<User | null> => {
  try {
    const userName = name || email.split("@")[0]
    const userDept = department || "General"
    const user = await registerUser(email, password, userName, userDept)
    return user
  } catch (error) {
    console.error("[v0] Register failed:", error)
    return null
  }
}

export const logout = async () => {
  try {
    await logoutUser()
  } catch (error) {
    console.error("[v0] Logout failed:", error)
  }
}

export const updateUserTokens = async (userId: string, tokens: number) => {
  try {
    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, { tokens })
  } catch (error) {
    console.error("[v0] Failed to update tokens:", error)
  }
}

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
        if (userDoc.exists()) {
          const userData = userDoc.data() as User
          const fullUser = {
            ...userData,
            id: userDoc.id
          }
          callback(fullUser)
        } else {
          callback(null)
        }
      } catch (error) {
        console.error('[v0] Error fetching user doc:', error)
        callback(null)
      }
    } else {
      callback(null)
    }
  })
}
