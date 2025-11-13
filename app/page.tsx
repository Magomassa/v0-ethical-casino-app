'use client'

import { useState, useEffect } from 'react'
import { getCurrentUser } from '@/lib/auth'
import { initializeStorage, getUsers } from '@/lib/storage'
import { EmployeeDashboard } from '@/components/employee-dashboard'
import { AdminDashboard } from '@/components/admin-dashboard'
import { AuthForm } from '@/components/auth-form'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('[v0] Initializing storage...')
    initializeStorage()
    
    const allUsers = getUsers()
    console.log('[v0] All users in localStorage:', allUsers)
    console.log('[v0] Number of users:', allUsers.length)
    console.log('[v0] User details:')
    allUsers.forEach(u => {
      console.log(`  - ID ${u.id}: ${u.name} (${u.email}) - Role: ${u.role}`)
    })
    
    console.log('[v0] Storage initialized, checking current user...')
    const currentUser = getCurrentUser()
    console.log('[v0] Current user:', currentUser)
    setUser(currentUser)
    setLoading(false)
  }, [])

  const refreshUser = () => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
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
