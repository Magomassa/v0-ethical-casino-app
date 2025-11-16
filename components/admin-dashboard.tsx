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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { logout } from "@/lib/auth"
import {
  getAllUsers,
  getAllPrizes,
  getUserAchievements,
  getAllRedemptions,
  getAllAchievementTemplates,
  createPrize,
  updatePrize,
  createAchievement,
  updateAchievementTemplate,
  updateUser,
  createTransaction,
} from "@/lib/firebase/db"
import type { Prize, Achievement, User, AchievementTemplate, Redemption } from "@/lib/storage"
import { Users, Gift, Trophy, Plus, History, Target, Edit, Settings } from 'lucide-react'
import { AdminMissions } from "./missions/admin-missions"

export function AdminDashboard({ user: adminUser, onLogout }: { user: User; onLogout: () => void }) {
  const [users, setUsers] = useState<User[]>([])
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [redemptions, setRedemptions] = useState<Redemption[]>([])
  const [templates, setTemplates] = useState<AchievementTemplate[]>([])
  const [newPrizeDialog, setNewPrizeDialog] = useState(false)
  const [newAchievementDialog, setNewAchievementDialog] = useState(false)
  const [editPrizeDialog, setEditPrizeDialog] = useState(false)
  const [editTemplateDialog, setEditTemplateDialog] = useState(false)
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null)
  const [editingTemplate, setEditingTemplate] = useState<AchievementTemplate | null>(null)
  const [activeTab, setActiveTab] = useState("employees")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersData, prizesData, templatesData, redemptionsData] = await Promise.all([
          getAllUsers(),
          getAllPrizes(),
          getAllAchievementTemplates(),
          getAllRedemptions(),
        ])

        const allAchievements: Achievement[] = []
        for (const user of usersData) {
          const userAchievements = await getUserAchievements(user.id)
          allAchievements.push(...userAchievements)
        }

        setUsers(usersData)
        setPrizes(prizesData)
        setTemplates(templatesData)
        setRedemptions(redemptionsData)
        setAchievements(allAchievements)
      } catch (error) {
        console.error("[v0] Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleLogout = async () => {
    await logout()
    onLogout()
  }

  const handleCreatePrize = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    try {
      const newPrize: Omit<Prize, "id"> = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        cost: Number.parseInt(formData.get("cost") as string),
        image: `/placeholder.svg?height=200&width=200&query=${encodeURIComponent(formData.get("name") as string)}`,
        available: true,
      }

      await createPrize(newPrize)
      const updatedPrizes = await getAllPrizes()
      setPrizes(updatedPrizes)
      setNewPrizeDialog(false)
    } catch (error) {
      console.error("[v0] Error creating prize:", error)
    }
  }

  const handleEditPrize = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingPrize) return

    const formData = new FormData(e.currentTarget)
    const discount = formData.get("discount") ? Number.parseInt(formData.get("discount") as string) : undefined
    const newCost = Number.parseInt(formData.get("cost") as string)

    try {
      const updatedData: Partial<Prize> = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        cost: discount ? Math.round(newCost * (1 - discount / 100)) : newCost,
        originalCost: discount ? newCost : undefined,
        discount,
        label: (formData.get("label") as string) || undefined,
      }

      await updatePrize(editingPrize.id, updatedData)
      const updatedPrizes = await getAllPrizes()
      setPrizes(updatedPrizes)
      setEditPrizeDialog(false)
      setEditingPrize(null)
    } catch (error) {
      console.error("[v0] Error updating prize:", error)
    }
  }

  const handleCreateAchievement = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const templateId = formData.get("templateId") as string
    const userId = formData.get("userId") as string
    const template = templates.find((t) => t.id === templateId)
    if (!template) return

    try {
      const newAchievement: Omit<Achievement, "id"> = {
        userId,
        templateId: template.id,
        title: template.title,
        description: template.description,
        tokensAwarded: template.reward,
        date: new Date().toISOString(),
        count: 1,
      }

      await createAchievement(newAchievement)

      const user = users.find((u) => u.id === userId)
      if (user) {
        await updateUser(userId, { tokens: user.tokens + template.reward })
        await createTransaction({
          userId,
          type: "credit",
          amount: template.reward,
          source: "achievement",
          sourceRef: template.id,
          description: `Logro: ${template.title}`,
          date: new Date().toISOString(),
        })
      }

      const updatedAchievements = await getUserAchievements(userId)
      setAchievements([...achievements, ...updatedAchievements])
      setNewAchievementDialog(false)
    } catch (error) {
      console.error("[v0] Error creating achievement:", error)
    }
  }

  const handleEditTemplate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingTemplate) return

    const formData = new FormData(e.currentTarget)

    try {
      const updatedData: Partial<AchievementTemplate> = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        reward: Number.parseInt(formData.get("reward") as string),
        platinumRequirement: Number.parseInt(formData.get("platinumRequirement") as string),
      }

      await updateAchievementTemplate(editingTemplate.id, updatedData)
      const updatedTemplates = await getAllAchievementTemplates()
      setTemplates(updatedTemplates)
      setEditTemplateDialog(false)
      setEditingTemplate(null)
    } catch (error) {
      console.error("[v0] Error updating template:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Cargando...</div>
      </div>
    )
  }

  if (!adminUser || adminUser.role !== "admin") return null

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8 space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="employees" className="gap-2">
              <Users className="h-4 w-4" />
              Empleados
            </TabsTrigger>
            <TabsTrigger value="missions" className="gap-2">
              <Target className="h-4 w-4" />
              Misiones
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <Settings className="h-4 w-4" />
              Plantillas
            </TabsTrigger>
            <TabsTrigger value="achievements" className="gap-2">
              <Trophy className="h-4 w-4" />
              Logros
            </TabsTrigger>
            <TabsTrigger value="prizes" className="gap-2">
              <Gift className="h-4 w-4" />
              Premios
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              Historial
            </TabsTrigger>
          </TabsList>

          {/* Employees Tab Content */}
          <TabsContent value="employees">
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
                          <h3 className="font-semibold">{employee.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {employee.email} - {employee.department}
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
          </TabsContent>

          {/* Missions Tab Content */}
          <TabsContent value="missions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Gestión de Misiones
                </CardTitle>
                <CardDescription>Crea misiones y revisa postulaciones de empleados</CardDescription>
              </CardHeader>
              <CardContent>
                <AdminMissions />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Plantillas de Logros
                </CardTitle>
                <CardDescription>Edita recompensas y requisitos para platino</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {templates.map((template) => (
                    <Card key={template.id}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold">{template.title}</h3>
                            <p className="text-sm text-muted-foreground">{template.description}</p>
                            <Badge variant="secondary" className="mt-2">
                              {template.category}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Recompensa: {template.reward} fichas</span>
                          <span className="text-muted-foreground">Platino: {template.platinumRequirement}x</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full bg-transparent"
                          onClick={() => {
                            setEditingTemplate(template)
                            setEditTemplateDialog(true)
                          }}
                        >
                          <Edit className="h-3 w-3 mr-2" />
                          Editar
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab Content */}
          <TabsContent value="achievements">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Logros
                  </CardTitle>
                  <CardDescription>Otorga logros manualmente a empleados</CardDescription>
                </div>
                <Dialog open={newAchievementDialog} onOpenChange={setNewAchievementDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Otorgar logro
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <form onSubmit={handleCreateAchievement}>
                      <DialogHeader>
                        <DialogTitle>Otorgar logro a empleado</DialogTitle>
                        <CardDescription>Selecciona un logro predefinido para otorgar</CardDescription>
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
                                    {u.name} - {u.email}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="templateId">Logro</Label>
                          <Select name="templateId" required>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona logro" />
                            </SelectTrigger>
                            <SelectContent>
                              {templates.map((t) => (
                                <SelectItem key={t.id} value={t.id}>
                                  {t.title} ({t.reward} fichas)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Otorgar logro</Button>
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
                              {employee?.name} - {new Date(achievement.date).toLocaleDateString("es-ES")}
                            </p>
                          </div>
                          <Badge>+{achievement.tokensAwarded} fichas</Badge>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prizes Tab Content */}
          <TabsContent value="prizes">
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
                      <div className="relative">
                        <img
                          src={prize.image || "/placeholder.svg"}
                          alt={prize.name}
                          className="w-full h-32 object-cover rounded-t-lg"
                        />
                        {prize.label && (
                          <Badge className="absolute top-2 right-2 bg-destructive text-destructive-foreground">
                            {prize.label}
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-4 space-y-2">
                        <h3 className="font-semibold text-balance">{prize.name}</h3>
                        <p className="text-sm text-muted-foreground text-pretty">{prize.description}</p>
                        <div className="flex items-center gap-2">
                          {prize.discount && prize.originalCost ? (
                            <>
                              <Badge variant="secondary">{prize.cost} fichas</Badge>
                              <span className="text-xs text-muted-foreground line-through">
                                {prize.originalCost} fichas
                              </span>
                              <Badge variant="destructive" className="text-xs">
                                -{prize.discount}%
                              </Badge>
                            </>
                          ) : (
                            <Badge variant="secondary">{prize.cost} fichas</Badge>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full bg-transparent"
                          onClick={() => {
                            setEditingPrize(prize)
                            setEditPrizeDialog(true)
                          }}
                        >
                          <Edit className="h-3 w-3 mr-2" />
                          Editar
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Redemptions History Tab Content */}
          <TabsContent value="history">
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
                          <div
                            key={redemption.id}
                            className="flex items-center justify-between p-4 bg-accent rounded-lg"
                          >
                            <div>
                              <h3 className="font-semibold">{redemption.prizeName}</h3>
                              <p className="text-sm text-muted-foreground">
                                {employee?.name} - {new Date(redemption.date).toLocaleDateString("es-ES")}
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
          </TabsContent>
        </Tabs>
      </main>

      {/* Edit Prize Dialog */}
      <Dialog open={editPrizeDialog} onOpenChange={setEditPrizeDialog}>
        <DialogContent>
          <form onSubmit={handleEditPrize}>
            <DialogHeader>
              <DialogTitle>Editar premio</DialogTitle>
              <DialogDescription>Modifica el premio y agrega promociones especiales</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nombre</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={editingPrize?.name}
                  placeholder="Ej: Día libre extra"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Descripción</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  defaultValue={editingPrize?.description}
                  placeholder="Describe el premio..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-cost">Costo base (fichas)</Label>
                <Input
                  id="edit-cost"
                  name="cost"
                  type="number"
                  min="1"
                  defaultValue={editingPrize?.originalCost || editingPrize?.cost}
                  placeholder="500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-discount">Descuento (%) - Opcional</Label>
                <Input
                  id="edit-discount"
                  name="discount"
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={editingPrize?.discount}
                  placeholder="50"
                />
                <p className="text-xs text-muted-foreground">Ej: 50 para 50% de descuento</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-label">Etiqueta especial - Opcional</Label>
                <Input
                  id="edit-label"
                  name="label"
                  defaultValue={editingPrize?.label}
                  placeholder="Por tiempo limitado"
                />
                <p className="text-xs text-muted-foreground">
                  Ej: "Por tiempo limitado", "Oferta especial", "Último día"
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Guardar cambios</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editTemplateDialog} onOpenChange={setEditTemplateDialog}>
        <DialogContent>
          <form onSubmit={handleEditTemplate}>
            <DialogHeader>
              <DialogTitle>Editar plantilla de logro</DialogTitle>
              <DialogDescription>Modifica la recompensa y requisitos para platino</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="template-title">Título</Label>
                <Input
                  id="template-title"
                  name="title"
                  defaultValue={editingTemplate?.title}
                  placeholder="Título del logro"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-description">Descripción</Label>
                <Textarea
                  id="template-description"
                  name="description"
                  defaultValue={editingTemplate?.description}
                  placeholder="Descripción del logro"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-reward">Recompensa (fichas)</Label>
                <Input
                  id="template-reward"
                  name="reward"
                  type="number"
                  min="1"
                  defaultValue={editingTemplate?.reward}
                  placeholder="100"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-platinum">Requisito para platino (repeticiones)</Label>
                <Input
                  id="template-platinum"
                  name="platinumRequirement"
                  type="number"
                  min="1"
                  defaultValue={editingTemplate?.platinumRequirement}
                  placeholder="10"
                  required
                />
                <p className="text-xs text-muted-foreground">Cuántas veces debe lograrse para alcanzar platino</p>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Guardar cambios</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminDashboard
