import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { auth, db } from "./firebase/config"
import type { User } from "./storage"
import { loginUser, logoutUser, registerUser, getCurrentFirebaseUser } from "./firebase/auth"

export const getCurrentUser = async (): Promise<User | null> => {
  if (typeof window === "undefined") return null
  console.log('[v0] Getting current user...')
  const user = await getCurrentFirebaseUser()
  console.log('[v0] Current user result:', user ? user.email : 'null')
  return user
}

export const setCurrentUser = (user: User | null) => {
  // Firebase handles session management automatically
}

export const login = async (email: string, password: string): Promise<User | null> => {
  try {
    console.log('[v0] Login attempt for:', email)
    const user = await loginUser(email, password)
    console.log('[v0] Login successful:', user.email)
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
  console.log('[v0] Setting up onAuthChange listener')
  return onAuthStateChanged(auth, async (firebaseUser) => {
    console.log('[v0] Auth state changed, firebaseUser:', firebaseUser ? firebaseUser.uid : 'null')
    if (firebaseUser) {
      console.log('[v0] Fetching user doc from Firestore...')
      try {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
        console.log('[v0] User doc exists:', userDoc.exists())
        if (userDoc.exists()) {
          const userData = userDoc.data() as User
          const fullUser = {
            ...userData,
            id: userDoc.id
          }
          console.log('[v0] Calling callback with user:', fullUser.email)
          callback(fullUser)
        } else {
          console.log('[v0] User doc does not exist, calling callback with null')
          callback(null)
        }
      } catch (error) {
        console.error('[v0] Error fetching user doc:', error)
        callback(null)
      }
    } else {
      console.log('[v0] No firebaseUser, calling callback with null')
      callback(null)
    }
  })
}
