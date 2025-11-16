"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { login, register } from "@/lib/auth"
import { Sparkles, Crown, Shield } from 'lucide-react'
import { BrandImage } from "@/components/brand-image"

export function AuthForm({ onSuccess }: { onSuccess: () => void }) {
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const user = await login(loginEmail, loginPassword)
      if (user) {
        onSuccess()
      } else {
        setError("Credenciales incorrectas")
      }
    } catch (error) {
      setError("Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const user = await register(registerEmail, registerPassword)
      if (user) {
        onSuccess()
      } else {
        setError("El email ya está registrado")
      }
    } catch (error) {
      setError("Error al registrar usuario")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="relative mx-auto max-w-4xl rounded-3xl border border-[var(--border)]/60 bg-card/60 backdrop-blur-md shadow-xl p-8 md:p-12">
        <div className="flex justify-center mb-6">
          <div className="rounded-2xl ring-1 ring-[var(--border)]/50 bg-gradient-to-br from-primary/30 to-secondary/30 p-3">
            <BrandImage name="pnglogo" alt="MotivaPlay" className="h-16 w-16" />
          </div>
        </div>
        <div className="text-center space-y-3">
          <p className="text-xs md:text-sm tracking-[0.25em] text-muted-foreground">IMPULSA RESULTADOS • CANJES INSTANTÁNEOS • ÉTICA Y TRANSPARENCIA</p>
          <h1 className="text-5xl md:text-6xl font-extrabold">MotivaPlay</h1>
          <p className="text-base md:text-lg text-muted-foreground">El casino corporativo que transforma el reconocimiento en experiencias memorables.</p>
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-background/40">
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5" />
                Gamificación responsable
              </CardTitle>
              <CardDescription>Impulsa resultados premiando el esfuerzo real.</CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-background/40">
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Crown className="h-5 w-5" />
                Premios irresistibles
              </CardTitle>
              <CardDescription>Canjes instantáneos y catálogo configurable.</CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-background/40">
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5" />
                Ética y transparencia
              </CardTitle>
              <CardDescription>Revisa fichas y logros sin fricciones.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Auth card */}
      <Card className="w-full max-w-md mx-auto shadow-xl">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-2">
            <div className="bg-primary text-primary-foreground p-3 rounded-xl">
              <Sparkles className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-balance">Accede a tu cuenta</CardTitle>
          <CardDescription className="text-base">Inicia sesión o regístrate para empezar a jugar</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="tu@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Contraseña</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Iniciando sesión..." : "Iniciar sesión"}
                </Button>
              </form>
              <div className="mt-4 p-3 bg-muted rounded-lg text-sm space-y-1">
                <p className="font-medium">Credenciales Demo:</p>
                <p>Admin: admin@motivaplay.com / admin123</p>
                <p>Empleado: empleado@motivaplay.com / empleado123</p>
                <p>Amiga: amiga@motivaplay.com / amiga123</p>
              </div>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="tu@email.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Contraseña</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creando cuenta..." : "Crear cuenta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
