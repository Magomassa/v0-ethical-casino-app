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
    console.log('[v0] Setting up auth listener...')
    const unsubscribe = onAuthChange((currentUser) => {
      console.log('[v0] Auth changed:', currentUser ? `User ${currentUser.email}` : 'No user')
      setUser(currentUser)
      setLoading(false)
    })

    const timeout = setTimeout(() => {
      console.log('[v0] Auth listener timeout, forcing loading to false')
      setLoading(false)
    }, 5000)

    return () => {
      clearTimeout(timeout)
      unsubscribe()
    }
  }, [])

  const refreshUser = () => {
    // Firebase handles state automatically, just wait for listener
    setLoading(true)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Cargando...</div>
      </div>
    )
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
