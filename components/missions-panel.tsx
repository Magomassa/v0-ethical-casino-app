"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Target,
  CheckCircle2,
  Clock,
  Flame,
  Code,
  Users,
  Heart,
  ArrowRight,
  Sparkles,
  Trophy,
} from "lucide-react"
import {
  getUserMissions,
  updateMissionProgress,
  getMissions,
  saveMissions,
  type Mission,
} from "@/lib/storage"
import { getCurrentUser, updateUserTokens } from "@/lib/auth"
import {
  generateDailyMissions,
  generateWeeklyMissions,
  shouldRegenerateDailyMissions,
  shouldRegenerateWeeklyMissions,
} from "@/lib/mission-suggestions"
import { soundManager } from "@/lib/sounds"

const categoryIcons = {
  development: Code,
  collaboration: Users,
  wellness: Heart,
}

const categoryColors = {
  development: "text-blue-400",
  collaboration: "text-green-400",
  wellness: "text-pink-400",
}

export function MissionsPanel() {
  const user = getCurrentUser()
  const [missions, setMissions] = useState<Mission[]>([])
  const [dailyStreak, setDailyStreak] = useState(0)
  const [completedToday, setCompletedToday] = useState(0)
  const userId = user?.id

  useEffect(() => {
    if (!user || !userId) return

    // Verificar y regenerar misiones si es necesario
    const allMissions = getMissions()
    const lastDailyGen = localStorage.getItem("motivaplay_last_daily_gen")
    const lastWeeklyGen = localStorage.getItem("motivaplay_last_weekly_gen")

    let updatedMissions = [...allMissions]

    // Regenerar misiones diarias si es necesario
    if (shouldRegenerateDailyMissions(lastDailyGen)) {
      // Eliminar misiones diarias expiradas
      updatedMissions = updatedMissions.filter(
        (m) => m.type !== "daily" || new Date(m.expiresAt) >= new Date()
      )

      // Generar nuevas misiones diarias
      const newDailyMissions = generateDailyMissions()
      updatedMissions.push(...newDailyMissions)
      localStorage.setItem("motivaplay_last_daily_gen", new Date().toISOString())
    }

    // Regenerar misiones semanales si es necesario
    if (shouldRegenerateWeeklyMissions(lastWeeklyGen)) {
      // Eliminar misiones semanales expiradas
      updatedMissions = updatedMissions.filter(
        (m) => m.type !== "weekly" || new Date(m.expiresAt) >= new Date()
      )

      // Generar nuevas misiones semanales (máximo 3)
      const existingWeekly = updatedMissions.filter((m) => m.type === "weekly" && !m.completed).length
      const needed = Math.max(0, 3 - existingWeekly)
      if (needed > 0) {
        const newWeeklyMissions = generateWeeklyMissions().slice(0, needed)
        updatedMissions.push(...newWeeklyMissions)
      }
      localStorage.setItem("motivaplay_last_weekly_gen", new Date().toISOString())
    }

    saveMissions(updatedMissions)

    // Obtener misiones del usuario
    const userMissions = getUserMissions(userId)
    setMissions(userMissions)

    // Calcular racha diaria (solo una vez, sin actualizar si ya está calculado)
    const streakKey = `motivaplay_streak_${userId}`
    const lastCompletion = localStorage.getItem(streakKey)
    const streakCountKey = `motivaplay_streak_count_${userId}`
    
    if (lastCompletion) {
      const lastDate = new Date(lastCompletion)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      lastDate.setHours(0, 0, 0, 0)

      const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
      const currentStreak = parseInt(localStorage.getItem(streakCountKey) || "0")
      
      if (daysDiff === 1) {
        // Continuar racha
        setDailyStreak((prev) => prev !== currentStreak + 1 ? currentStreak + 1 : prev)
      } else if (daysDiff === 0) {
        // Mismo día
        setDailyStreak((prev) => prev !== currentStreak ? currentStreak : prev)
      } else {
        // Romper racha
        setDailyStreak((prev) => prev !== 0 ? 0 : prev)
      }
    } else {
      setDailyStreak((prev) => prev !== 0 ? 0 : prev)
    }

    // Contar misiones completadas hoy
    const todayCompleted = userMissions.filter((m) => {
      if (!m.completed) return false
      const completedDate = new Date(m.createdAt)
      const today = new Date()
      return (
        completedDate.getDate() === today.getDate() &&
        completedDate.getMonth() === today.getMonth() &&
        completedDate.getFullYear() === today.getFullYear()
      )
    }).length
    setCompletedToday((prev) => prev !== todayCompleted ? todayCompleted : prev)
  }, [userId])

  const handleProgressUpdate = (missionId: string, increment: number = 1) => {
    if (!user) return

    const mission = missions.find((m) => m.id === missionId)
    if (!mission || mission.completed) return

    const newProgress = mission.currentProgress + increment
    const wasCompleted = updateMissionProgress(missionId, newProgress, user.id)

    // Actualizar estado local
    setMissions((prev) =>
      prev.map((m) =>
        m.id === missionId
          ? {
              ...m,
              currentProgress: Math.min(newProgress, m.maxProgress),
              completed: wasCompleted,
            }
          : m
      )
    )

    if (wasCompleted) {
      // Otorgar fichas
      const updatedUser = { ...user, tokens: user.tokens + mission.tokensReward }
      updateUserTokens(user.id, updatedUser.tokens)
      soundManager.play("achievement")

      // Actualizar racha
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const streakKey = `motivaplay_streak_${user.id}`
      const lastCompletion = localStorage.getItem(streakKey)
      const lastDate = lastCompletion ? new Date(lastCompletion) : null

      if (!lastDate || lastDate.getTime() < today.getTime()) {
        const currentStreak = parseInt(localStorage.getItem(`motivaplay_streak_count_${user.id}`) || "0")
        const newStreak = lastDate && lastDate.getTime() === today.getTime() - 86400000 ? currentStreak + 1 : 1
        localStorage.setItem(streakKey, today.toISOString())
        localStorage.setItem(`motivaplay_streak_count_${user.id}`, newStreak.toString())
        setDailyStreak(newStreak)

        // Bonus por racha
        if (newStreak % 7 === 0) {
          const bonus = 500
          updateUserTokens(user.id, user.tokens + mission.tokensReward + bonus)
          soundManager.play("win")
        }
      }

      // Verificar bonus por completar todas las misiones del día
      const allMissions = getMissions()
      const userMissions = getUserMissions(user.id)
      const remainingDaily = userMissions.filter((m) => m.type === "daily" && !m.completed && m.id !== missionId)
      if (remainingDaily.length === 0 && mission.type === "daily") {
        const bonus = 100
        const currentUser = getCurrentUser()
        if (currentUser) {
          updateUserTokens(user.id, currentUser.tokens + mission.tokensReward + bonus)
        }
        soundManager.play("win")
      }
    } else {
      soundManager.play("click")
    }
  }

  const dailyMissions = missions.filter((m) => m.type === "daily" && !m.completed)
  const weeklyMissions = missions.filter((m) => m.type === "weekly" && !m.completed)
  const completedMissions = missions.filter((m) => m.completed).slice(-5).reverse()

  return (
    <Card className="glass-card rounded-3xl border border-primary/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Target className="h-6 w-6 text-primary" />
              Panel de misiones
            </CardTitle>
            <CardDescription className="text-muted-foreground/85">
              Completa misiones diarias y semanales para ganar fichas
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            {dailyStreak > 0 && (
              <Badge className="gap-1 rounded-full border border-primary/40 bg-primary/20 text-primary">
                <Flame className="h-3 w-3" />
                {dailyStreak} días
              </Badge>
            )}
            {completedToday > 0 && (
              <Badge className="gap-1 rounded-full border border-accent/40 bg-accent/20 text-accent">
                <Trophy className="h-3 w-3" />
                {completedToday} hoy
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Misiones diarias */}
        {dailyMissions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Misiones diarias</h3>
              <Badge variant="secondary" className="ml-auto">
                {dailyMissions.filter((m) => m.completed).length}/{dailyMissions.length} completadas
              </Badge>
            </div>
            <div className="grid gap-3">
              {dailyMissions.map((mission) => {
                const Icon = categoryIcons[mission.category]
                const progress = (mission.currentProgress / mission.maxProgress) * 100

                return (
                  <div
                    key={mission.id}
                    className="relative overflow-hidden rounded-2xl border border-primary/25 bg-secondary/15 p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-xl bg-primary/10 ${categoryColors[mission.category]}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <h4 className="font-semibold text-white">{mission.title}</h4>
                          <p className="text-sm text-muted-foreground/85">{mission.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Progress value={progress} className="h-2 flex-1" />
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {mission.currentProgress}/{mission.maxProgress}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge className="gap-1 rounded-full border border-primary/40 bg-primary/20 text-primary shrink-0">
                        <Sparkles className="h-3 w-3" />
                        {mission.tokensReward}
                      </Badge>
                    </div>
                    {!mission.completed && (
                      <Button
                        size="sm"
                        onClick={() => handleProgressUpdate(mission.id)}
                        disabled={mission.currentProgress >= mission.maxProgress}
                        className="w-full rounded-full border border-primary/40 bg-primary/90 text-primary-foreground hover:bg-primary"
                      >
                        {mission.currentProgress >= mission.maxProgress ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Completada
                          </>
                        ) : (
                          <>
                            Marcar progreso
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Misiones semanales */}
        {weeklyMissions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Misiones semanales</h3>
              <Badge variant="secondary" className="ml-auto">
                {weeklyMissions.filter((m) => m.completed).length}/{weeklyMissions.length} completadas
              </Badge>
            </div>
            <div className="grid gap-3">
              {weeklyMissions.map((mission) => {
                const Icon = categoryIcons[mission.category]
                const progress = (mission.currentProgress / mission.maxProgress) * 100

                return (
                  <div
                    key={mission.id}
                    className="relative overflow-hidden rounded-2xl border border-primary/30 bg-secondary/20 p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-xl bg-primary/15 ${categoryColors[mission.category]}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <h4 className="font-semibold text-white">{mission.title}</h4>
                          <p className="text-sm text-muted-foreground/85">{mission.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Progress value={progress} className="h-2 flex-1" />
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {mission.currentProgress}/{mission.maxProgress}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge className="gap-1 rounded-full border border-primary/40 bg-primary/20 text-primary shrink-0">
                        <Sparkles className="h-3 w-3" />
                        {mission.tokensReward}
                      </Badge>
                    </div>
                    {!mission.completed && (
                      <Button
                        size="sm"
                        onClick={() => handleProgressUpdate(mission.id)}
                        disabled={mission.currentProgress >= mission.maxProgress}
                        className="w-full rounded-full border border-primary/40 bg-primary/90 text-primary-foreground hover:bg-primary"
                      >
                        {mission.currentProgress >= mission.maxProgress ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Completada
                          </>
                        ) : (
                          <>
                            Marcar progreso
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Misiones completadas recientes */}
        {completedMissions.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-primary/20">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-[0.35em]">
              Completadas recientemente
            </h3>
            <div className="space-y-2">
              {completedMissions.map((mission) => {
                const Icon = categoryIcons[mission.category]
                return (
                  <div
                    key={mission.id}
                    className="flex items-center gap-3 rounded-xl border border-primary/20 bg-secondary/10 p-3 opacity-75"
                  >
                    <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                    <Icon className={`h-4 w-4 ${categoryColors[mission.category]} shrink-0`} />
                    <span className="text-sm text-muted-foreground flex-1">{mission.title}</span>
                    <Badge variant="secondary" className="text-xs">
                      +{mission.tokensReward}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {dailyMissions.length === 0 && weeklyMissions.length === 0 && (
          <div className="text-center py-8 space-y-3">
            <Target className="h-12 w-12 text-muted-foreground/50 mx-auto" />
            <p className="text-muted-foreground">No hay misiones activas en este momento</p>
            <p className="text-sm text-muted-foreground/70">
              Las nuevas misiones se generarán automáticamente cada día
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

