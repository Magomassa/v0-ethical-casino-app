"use client"

import type React from "react"

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
  type Prize,
  type Achievement,
  type User,
} from "@/lib/storage"
import { Users, Gift, Trophy, LogOut, Plus, Sparkles, History } from "lucide-react"

export function AdminDashboard() {
  const [user, setUser] = useState(getCurrentUser())
  const [users, setUsers] = useState<User[]>([])
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [redemptions, setRedemptions] = useState<any[]>([])
  const [newPrizeDialog, setNewPrizeDialog] = useState(false)
  const [newAchievementDialog, setNewAchievementDialog] = useState(false)

  useEffect(() => {
    setUsers(getUsers())
    setPrizes(getPrizes())
    setAchievements(getAchievements())
    setRedemptions(getRedemptions())
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

  if (!user || user.role !== "admin") return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">MotivaPlay Admin</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Salir
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Employees */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
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
                  <div key={employee.id} className="flex items-center justify-between p-4 bg-accent rounded-lg">
                    <div>
                      <h3 className="font-semibold">{employee.email}</h3>
                      <p className="text-sm text-muted-foreground">
                        Miembro desde {new Date(employee.createdAt).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-base px-4 py-2">
                      {employee.tokens} fichas
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Achievements Management */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Logros
              </CardTitle>
              <CardDescription>Crea logros y otorga fichas</CardDescription>
            </div>
            <Dialog open={newAchievementDialog} onOpenChange={setNewAchievementDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo logro
                </Button>
              </DialogTrigger>
              <DialogContent>
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
                    <div key={achievement.id} className="flex items-start justify-between p-4 bg-accent rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold">{achievement.title}</h3>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {employee?.email} - {new Date(achievement.date).toLocaleDateString("es-ES")}
                        </p>
                      </div>
                      <Badge>+{achievement.tokensAwarded} fichas</Badge>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>

        {/* Prizes Management */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Premios
              </CardTitle>
              <CardDescription>Gestiona el catálogo de recompensas</CardDescription>
            </div>
            <Dialog open={newPrizeDialog} onOpenChange={setNewPrizeDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo premio
                </Button>
              </DialogTrigger>
              <DialogContent>
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
                <Card key={prize.id}>
                  <img
                    src={prize.image || "/placeholder.svg"}
                    alt={prize.name}
                    className="w-full h-32 object-cover rounded-t-lg"
                  />
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-semibold text-balance">{prize.name}</h3>
                    <p className="text-sm text-muted-foreground text-pretty">{prize.description}</p>
                    <Badge variant="secondary">{prize.cost} fichas</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Redemptions History */}
        <Card>
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
                <p className="text-muted-foreground text-center py-8">No hay canjes registrados aún</p>
              ) : (
                redemptions
                  .slice(-10)
                  .reverse()
                  .map((redemption) => {
                    const employee = users.find((u) => u.id === redemption.userId)
                    return (
                      <div key={redemption.id} className="flex items-center justify-between p-4 bg-accent rounded-lg">
                        <div>
                          <h3 className="font-semibold">{redemption.prizeName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {employee?.email} - {new Date(redemption.date).toLocaleDateString("es-ES")}
                          </p>
                        </div>
                        <Badge variant="outline">{redemption.tokensCost} fichas</Badge>
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
