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
    console.log('[v0] Registering user:', email)
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
    console.log('[v0] User registered successfully:', email)

    return userProfile
  } catch (error: any) {
    console.error("[v0] Register error:", error.message)
    throw error
  }
}

export const loginUser = async (email: string, password: string) => {
  try {
    console.log('[v0] Firebase loginUser called for:', email)
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    console.log('[v0] Firebase auth successful, fetching user doc...')
    const userDoc = await getDoc(doc(db, "users", userCredential.user.uid))

    if (userDoc.exists()) {
      const userData = userDoc.data() as User
      const fullUser = {
        ...userData,
        id: userDoc.id
      }
      console.log('[v0] User doc fetched successfully:', fullUser.email)
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
  console.log('[v0] getCurrentFirebaseUser called')
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('[v0] getCurrentFirebaseUser auth state:', firebaseUser ? firebaseUser.uid : 'null')
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data() as User
            const fullUser = {
              ...userData,
              id: userDoc.id
            }
            console.log('[v0] getCurrentFirebaseUser resolved with:', fullUser.email)
            resolve(fullUser)
          } else {
            console.log('[v0] getCurrentFirebaseUser: user doc not found')
            resolve(null)
          }
        } catch (error) {
          console.error('[v0] getCurrentFirebaseUser error:', error)
          resolve(null)
        }
      } else {
        console.log('[v0] getCurrentFirebaseUser: no firebase user')
        resolve(null)
      }
      unsubscribe()
    })
  })
}
