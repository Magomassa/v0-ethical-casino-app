'use client'

import { useState, useEffect } from 'react'
import { onAuthChange } from '@/lib/auth'
import type { User } from '@/lib/storage'
import { EmployeeDashboard } from '@/components/employee-dashboard'
import { AdminDashboard } from '@/components/admin-dashboard'
import { AuthForm } from '@/components/auth-form'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    const timeout = setTimeout(() => {
      setLoading(false)
    }, 5000)

    return () => {
      clearTimeout(timeout)
      unsubscribe()
    }
  }, [])

  const refreshUser = () => {
    setLoading(true)
  }



  if (!user) {
    return <AuthForm onSuccess={refreshUser} />
  }

  return user.role === 'admin' ? (
    <AdminDashboard user={user} onLogout={() => setUser(null)} />
  ) : (
    <EmployeeDashboard user={user} onLogout={() => setUser(null)} />
  )
}
