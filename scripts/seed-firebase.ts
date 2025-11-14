// Run this script manually to seed Firebase with demo data
// Instructions:
// 1. Install dependencies: npm install
// 2. Set up Firebase environment variables in .env.local
// 3. Run: npx tsx scripts/seed-firebase.ts

import { initializeApp } from "firebase/app"
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"
import { getFirestore, doc, setDoc, collection } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

async function seedDatabase() {
  try {
    console.log("Starting Firebase seeding...")

    // Create demo users
    const users = [
      {
        email: "admin@motivaplay.com",
        password: "admin123",
        name: "Admin User",
        role: "admin" as const,
        tokens: 10000,
        department: "Administración",
      },
      {
        email: "empleado@motivaplay.com",
        password: "empleado123",
        name: "Juan Empleado",
        role: "employee" as const,
        tokens: 500,
        department: "Tecnología",
      },
      {
        email: "amiga@motivaplay.com",
        password: "amiga123",
        name: "María Amiga",
        role: "employee" as const,
        tokens: 350,
        department: "Ventas",
      },
    ]

    for (const userData of users) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password)
        const userId = userCredential.user.uid

        await setDoc(doc(db, "users", userId), {
          id: userId,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          tokens: userData.tokens,
          department: userData.department,
          createdAt: new Date().toISOString(),
        })

        console.log(`Created user: ${userData.email}`)
      } catch (error: any) {
        if (error.code === "auth/email-already-in-use") {
          console.log(`User already exists: ${userData.email}`)
        } else {
          console.error(`Error creating user ${userData.email}:`, error.message)
        }
      }
    }

    console.log("Firebase seeding completed!")
  } catch (error) {
    console.error("Seeding error:", error)
  }
}

seedDatabase()
