"use client"

import { useEffect, useState } from "react"
import { AuthForm } from "@/components/auth-form"
import { EmployeeDashboard } from "@/components/employee-dashboard"
import { AdminDashboard } from "@/components/admin-dashboard"
import { getCurrentUser } from "@/lib/auth"
import { initializeStorage } from "@/lib/storage"

export default function Home() {
  const [user, setUser] = useState(getCurrentUser())
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    initializeStorage()
    setUser(getCurrentUser())
  }, [])

  if (!isClient) return null

  if (!user) {
    return <AuthForm onSuccess={() => setUser(getCurrentUser())} />
  }

  if (user.role === "admin") {
    return <AdminDashboard />
  }

  return <EmployeeDashboard />
}
