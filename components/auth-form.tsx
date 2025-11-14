"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { login, register } from "@/lib/auth"
import { Sparkles, Crown, Shield } from "lucide-react"

export function AuthForm({ onSuccess }: { onSuccess: () => void }) {
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    const user = login(loginEmail, loginPassword)
    if (user) {
      onSuccess()
    } else {
      setError("Credenciales incorrectas")
    }
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    const user = register(registerEmail, registerPassword)
    if (user) {
      onSuccess()
    } else {
      setError("El email ya está registrado")
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden casino-gradient flex items-center justify-center p-6">
      <span className="casino-grid" />
      <span className="casino-sheen" />
      <Card className="w-full max-w-2xl glass-card border border-primary/30 relative overflow-hidden">
        <div className="absolute inset-x-0 -top-24 h-48 bg-gradient-to-r from-primary/25 via-transparent to-primary/20 blur-3xl opacity-80" />
        <CardHeader className="relative z-10 space-y-8 p-8 md:p-12 text-center">
          {/* Logo y Título */}
          <div className="flex flex-col items-center gap-6">
            <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-3xl border border-primary/60 bg-secondary/40 flex items-center justify-center shadow-gold">
              <Image src="/motivaplay-icon.svg" alt="MotivaPlay" width={80} height={80} priority />
            </div>
            <div className="space-y-3">
              <CardTitle className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-glow">MotivaPlay</CardTitle>
              <CardDescription className="text-lg md:text-xl text-muted-foreground/90 max-w-xl mx-auto">
                El casino corporativo que transforma el reconocimiento en experiencias memorables.
              </CardDescription>
            </div>
          </div>

          {/* Presentación */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-muted-foreground/90 pt-4">
            <div className="flex flex-col items-center gap-3 rounded-xl border border-primary/30 bg-secondary/20 px-4 py-4">
              <Sparkles className="h-8 w-8 text-primary" />
              <div className="text-center">
                <p className="font-semibold text-foreground mb-1">Gamificación responsable</p>
                <p className="text-xs">Impulsa resultados premiando el esfuerzo real.</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3 rounded-xl border border-primary/30 bg-secondary/20 px-4 py-4">
              <Crown className="h-8 w-8 text-primary" />
              <div className="text-center">
                <p className="font-semibold text-foreground mb-1">Premios irresistibles</p>
                <p className="text-xs">Canjes instantáneos y catálogo configurable.</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3 rounded-xl border border-primary/30 bg-secondary/20 px-4 py-4">
              <Shield className="h-8 w-8 text-primary" />
              <div className="text-center">
                <p className="font-semibold text-foreground mb-1">Ética y transparencia</p>
                <p className="text-xs">Supervisa fichas y logros sin fricciones.</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative z-10 border-t border-primary/15 bg-background/55 p-6 md:p-10 space-y-6">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-full bg-secondary/20 border border-primary/30">
                <TabsTrigger value="login" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Iniciar sesión
                </TabsTrigger>
                <TabsTrigger value="register" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Registrarse
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground" htmlFor="login-email">
                      Email
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="tu@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className="h-12 rounded-xl border border-primary/25 bg-secondary/10 focus-visible:ring-primary/60"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground" htmlFor="login-password">
                      Contraseña
                    </Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="h-12 rounded-xl border border-primary/25 bg-secondary/10 focus-visible:ring-primary/60"
                    />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold">
                    Entrar al casino
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground" htmlFor="register-email">
                      Email corporativo
                    </Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="tu@email.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                      className="h-12 rounded-xl border border-primary/25 bg-secondary/10 focus-visible:ring-primary/60"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground" htmlFor="register-password">
                      Contraseña
                    </Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                      className="h-12 rounded-xl border border-primary/25 bg-secondary/10 focus-visible:ring-primary/60"
                    />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold">
                    Crear mi cuenta
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
      </Card>
    </div>
  )
}
