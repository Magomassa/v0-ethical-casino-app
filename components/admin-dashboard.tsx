"use client"

import type React from "react"

import Image from "next/image"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { getCurrentUser, logout } from "@/lib/auth"
import {
  getUsers,
  getPrizes,
  savePrizes,
  getAchievements,
  saveAchievements,
  getRedemptions,
  getMissions,
  saveMissions,
  type Prize,
  type Achievement,
  type User,
  type Mission,
} from "@/lib/storage"
import { Users, Gift, Trophy, LogOut, Plus, Sparkles, History, ShieldCheck, Coins, Target } from "lucide-react"

export function AdminDashboard() {
  const [user, setUser] = useState(getCurrentUser())
  const [users, setUsers] = useState<User[]>([])
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [redemptions, setRedemptions] = useState<any[]>([])
  const [missions, setMissions] = useState<Mission[]>([])
  const [newPrizeDialog, setNewPrizeDialog] = useState(false)
  const [newAchievementDialog, setNewAchievementDialog] = useState(false)
  const [newMissionDialog, setNewMissionDialog] = useState(false)

  useEffect(() => {
    setUsers(getUsers())
    setPrizes(getPrizes())
    setAchievements(getAchievements())
    setRedemptions(getRedemptions())
    setMissions(getMissions())
  }, [])

  const handleLogout = () => {
    logout()
    window.location.reload()
  }

  const handleCreatePrize = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const newPrize: Prize = {
      id: Date.now().toString(),
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      cost: Number.parseInt(formData.get("cost") as string),
      image: `/placeholder.svg?height=200&width=200&query=${encodeURIComponent(formData.get("name") as string)}`,
      available: true,
    }

    const updatedPrizes = [...prizes, newPrize]
    savePrizes(updatedPrizes)
    setPrizes(updatedPrizes)
    setNewPrizeDialog(false)
  }

  const handleCreateAchievement = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const newAchievement: Achievement = {
      id: Date.now().toString(),
      userId: formData.get("userId") as string,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      tokensAwarded: Number.parseInt(formData.get("tokens") as string),
      date: new Date().toISOString(),
    }

    const updatedAchievements = [...achievements, newAchievement]
    saveAchievements(updatedAchievements)
    setAchievements(updatedAchievements)
    setNewAchievementDialog(false)
  }

  const handleCreateMission = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const missionType = formData.get("type") as "daily" | "weekly"
    const today = new Date()
    let expiresAt: Date

    if (missionType === "daily") {
      expiresAt = new Date(today)
      expiresAt.setDate(expiresAt.getDate() + 1)
      expiresAt.setHours(0, 0, 0, 0)
    } else {
      // Weekly - expira el próximo lunes
      const daysUntilMonday = (8 - today.getDay()) % 7 || 7
      expiresAt = new Date(today)
      expiresAt.setDate(expiresAt.getDate() + daysUntilMonday)
      expiresAt.setHours(0, 0, 0, 0)
    }

    const newMission: Mission = {
      id: `mission-${Date.now()}`,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as "development" | "collaboration" | "wellness",
      type: missionType,
      tokensReward: Number.parseInt(formData.get("tokensReward") as string),
      maxProgress: Number.parseInt(formData.get("maxProgress") as string),
      currentProgress: 0,
      completed: false,
      createdAt: today.toISOString(),
      expiresAt: expiresAt.toISOString(),
      createdBy: "admin",
      assignedTo: formData.get("assignedTo") ? (formData.get("assignedTo") as string) : undefined,
    }

    const updatedMissions = [...missions, newMission]
    saveMissions(updatedMissions)
    setMissions(updatedMissions)
    setNewMissionDialog(false)
  }

  if (!user || user.role !== "admin") return null

  return (
    <div className="relative min-h-screen overflow-hidden casino-gradient text-foreground">
      <span className="casino-grid" />
      <span className="casino-sheen" />

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b border-primary/25 bg-background/70">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 rounded-2xl border border-primary/40 bg-secondary/30 px-4 py-2 shadow-gold">
              <Image src="/motivaplay-icon.svg" alt="MotivaPlay admin icon" width={42} height={42} />
              <div>
                <p className="text-lg font-semibold text-glow leading-tight">MotivaPlay Admin</p>
                <p className="text-xs uppercase tracking-[0.45em] text-muted-foreground">Control maestro</p>
              </div>
            </div>
            <div className="lg:pl-2">
              <p className="text-muted-foreground text-xs uppercase tracking-[0.35em] mb-1">Administrador</p>
              <h1 className="text-2xl font-extrabold text-white/95">{user.email}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 rounded-2xl border border-primary/40 bg-secondary/30 px-4 py-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Panel seguro</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="rounded-full border border-primary/30 bg-transparent text-muted-foreground hover:text-primary hover:bg-primary/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="container relative z-10 mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Employees */}
        <Card className="glass-card rounded-3xl border border-primary/30">
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Empleados
              </CardTitle>
              <CardDescription>Gestiona usuarios y sus fichas</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users
                .filter((u) => u.role === "employee")
                .map((employee) => (
                  <div
                    key={employee.id}
                    className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-primary/25 bg-secondary/20 px-5 py-4"
                  >
                    <div>
                      <h3 className="font-semibold">{employee.email}</h3>
                      <p className="text-sm text-muted-foreground">
                        Miembro desde {new Date(employee.createdAt).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                    <Badge variant="secondary" className="gap-1 rounded-full border border-primary/40 bg-primary/20 text-primary">
                      <Sparkles className="h-3 w-3" />
                      {employee.tokens} fichas
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Achievements Management */}
        <Card className="glass-card rounded-3xl border border-primary/30">
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Logros
              </CardTitle>
              <CardDescription>Crea logros y otorga fichas</CardDescription>
            </div>
            <Dialog open={newAchievementDialog} onOpenChange={setNewAchievementDialog}>
              <DialogTrigger asChild>
                <Button className="rounded-full border border-primary/40 bg-primary/90 text-primary-foreground hover:bg-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo logro
                </Button>
              </DialogTrigger>
              <DialogContent className="border border-primary/30 bg-background/90 backdrop-blur-3xl">
                <form onSubmit={handleCreateAchievement}>
                  <DialogHeader>
                    <DialogTitle>Crear nuevo logro</DialogTitle>
                    <DialogDescription>Registra el desempeño de un empleado</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="userId">Empleado</Label>
                      <Select name="userId" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona empleado" />
                        </SelectTrigger>
                        <SelectContent>
                          {users
                            .filter((u) => u.role === "employee")
                            .map((u) => (
                              <SelectItem key={u.id} value={u.id}>
                                {u.email}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title">Título</Label>
                      <Input id="title" name="title" placeholder="Ej: Proyecto exitoso" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Descripción</Label>
                      <Textarea id="description" name="description" placeholder="Describe el logro..." required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tokens">Fichas a otorgar</Label>
                      <Input id="tokens" name="tokens" type="number" min="1" placeholder="100" required />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Crear logro</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {achievements
                .slice(-10)
                .reverse()
                .map((achievement) => {
                  const employee = users.find((u) => u.id === achievement.userId)
                  return (
                    <div
                      key={achievement.id}
                      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-primary/25 bg-secondary/20 px-5 py-4"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold">{achievement.title}</h3>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {employee?.email} - {new Date(achievement.date).toLocaleDateString("es-ES")}
                        </p>
                      </div>
                      <Badge className="gap-1 rounded-full border border-primary/40 bg-primary/90 text-primary-foreground">
                        <Coins className="h-3 w-3" />
                        +{achievement.tokensAwarded} fichas
                      </Badge>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>

        {/* Missions Management */}
        <Card className="glass-card rounded-3xl border border-primary/30">
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Misiones
              </CardTitle>
              <CardDescription>Crea misiones personalizadas para los empleados</CardDescription>
            </div>
            <Dialog open={newMissionDialog} onOpenChange={setNewMissionDialog}>
              <DialogTrigger asChild>
                <Button className="rounded-full border border-primary/40 bg-primary/90 text-primary-foreground hover:bg-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva misión
                </Button>
              </DialogTrigger>
              <DialogContent className="border border-primary/30 bg-background/90 backdrop-blur-3xl max-w-2xl">
                <form onSubmit={handleCreateMission}>
                  <DialogHeader>
                    <DialogTitle>Crear nueva misión</DialogTitle>
                    <DialogDescription>Crea una misión personalizada para motivar a tu equipo</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="mission-title">Título</Label>
                      <Input id="mission-title" name="title" placeholder="Ej: Completar sprint sin bloqueos" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mission-description">Descripción</Label>
                      <Textarea
                        id="mission-description"
                        name="description"
                        placeholder="Describe la misión..."
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="mission-category">Categoría</Label>
                        <Select name="category" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="development">Desarrollo</SelectItem>
                            <SelectItem value="collaboration">Colaboración</SelectItem>
                            <SelectItem value="wellness">Bienestar</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mission-type">Tipo</Label>
                        <Select name="type" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Diaria</SelectItem>
                            <SelectItem value="weekly">Semanal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="mission-tokens">Recompensa (fichas)</Label>
                        <Input
                          id="mission-tokens"
                          name="tokensReward"
                          type="number"
                          min="1"
                          placeholder="100"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mission-progress">Progreso máximo</Label>
                        <Input
                          id="mission-progress"
                          name="maxProgress"
                          type="number"
                          min="1"
                          placeholder="5"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mission-assigned">Asignar a (opcional)</Label>
                      <Select name="assignedTo">
                        <SelectTrigger>
                          <SelectValue placeholder="Todos los empleados" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todos los empleados</SelectItem>
                          {users
                            .filter((u) => u.role === "employee")
                            .map((u) => (
                              <SelectItem key={u.id} value={u.id}>
                                {u.email}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Crear misión</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {missions
                .filter((m) => !m.completed && new Date(m.expiresAt) >= new Date())
                .slice(-10)
                .reverse()
                .map((mission) => (
                  <div
                    key={mission.id}
                    className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-primary/25 bg-secondary/20 px-5 py-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{mission.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          {mission.type === "daily" ? "Diaria" : "Semanal"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {mission.category === "development"
                            ? "Desarrollo"
                            : mission.category === "collaboration"
                              ? "Colaboración"
                              : "Bienestar"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{mission.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Progreso: {mission.currentProgress}/{mission.maxProgress} · Expira:{" "}
                        {new Date(mission.expiresAt).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                    <Badge className="gap-1 rounded-full border border-primary/40 bg-primary/20 text-primary">
                      <Coins className="h-3 w-3" />
                      {mission.tokensReward} fichas
                    </Badge>
                  </div>
                ))}
              {missions.filter((m) => !m.completed && new Date(m.expiresAt) >= new Date()).length === 0 && (
                <p className="text-muted-foreground text-center py-8">No hay misiones activas</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Prizes Management */}
        <Card className="glass-card rounded-3xl border border-primary/30">
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Premios
              </CardTitle>
              <CardDescription>Gestiona el catálogo de recompensas</CardDescription>
            </div>
            <Dialog open={newPrizeDialog} onOpenChange={setNewPrizeDialog}>
              <DialogTrigger asChild>
                <Button className="rounded-full border border-primary/40 bg-primary/90 text-primary-foreground hover:bg-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo premio
                </Button>
              </DialogTrigger>
              <DialogContent className="border border-primary/30 bg-background/90 backdrop-blur-3xl">
                <form onSubmit={handleCreatePrize}>
                  <DialogHeader>
                    <DialogTitle>Crear nuevo premio</DialogTitle>
                    <DialogDescription>Añade una nueva recompensa al catálogo</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre</Label>
                      <Input id="name" name="name" placeholder="Ej: Día libre extra" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Descripción</Label>
                      <Textarea id="description" name="description" placeholder="Describe el premio..." required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cost">Costo (fichas)</Label>
                      <Input id="cost" name="cost" type="number" min="1" placeholder="500" required />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Crear premio</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {prizes.map((prize) => (
                <Card
                  key={prize.id}
                  className="overflow-hidden rounded-3xl border border-primary/20 bg-secondary/20 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-gold"
                >
                  <div className="relative h-36 overflow-hidden">
                    <Image
                      src={prize.image || "/placeholder.svg"}
                      alt={prize.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-transparent to-transparent" />
                  </div>
                  <CardContent className="p-5 space-y-3">
                    <h3 className="font-semibold text-balance">{prize.name}</h3>
                    <p className="text-sm text-muted-foreground text-pretty">{prize.description}</p>
                    <Badge variant="secondary" className="rounded-full border border-primary/40 bg-primary/20 text-primary">
                      {prize.cost} fichas
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Redemptions History */}
        <Card className="glass-card rounded-3xl border border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Historial de canjes
            </CardTitle>
            <CardDescription>Premios canjeados por empleados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {redemptions.length === 0 ? (
                <p className="rounded-3xl border border-dashed border-primary/30 bg-secondary/10 text-muted-foreground text-center py-10">
                  No hay canjes registrados aún
                </p>
              ) : (
                redemptions
                  .slice(-10)
                  .reverse()
                  .map((redemption) => {
                    const employee = users.find((u) => u.id === redemption.userId)
                    return (
                      <div
                        key={redemption.id}
                        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-primary/25 bg-secondary/20 px-5 py-4"
                      >
                        <div>
                          <h3 className="font-semibold">{redemption.prizeName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {employee?.email} - {new Date(redemption.date).toLocaleDateString("es-ES")}
                          </p>
                        </div>
                        <Badge variant="outline" className="rounded-full border border-primary/40 text-primary">
                          {redemption.tokensCost} fichas
                        </Badge>
                      </div>
                    )
                  })
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
