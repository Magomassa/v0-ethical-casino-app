import { collection, doc, setDoc, getDocs } from "firebase/firestore"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth, db } from "./config"
import type {
  User,
  Prize,
  Achievement,
  AchievementTemplate,
  Mission,
  Friendship,
} from "../storage"

export const seedFirebase = async () => {
  console.log("[v0] Starting Firebase seed...")

  // Check if already seeded
  const usersSnap = await getDocs(collection(db, "users"))
  if (!usersSnap.empty) {
    console.log("[v0] Firebase already seeded")
    return
  }

  try {
    // Create users in Firebase Auth and Firestore
    const users = [
      {
        email: "admin@motivaplay.com",
        password: "admin123",
        data: {
          name: "Admin User",
          role: "admin",
          tokens: 10000,
          department: "Administración",
          createdAt: new Date().toISOString(),
        },
      },
      {
        email: "empleado@motivaplay.com",
        password: "empleado123",
        data: {
          name: "Juan Empleado",
          role: "employee",
          tokens: 500,
          department: "Tecnología",
          createdAt: new Date().toISOString(),
        },
      },
      {
        email: "amiga@motivaplay.com",
        password: "amiga123",
        data: {
          name: "María Amiga",
          role: "employee",
          tokens: 350,
          department: "Ventas",
          createdAt: new Date().toISOString(),
        },
      },
    ]

    const createdUserIds: string[] = []

    for (const user of users) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password)
        await setDoc(doc(db, "users", userCredential.user.uid), {
          ...user.data,
          email: user.email,
        })
        createdUserIds.push(userCredential.user.uid)
        console.log(`[v0] Created user: ${user.email}`)
      } catch (error: any) {
        console.log(`[v0] User ${user.email} might already exist, skipping...`)
      }
    }

    // Create prizes
    const prizes: Omit<Prize, "id">[] = [
      {
        name: "Día libre extra",
        description: "Un día adicional de vacaciones",
        cost: 1000,
        image: "/vacation-day-calendar.jpg",
        available: true,
      },
      {
        name: "Almuerzo especial",
        description: "Almuerzo en restaurante premium",
        cost: 300,
        image: "/gourmet-lunch-restaurant.jpg",
        available: true,
      },
      {
        name: "Curso online",
        description: "Acceso a curso de tu elección",
        cost: 500,
        image: "/online-course-learning.jpg",
        available: true,
      },
    ]

    for (const prize of prizes) {
      await setDoc(doc(collection(db, "prizes")), prize)
    }
    console.log("[v0] Created prizes")

    // Create achievement templates
    const templates: Omit<AchievementTemplate, "id">[] = [
      {
        title: "Primer Día Productivo",
        description: "Completa todas tus tareas del primer día",
        reward: 100,
        badgeUrl: "/first-day-badge.jpg",
        platinumRequirement: 5,
        category: "productividad",
      },
      {
        title: "Maestro del Aprendizaje",
        description: "Completa un curso de desarrollo profesional",
        reward: 150,
        badgeUrl: "/learning-master-badge.jpg",
        platinumRequirement: 10,
        category: "aprendizaje",
      },
      {
        title: "Campeón del Equipo",
        description: "Ayuda a 3 compañeros a resolver problemas",
        reward: 200,
        badgeUrl: "/team-champion-badge.jpg",
        platinumRequirement: 15,
        category: "colaboracion",
      },
    ]

    for (const template of templates) {
      await setDoc(doc(collection(db, "achievementTemplates")), template)
    }
    console.log("[v0] Created achievement templates")

    // Create missions
    const missions: Omit<Mission, "id">[] = [
      {
        title: "Completar curso de desarrollo profesional",
        type: "curso",
        description: "Completa cualquier curso en línea relacionado con tu rol",
        tokenReward: 300,
        evidenceRequired: true,
        active: true,
        tags: ["desarrollo", "educación"],
        maxPerUser: 3,
      },
      {
        title: "Proponer idea innovadora",
        type: "idea",
        description: "Propón una idea para mejorar procesos internos",
        tokenReward: 200,
        evidenceRequired: true,
        active: true,
        tags: ["innovación", "creatividad"],
        maxPerUser: 5,
      },
    ]

    for (const mission of missions) {
      await setDoc(doc(collection(db, "missions")), mission)
    }
    console.log("[v0] Created missions")

    // Create friendship between Juan and María if both users were created
    if (createdUserIds.length >= 2) {
      await setDoc(doc(collection(db, "friendships")), {
        user1Id: createdUserIds[1],
        user2Id: createdUserIds[2],
        createdAt: new Date().toISOString(),
      })
      console.log("[v0] Created friendship")
    }

    console.log("[v0] Firebase seed completed!")
  } catch (error) {
    console.error("[v0] Error seeding Firebase:", error)
  }
}
