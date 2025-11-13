"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCurrentUser, logout, updateUserTokens } from "@/lib/auth"
import {
  getPrizes,
  getAchievements,
  getRedemptions,
  saveRedemptions,
  type Prize,
  type Achievement,
  type Redemption,
} from "@/lib/storage"
import { Coins, Trophy, Gift, Sparkles, LogOut, Gamepad2, Target, Users, TrendingUp, Award } from "lucide-react"
import { SlotsGame } from "./games/slots-game"
import { BlackjackGame } from "./games/blackjack-game"
import { RouletteGame } from "./games/roulette-game"
import { AIMotivator } from "./ai-motivator"
import { ThemeToggle } from "./theme-toggle"
import { EmployeeMissions } from "./missions/employee-missions"
import { FriendsPanel } from "./social/friends-panel"
import { RankingsPanel } from "./social/rankings-panel"
import { BadgesPanel } from "./social/badges-panel"

export function EmployeeDashboard() {
  const [user, setUser] = useState(getCurrentUser())
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [gameDialogOpen, setGameDialogOpen] = useState(false)
  const [selectedGame, setSelectedGame] = useState<"slots" | "blackjack" | "roulette" | null>(null)
  const [activeTab, setActiveTab] = useState("games")

  useEffect(() => {
    setPrizes(getPrizes())
    setAchievements(getAchievements().filter((a) => a.userId === user?.id))
  }, [user])

  const handleLogout = () => {
    logout()
    window.location.reload()
  }

  const handleRedeemPrize = (prize: Prize) => {
    if (!user || user.tokens < prize.cost) return

    const newTokens = user.tokens - prize.cost
    updateUserTokens(user.id, newTokens)

    const redemptions = getRedemptions()
    const newRedemption: Redemption = {
      id: Date.now().toString(),
      userId: user.id,
      prizeId: prize.id,
      prizeName: prize.name,
      tokensCost: prize.cost,
      date: new Date().toISOString(),
      status: "pending",
    }
    redemptions.push(newRedemption)
    saveRedemptions(redemptions)

    setUser({ ...user, tokens: newTokens })
  }

  const openGame = (game: "slots" | "blackjack" | "roulette") => {
    setSelectedGame(game)
    setGameDialogOpen(true)
  }

  const handleGameEnd = (tokensWon: number) => {
    if (!user) return
    const newTokens = user.tokens + tokensWon
    updateUserTokens(user.id, newTokens)
    setUser({ ...user, tokens: newTokens })
  }

  if (!user) return null

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
              <h1 className="text-xl font-bold">MotivaPlay</h1>
              <p className="text-sm text-muted-foreground">{user.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-accent px-4 py-2 rounded-lg">
              <Coins className="h-5 w-5 text-secondary" />
              <span className="font-bold text-lg">{user.tokens}</span>
              <span className="text-sm text-muted-foreground">fichas</span>
            </div>
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* AI Motivator */}
        <AIMotivator userName={user.name} tokens={user.tokens} />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="games" className="gap-2">
              <Gamepad2 className="h-4 w-4" />
              Juegos
            </TabsTrigger>
            <TabsTrigger value="missions" className="gap-2">
              <Target className="h-4 w-4" />
              Misiones
            </TabsTrigger>
            <TabsTrigger value="friends" className="gap-2">
              <Users className="h-4 w-4" />
              Amigos
            </TabsTrigger>
            <TabsTrigger value="rankings" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Rankings
            </TabsTrigger>
            <TabsTrigger value="badges" className="gap-2">
              <Award className="h-4 w-4" />
              Insignias
            </TabsTrigger>
            <TabsTrigger value="prizes" className="gap-2">
              <Gift className="h-4 w-4" />
              Premios
            </TabsTrigger>
            <TabsTrigger value="achievements" className="gap-2">
              <Trophy className="h-4 w-4" />
              Historial
            </TabsTrigger>
          </TabsList>

          {/* Games Tab Content */}
          <TabsContent value="games" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gamepad2 className="h-5 w-5" />
                  Juegos
                </CardTitle>
                <CardDescription>Prueba tu suerte y gana más fichas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <Button
                    onClick={() => openGame("slots")}
                    className="h-24 text-lg bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  >
                    🎰 Slots
                  </Button>
                  <Button
                    onClick={() => openGame("blackjack")}
                    className="h-24 text-lg bg-gradient-to-br from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70"
                  >
                    🃏 Blackjack
                  </Button>
                  <Button
                    onClick={() => openGame("roulette")}
                    className="h-24 text-lg bg-gradient-to-br from-chart-3 to-chart-3/80 hover:from-chart-3/90 hover:to-chart-3/70 text-white"
                  >
                    🎡 Ruleta
                  </Button>
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
                  Misiones
                </CardTitle>
                <CardDescription>Postula evidencias de cursos, proyectos y logros para ganar fichas</CardDescription>
              </CardHeader>
              <CardContent>
                <EmployeeMissions userId={user.id} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="friends">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Amigos
                </CardTitle>
                <CardDescription>Conecta con compañeros y dona fichas</CardDescription>
              </CardHeader>
              <CardContent>
                <FriendsPanel currentUserId={user.id} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rankings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Rankings
                </CardTitle>
                <CardDescription>Compite con tus amigos y departamentos</CardDescription>
              </CardHeader>
              <CardContent>
                <RankingsPanel currentUserId={user.id} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="badges">
            <BadgesPanel userId={user.id} />
          </TabsContent>

          {/* Prizes Tab Content */}
          <TabsContent value="prizes">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Premios disponibles
                </CardTitle>
                <CardDescription>Canjea tus fichas por recompensas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {prizes
                    .filter((p) => p.available)
                    .map((prize) => (
                      <Card key={prize.id} className="overflow-hidden">
                        <div className="relative">
                          <img
                            src={prize.image || "/placeholder.svg"}
                            alt={prize.name}
                            className="w-full h-32 object-cover"
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
                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              {prize.discount && prize.originalCost ? (
                                <>
                                  <Badge variant="secondary" className="gap-1">
                                    <Coins className="h-3 w-3" />
                                    {prize.cost}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground line-through">
                                    {prize.originalCost}
                                  </span>
                                  <Badge variant="destructive" className="text-xs">
                                    -{prize.discount}%
                                  </Badge>
                                </>
                              ) : (
                                <Badge variant="secondary" className="gap-1">
                                  <Coins className="h-3 w-3" />
                                  {prize.cost}
                                </Badge>
                              )}
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleRedeemPrize(prize)}
                              disabled={user.tokens < prize.cost}
                            >
                              Canjear
                            </Button>
                          </div>
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
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Mis logros
                </CardTitle>
                <CardDescription>Historial de desempeño y fichas ganadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {achievements.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Aún no tienes logros. ¡Sigue trabajando duro!
                    </p>
                  ) : (
                    achievements.map((achievement) => (
                      <div key={achievement.id} className="flex items-start justify-between p-4 bg-accent rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-semibold">{achievement.title}</h3>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(achievement.date).toLocaleDateString("es-ES")}
                          </p>
                        </div>
                        <Badge className="gap-1">
                          <Coins className="h-3 w-3" />+{achievement.tokensAwarded}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Game Dialog */}
      <Dialog open={gameDialogOpen} onOpenChange={setGameDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selectedGame === "slots" && "🎰 Slots"}
              {selectedGame === "blackjack" && "🃏 Blackjack"}
              {selectedGame === "roulette" && "🎡 Ruleta"}
            </DialogTitle>
            <DialogDescription>Apuesta fichas y gana más. ¡Buena suerte!</DialogDescription>
          </DialogHeader>
          {selectedGame === "slots" && (
            <SlotsGame currentTokens={user.tokens} onGameEnd={handleGameEnd} onClose={() => setGameDialogOpen(false)} />
          )}
          {selectedGame === "blackjack" && (
            <BlackjackGame
              currentTokens={user.tokens}
              onGameEnd={handleGameEnd}
              onClose={() => setGameDialogOpen(false)}
            />
          )}
          {selectedGame === "roulette" && (
            <RouletteGame
              currentTokens={user.tokens}
              onGameEnd={handleGameEnd}
              onClose={() => setGameDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default EmployeeDashboard
