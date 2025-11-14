import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, db } from "./config"
import type { User } from "../storage"

export const registerUser = async (email: string, password: string, name: string, department: string = "General") => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    const userProfile: User = {
      id: firebaseUser.uid,
      name,
      email,
      password: "",
      role: "employee",
      tokens: 100,
      department,
      createdAt: new Date().toISOString(),
    }

    await setDoc(doc(db, "users", firebaseUser.uid), userProfile)

    return userProfile
  } catch (error: any) {
    console.error("[v0] Register error:", error.message)
    throw error
  }
}

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const userDoc = await getDoc(doc(db, "users", userCredential.user.uid))

    if (userDoc.exists()) {
      const userData = userDoc.data() as User
      const fullUser = {
        ...userData,
        id: userDoc.id
      }
      return fullUser
    }

    console.error('[v0] User profile not found in Firestore')
    throw new Error("User profile not found")
  } catch (error: any) {
    console.error("[v0] Login error:", error.message)
    throw error
  }
}

export const logoutUser = async () => {
  try {
    await signOut(auth)
  } catch (error: any) {
    console.error("[v0] Logout error:", error.message)
    throw error
  }
}

export const getCurrentFirebaseUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data() as User
            const fullUser = {
              ...userData,
              id: userDoc.id
            }
            resolve(fullUser)
          } else {
            resolve(null)
          }
        } catch (error) {
          console.error('[v0] getCurrentFirebaseUser error:', error)
          resolve(null)
        }
      } else {
        resolve(null)
      }
      unsubscribe()
    })
  })
}
