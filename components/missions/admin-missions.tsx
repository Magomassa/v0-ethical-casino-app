"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getMissions,
  saveMissions,
  getMissionSubmissions,
  saveMissionSubmissions,
  getUsers,
  getTransactions,
  saveTransactions,
  type Mission,
  type MissionSubmission,
  type Transaction,
} from "@/lib/storage"
import { updateUserTokens } from "@/lib/auth"
import { Plus, CheckCircle2, XCircle, ExternalLink, Coins, Calendar } from "lucide-react"

export function AdminMissions() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [submissions, setSubmissions] = useState<MissionSubmission[]>([])
  const [newMissionDialog, setNewMissionDialog] = useState(false)
  const [reviewDialog, setReviewDialog] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<MissionSubmission | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("all")

  useEffect(() => {
    setMissions(getMissions())
    setSubmissions(getMissionSubmissions())
  }, [])

  const handleCreateMission = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const tags = (formData.get("tags") as string).split(",").map((t) => t.trim())

    const newMission: Mission = {
      id: Date.now().toString(),
      title: formData.get("title") as string,
      type: formData.get("type") as Mission["type"],
      description: formData.get("description") as string,
      tokenReward: Number.parseInt(formData.get("tokenReward") as string),
      evidenceRequired: formData.get("evidenceRequired") === "on",
      endAt: formData.get("endAt") ? (formData.get("endAt") as string) : undefined,
      active: true,
      tags,
      maxPerUser: Number.parseInt(formData.get("maxPerUser") as string),
    }

    const updatedMissions = [...missions, newMission]
    saveMissions(updatedMissions)
    setMissions(updatedMissions)
    setNewMissionDialog(false)
  }

  const handleReviewSubmission = (submission: MissionSubmission) => {
    setSelectedSubmission(submission)
    setReviewDialog(true)
  }

  const handleApproveSubmission = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedSubmission) return

    const formData = new FormData(e.currentTarget)
    const reviewNotes = formData.get("reviewNotes") as string

    // Get mission for token reward
    const mission = missions.find((m) => m.id === selectedSubmission.missionId)
    if (!mission) return

    // Update submission
    const updatedSubmissions = getMissionSubmissions().map((s) =>
      s.id === selectedSubmission.id
        ? {
            ...s,
            status: "approved" as const,
            reviewNotes,
            reviewedAt: new Date().toISOString(),
          }
        : s,
    )
    saveMissionSubmissions(updatedSubmissions)
    setSubmissions(updatedSubmissions)

    // Award tokens
    const users = getUsers()
    const user = users.find((u) => u.id === selectedSubmission.userId)
    if (user) {
      updateUserTokens(user.id, user.tokens + mission.tokenReward)

      // Create transaction
      const transactions = getTransactions()
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        userId: user.id,
        type: "credit",
        amount: mission.tokenReward,
        source: "mission",
        sourceRef: selectedSubmission.id,
        description: `Misión aprobada: ${mission.title}`,
        date: new Date().toISOString(),
      }
      transactions.push(newTransaction)
      saveTransactions(transactions)
    }

    setReviewDialog(false)
    setSelectedSubmission(null)
  }

  const handleRejectSubmission = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedSubmission) return

    const formData = new FormData(e.currentTarget)
    const reviewNotes = formData.get("reviewNotes") as string

    const updatedSubmissions = getMissionSubmissions().map((s) =>
      s.id === selectedSubmission.id
        ? {
            ...s,
            status: "rejected" as const,
            reviewNotes,
            reviewedAt: new Date().toISOString(),
          }
        : s,
    )
    saveMissionSubmissions(updatedSubmissions)
    setSubmissions(updatedSubmissions)

    setReviewDialog(false)
    setSelectedSubmission(null)
  }

  const filteredSubmissions =
    filterStatus === "all" ? submissions : submissions.filter((s) => s.status === filterStatus)

  const pendingCount = submissions.filter((s) => s.status === "pending").length

  return (
    <div className="space-y-6">
      <Tabs defaultValue="review">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="review">
            Revisar postulaciones
            {pendingCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="manage">Gestionar misiones</TabsTrigger>
        </TabsList>

        <TabsContent value="review" className="space-y-4">
          <div className="flex gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="approved">Aprobadas</SelectItem>
                <SelectItem value="rejected">Rechazadas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredSubmissions.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-muted-foreground">No hay postulaciones para revisar</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredSubmissions
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((submission) => {
                  const mission = missions.find((m) => m.id === submission.missionId)
                  const user = getUsers().find((u) => u.id === submission.userId)
                  if (!mission || !user) return null

                  return (
                    <Card key={submission.id}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-balance">{mission.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {user.email} - {new Date(submission.createdAt).toLocaleDateString("es-ES")}
                            </p>
                          </div>
                          <Badge
                            variant={
                              submission.status === "approved"
                                ? "default"
                                : submission.status === "rejected"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {submission.status === "pending" && "Pendiente"}
                            {submission.status === "approved" && "Aprobado"}
                            {submission.status === "rejected" && "Rechazado"}
                          </Badge>
                        </div>

                        {submission.evidenceUrl && (
                          <div className="flex items-center gap-2 text-sm">
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                            <a
                              href={submission.evidenceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              Ver evidencia
                            </a>
                          </div>
                        )}

                        {submission.evidenceText && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Descripción:</span>
                            <p className="mt-1 p-2 bg-muted rounded text-pretty">{submission.evidenceText}</p>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-sm">
                          <Coins className="h-4 w-4 text-secondary" />
                          <span className="font-medium">Recompensa: {mission.tokenReward} fichas</span>
                        </div>

                        {submission.status === "pending" && (
                          <Button onClick={() => handleReviewSubmission(submission)} className="w-full" size="sm">
                            Revisar postulación
                          </Button>
                        )}

                        {submission.reviewNotes && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Notas:</span>
                            <p className="mt-1 p-2 bg-muted rounded text-pretty">{submission.reviewNotes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          <Dialog open={newMissionDialog} onOpenChange={setNewMissionDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva misión
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <form onSubmit={handleCreateMission}>
                <DialogHeader>
                  <DialogTitle>Crear nueva misión</DialogTitle>
                  <DialogDescription>Define una nueva misión para que los empleados postulen</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título</Label>
                    <Input id="title" name="title" placeholder="Completar curso de desarrollo" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo</Label>
                    <Select name="type" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="curso">Curso</SelectItem>
                        <SelectItem value="proyecto">Proyecto</SelectItem>
                        <SelectItem value="voluntariado">Voluntariado</SelectItem>
                        <SelectItem value="idea">Idea</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe qué deben hacer los empleados..."
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tokenReward">Recompensa (fichas)</Label>
                      <Input id="tokenReward" name="tokenReward" type="number" min="1" placeholder="300" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxPerUser">Máximo por usuario</Label>
                      <Input id="maxPerUser" name="maxPerUser" type="number" min="1" placeholder="3" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (separados por comas)</Label>
                    <Input id="tags" name="tags" placeholder="desarrollo, educación" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endAt" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Fecha límite (opcional)
                    </Label>
                    <Input id="endAt" name="endAt" type="date" />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="evidenceRequired" name="evidenceRequired" defaultChecked />
                    <Label htmlFor="evidenceRequired">Requiere evidencia</Label>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="submit">Crear misión</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <div className="grid gap-4 md:grid-cols-2">
            {missions.map((mission) => (
              <Card key={mission.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg text-balance">{mission.title}</CardTitle>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="outline">{mission.type}</Badge>
                        {mission.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Badge className="gap-1">
                      <Coins className="h-3 w-3" />
                      {mission.tokenReward}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground text-pretty">{mission.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Máximo: {mission.maxPerUser} por usuario</span>
                    <Badge variant={mission.active ? "default" : "secondary"}>
                      {mission.active ? "Activa" : "Inactiva"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revisar postulación</DialogTitle>
            <DialogDescription>Aprobar o rechazar la postulación del empleado</DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg space-y-2 text-sm">
                <div>
                  <span className="font-medium">Misión: </span>
                  {missions.find((m) => m.id === selectedSubmission.missionId)?.title}
                </div>
                <div>
                  <span className="font-medium">Empleado: </span>
                  {getUsers().find((u) => u.id === selectedSubmission.userId)?.email}
                </div>
                {selectedSubmission.evidenceUrl && (
                  <div>
                    <span className="font-medium">Enlace: </span>
                    <a
                      href={selectedSubmission.evidenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Ver evidencia
                    </a>
                  </div>
                )}
                {selectedSubmission.evidenceText && (
                  <div>
                    <span className="font-medium">Descripción: </span>
                    <p className="mt-1 text-pretty">{selectedSubmission.evidenceText}</p>
                  </div>
                )}
              </div>

              <form onSubmit={handleApproveSubmission} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reviewNotes">Notas (opcional)</Label>
                  <Textarea
                    id="reviewNotes"
                    name="reviewNotes"
                    placeholder="Comentarios sobre la postulación..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1 gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Aprobar
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    className="flex-1 gap-2"
                    onClick={(e) => {
                      const form = e.currentTarget.closest("form")
                      if (form) {
                        const formData = new FormData(form)
                        const fakeEvent = {
                          preventDefault: () => {},
                          currentTarget: form,
                        } as React.FormEvent<HTMLFormElement>
                        handleRejectSubmission(fakeEvent)
                      }
                    }}
                  >
                    <XCircle className="h-4 w-4" />
                    Rechazar
                  </Button>
                </div>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
