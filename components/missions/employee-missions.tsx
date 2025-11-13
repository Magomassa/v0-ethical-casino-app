"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getMissions,
  getMissionSubmissions,
  saveMissionSubmissions,
  type Mission,
  type MissionSubmission,
} from "@/lib/storage"
import { Target, Coins, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react"

interface EmployeeMissionsProps {
  userId: string
}

export function EmployeeMissions({ userId }: EmployeeMissionsProps) {
  const [missions, setMissions] = useState<Mission[]>([])
  const [submissions, setSubmissions] = useState<MissionSubmission[]>([])
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null)
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
  const [filterType, setFilterType] = useState<string>("all")

  useEffect(() => {
    setMissions(getMissions().filter((m) => m.active))
    setSubmissions(getMissionSubmissions().filter((s) => s.userId === userId))
  }, [userId])

  const getUserSubmissionsForMission = (missionId: string) => {
    return submissions.filter((s) => s.missionId === missionId && s.status === "approved").length
  }

  const canSubmitMission = (mission: Mission) => {
    const approvedCount = getUserSubmissionsForMission(mission.id)
    if (approvedCount >= mission.maxPerUser) return false
    if (mission.endAt && new Date(mission.endAt) < new Date()) return false
    return true
  }

  const handleSubmitMission = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedMission) return

    const formData = new FormData(e.currentTarget)
    const newSubmission: MissionSubmission = {
      id: Date.now().toString(),
      missionId: selectedMission.id,
      userId,
      evidenceUrl: formData.get("evidenceUrl") as string,
      evidenceText: formData.get("evidenceText") as string,
      status: "pending",
      createdAt: new Date().toISOString(),
    }

    const updatedSubmissions = [...getMissionSubmissions(), newSubmission]
    saveMissionSubmissions(updatedSubmissions)
    setSubmissions(updatedSubmissions.filter((s) => s.userId === userId))
    setSubmitDialogOpen(false)
    setSelectedMission(null)
  }

  const openSubmitDialog = (mission: Mission) => {
    setSelectedMission(mission)
    setSubmitDialogOpen(true)
  }

  const filteredMissions = filterType === "all" ? missions : missions.filter((m) => m.type === filterType)

  return (
    <div className="space-y-6">
      <Tabs defaultValue="available">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="available">Misiones disponibles</TabsTrigger>
          <TabsTrigger value="my-submissions">Mis postulaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          <div className="flex gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="curso">Cursos</SelectItem>
                <SelectItem value="proyecto">Proyectos</SelectItem>
                <SelectItem value="voluntariado">Voluntariado</SelectItem>
                <SelectItem value="idea">Ideas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {filteredMissions.map((mission) => {
              const canSubmit = canSubmitMission(mission)
              const approvedCount = getUserSubmissionsForMission(mission.id)

              return (
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
                      <Badge className="gap-1 shrink-0">
                        <Coins className="h-3 w-3" />
                        {mission.tokenReward}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground text-pretty">{mission.description}</p>

                    <div className="space-y-2 text-xs text-muted-foreground">
                      {mission.endAt && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          Válida hasta: {new Date(mission.endAt).toLocaleDateString("es-ES")}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Target className="h-3 w-3" />
                        Completadas: {approvedCount}/{mission.maxPerUser}
                      </div>
                    </div>

                    <Button
                      onClick={() => openSubmitDialog(mission)}
                      disabled={!canSubmit}
                      className="w-full"
                      size="sm"
                    >
                      {approvedCount >= mission.maxPerUser ? "Límite alcanzado" : "Postular evidencia"}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="my-submissions" className="space-y-4">
          {submissions.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-muted-foreground">
                  Aún no has postulado a ninguna misión. ¡Comienza ahora!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {submissions
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((submission) => {
                  const mission = missions.find((m) => m.id === submission.missionId)
                  if (!mission) return null

                  return (
                    <Card key={submission.id}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-balance">{mission.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              Postulado el {new Date(submission.createdAt).toLocaleDateString("es-ES")}
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
                            className="gap-1"
                          >
                            {submission.status === "approved" && <CheckCircle2 className="h-3 w-3" />}
                            {submission.status === "rejected" && <XCircle className="h-3 w-3" />}
                            {submission.status === "pending" && <AlertCircle className="h-3 w-3" />}
                            {submission.status === "pending" && "Pendiente"}
                            {submission.status === "approved" && "Aprobado"}
                            {submission.status === "rejected" && "Rechazado"}
                          </Badge>
                        </div>

                        {submission.evidenceUrl && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Enlace: </span>
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
                            <span className="text-muted-foreground">Descripción: </span>
                            <p className="mt-1 p-2 bg-muted rounded text-pretty">{submission.evidenceText}</p>
                          </div>
                        )}

                        {submission.status === "approved" && (
                          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                            <Coins className="h-4 w-4" />+{mission.tokenReward} fichas acreditadas
                          </div>
                        )}

                        {submission.reviewNotes && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Notas del revisor: </span>
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
      </Tabs>

      {/* Submit Dialog */}
      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmitMission}>
            <DialogHeader>
              <DialogTitle>Postular evidencia</DialogTitle>
              <DialogDescription>Completa la información para postular a: {selectedMission?.title}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {selectedMission?.evidenceRequired && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="evidenceUrl">Enlace de evidencia (opcional)</Label>
                    <Input
                      id="evidenceUrl"
                      name="evidenceUrl"
                      type="url"
                      placeholder="https://certificado.com/mi-certificado"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="evidenceText">Descripción de la evidencia</Label>
                    <Textarea
                      id="evidenceText"
                      name="evidenceText"
                      placeholder="Describe tu logro, qué aprendiste o cómo contribuiste..."
                      rows={4}
                      required
                    />
                  </div>
                </>
              )}

              <div className="bg-muted p-3 rounded-lg text-sm space-y-1">
                <p className="font-medium">Recompensa:</p>
                <div className="flex items-center gap-2 text-primary">
                  <Coins className="h-4 w-4" />
                  <span className="font-semibold">{selectedMission?.tokenReward} fichas</span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSubmitDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Postular</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
