import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyAexVMeDSWD_gA_B00Wfgs3NemxxY9RLYo",
  authDomain: "casinorolling-f2e9d.firebaseapp.com",
  projectId: "casinorolling-f2e9d",
  storageBucket: "casinorolling-f2e9d.firebasestorage.app",
  messagingSenderId: "937781538514",
  appId: "1:937781538514:web:e77f2a60277be9cecec70b",
  measurementId: "G-8W8YPNRESZ",
}

// Initialize Firebase (singleton pattern)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const auth = getAuth(app)
const db = getFirestore(app)

export { app, auth, db }
