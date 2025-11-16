"use client"

import { useEffect, useState } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { BrandImage } from "@/components/brand-image"
import { Coins, LogOut, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { onAuthChange, logout } from "@/lib/auth"
import type { User } from "@/lib/storage"

export function HeaderBar() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsub = onAuthChange(setUser)
    return () => unsub()
  }, [])

  const handleLogout = async () => {
    await logout()
    setUser(null)
    // Redirigir a inicio
    window.location.href = "/"
  }

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md border-b border-[var(--border)]/60">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3">
          {/* Desktop: título PNG (fallback a SVG) */}
          <div className="hidden md:block" style={{ maxWidth: 'none', width: 'auto' }}>
            <BrandImage 
              name="pngtitulo" 
              alt="MotivaPlay" 
              className="h-32 w-auto min-h-[8rem] object-contain" 
              style={{ height: '8rem', maxHeight: 'none' }}
            />
          </div>
          {/* Mobile: ícono */}
          <div className="md:hidden">
            <BrandImage name="pnglogo" alt="MP" className="h-9 w-9" />
          </div>
        </a>
        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-3">
              {user.role === "employee" && (
                <div className="flex items-center gap-2 bg-accent/70 px-4 py-2 rounded-lg border border-[var(--border)]/40">
                  <Coins className="h-5 w-5 text-secondary" />
                  <span className="font-bold text-lg">{user.tokens}</span>
                  <span className="text-sm text-muted-foreground">fichas</span>
                </div>
              )}
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>{user.name || user.email}</span>
              </div>
            </div>
          )}
          <ThemeToggle />
          {user && (
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}