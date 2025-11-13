"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { getAchievements, getAchievementTemplates, type Achievement, type AchievementTemplate } from "@/lib/storage"
import { Award, Star, Trophy } from "lucide-react"

interface BadgesPanelProps {
  userId: string
}

export function BadgesPanel({ userId }: BadgesPanelProps) {
  const [templates, setTemplates] = useState<AchievementTemplate[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])

  useEffect(() => {
    setTemplates(getAchievementTemplates())
    setAchievements(getAchievements().filter((a) => a.userId === userId))
  }, [userId])

  const getBadgeRank = (templateId: string): "bronze" | "silver" | "gold" | "platinum" | null => {
    const template = templates.find((t) => t.id === templateId)
    if (!template) return null

    const count = achievements.filter((a) => a.templateId === templateId).reduce((sum, a) => sum + a.count, 0)

    if (count >= template.platinumRequirement) return "platinum"
    if (count >= template.platinumRequirement * 0.75) return "gold"
    if (count >= template.platinumRequirement * 0.5) return "silver"
    if (count >= template.platinumRequirement * 0.25) return "bronze"
    return null
  }

  const getProgress = (templateId: string): number => {
    const template = templates.find((t) => t.id === templateId)
    if (!template) return 0

    const count = achievements.filter((a) => a.templateId === templateId).reduce((sum, a) => sum + a.count, 0)
    return Math.min((count / template.platinumRequirement) * 100, 100)
  }

  const getRankColor = (rank: string | null) => {
    switch (rank) {
      case "platinum":
        return "bg-gradient-to-br from-cyan-400 to-blue-500"
      case "gold":
        return "bg-gradient-to-br from-yellow-400 to-yellow-600"
      case "silver":
        return "bg-gradient-to-br from-gray-300 to-gray-500"
      case "bronze":
        return "bg-gradient-to-br from-orange-400 to-orange-600"
      default:
        return "bg-muted"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Mis Insignias
          </CardTitle>
          <CardDescription>Progreso hacia insignias platino</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {templates.map((template) => {
              const rank = getBadgeRank(template.id)
              const progress = getProgress(template.id)
              const count = achievements
                .filter((a) => a.templateId === template.id)
                .reduce((sum, a) => sum + a.count, 0)

              return (
                <Card key={template.id} className="overflow-hidden">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${getRankColor(rank)}`}>
                        {rank === "platinum" && <Trophy className="h-8 w-8 text-white" />}
                        {rank === "gold" && <Trophy className="h-8 w-8 text-white" />}
                        {rank === "silver" && <Star className="h-8 w-8 text-white" />}
                        {rank === "bronze" && <Award className="h-8 w-8 text-white" />}
                        {!rank && <Award className="h-8 w-8 text-muted-foreground" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{template.title}</h3>
                        <p className="text-xs text-muted-foreground">{template.description}</p>
                        {rank && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {rank.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progreso Platino</span>
                        <span className="font-semibold">
                          {count} / {template.platinumRequirement}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    <div className="text-xs text-muted-foreground">
                      <Award className="h-3 w-3 inline mr-1" />
                      {template.reward} fichas por logro
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
