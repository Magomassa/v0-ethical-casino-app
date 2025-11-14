"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { logout } from "@/lib/auth"
import {
  getAllPrizes,
  getUserAchievements,
  getAllRedemptions,
  createRedemption,
  updateUser,
  createTransaction,
} from "@/lib/firebase/db"
import type { Prize, Achievement, Redemption, User } from "@/lib/storage"
import { Coins, Trophy, Gift, Gamepad2, Target, Users, TrendingUp, Award } from 'lucide-react'
import { SlotsGame } from "./games/slots-game"
import { BlackjackGame } from "./games/blackjack-game"
import { RouletteGame } from "./games/roulette-game"
import { AIMotivator } from "./ai-motivator"
import { EmployeeMissions } from "./missions/employee-missions"
import { FriendsPanel } from "./social/friends-panel"
import { RankingsPanel } from "./social/rankings-panel"
import { BadgesPanel } from "./social/badges-panel"

export function EmployeeDashboard({ user: initialUser, onLogout }: { user: User; onLogout: () => void }) {
  const [user, setUser] = useState<User>(initialUser)
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [gameDialogOpen, setGameDialogOpen] = useState(false)
  const [selectedGame, setSelectedGame] = useState<"slots" | "blackjack" | "roulette" | null>(null)
  const [activeTab, setActiveTab] = useState("games")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [prizesData, achievementsData] = await Promise.all([
          getAllPrizes(),
          getUserAchievements(user.id)
        ])
        setPrizes(prizesData)
        setAchievements(achievementsData)
      } catch (error) {
        console.error("[v0] Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user.id])

  const handleLogout = async () => {
    await logout()
    onLogout()
  }

  const handleRedeemPrize = async (prize: Prize) => {
    if (!user || user.tokens < prize.cost) return

    try {
      const newTokens = user.tokens - prize.cost
      await updateUser(user.id, { tokens: newTokens })

      const newRedemption: Omit<Redemption, "id"> = {
        userId: user.id,
        prizeId: prize.id,
        prizeName: prize.name,
        tokensCost: prize.cost,
        date: new Date().toISOString(),
        status: "pending",
      }
      await createRedemption(newRedemption)

      await createTransaction({
        userId: user.id,
        type: "debit",
        amount: prize.cost,
        source: "reward",
        sourceRef: prize.id,
        description: `Canjeado: ${prize.name}`,
        date: new Date().toISOString(),
      })

      setUser({ ...user, tokens: newTokens })
    } catch (error) {
      console.error("[v0] Error redeeming prize:", error)
    }
  }

  const openGame = (game: "slots" | "blackjack" | "roulette") => {
    setSelectedGame(game)
    setGameDialogOpen(true)
  }

  const handleGameEnd = async (tokensWon: number) => {
    if (!user) return
    try {
      const newTokens = user.tokens + tokensWon
      await updateUser(user.id, { tokens: newTokens })

      if (tokensWon !== 0) {
        await createTransaction({
          userId: user.id,
          type: tokensWon > 0 ? "credit" : "debit",
          amount: Math.abs(tokensWon),
          source: "play",
          description: tokensWon > 0 ? "Ganado en juego" : "Perdido en juego",
          date: new Date().toISOString(),
        })
      }

      setUser({ ...user, tokens: newTokens })
    } catch (error) {
      console.error("[v0] Error updating tokens:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
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
            <Card className="rounded-3xl border-[var(--border)]/50">
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Gamepad2 className="h-5 w-5" />
                    Mesa de juegos
                  </CardTitle>
                  <CardDescription>Prueba tu suerte, multiplica tus fichas y desbloquea recompensas especiales.</CardDescription>
                </div>
                <div
                  className="hidden md:flex items-center gap-2 rounded-full border px-4 py-2 text-xs tracking-widest cursor-pointer hover:bg-accent/40"
                  onClick={() => setActiveTab('achievements')}
                  title="Ver historial"
                >
                  <span>🕑 Historial en tiempo real</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  {/* Slots */}
                  <div
                    role="button"
                    onClick={() => openGame("slots")}
                    className="group relative overflow-hidden rounded-2xl p-6 cursor-pointer ring-1 ring-[var(--border)]/40 bg-gradient-to-br from-yellow-300/35 via-primary/20 to-blue-700/40 dark:from-yellow-400/25 dark:to-blue-600/35 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-5xl">🎰</span>
                    </div>
                    <div className="mt-4 space-y-2">
                      <h3 className="text-xl font-extrabold">Slots Royal</h3>
                      <p className="text-sm text-muted-foreground">Gira y gana combinaciones épicas</p>
                    </div>
                    <div className="mt-6 text-xs font-semibold tracking-widest text-muted-foreground">
                      JUGAR AHORA →
                    </div>
                    <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{background:"radial-gradient(120px 120px at 20% 20%, rgba(255,255,255,0.25), transparent)"}} />
                  </div>

                  {/* Blackjack */}
                  <div
                    role="button"
                    onClick={() => openGame("blackjack")}
                    className="group relative overflow-hidden rounded-2xl p-6 cursor-pointer ring-1 ring-[var(--border)]/40 bg-gradient-to-br from-blue-700/40 via-blue-600/30 to-emerald-500/40 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-5xl">🃏</span>
                    </div>
                    <div className="mt-4 space-y-2">
                      <h3 className="text-xl font-extrabold">Blackjack Pro</h3>
                      <p className="text-sm text-muted-foreground">Domina la mesa, asegure 21</p>
                    </div>
                    <div className="mt-6 text-xs font-semibold tracking-widest text-muted-foreground">
                      JUGAR AHORA →
                    </div>
                    <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{background:"radial-gradient(120px 120px at 20% 20%, rgba(255,255,255,0.15), transparent)"}} />
                  </div>

                  {/* Roulette */}
                  <div
                    role="button"
                    onClick={() => openGame("roulette")}
                    className="group relative overflow-hidden rounded-2xl p-6 cursor-pointer ring-1 ring-[var(--border)]/40 bg-gradient-to-br from-emerald-400/35 via-teal-500/30 to-yellow-300/40 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-5xl">🎡</span>
                    </div>
                    <div className="mt-4 space-y-2">
                      <h3 className="text-xl font-extrabold">Ruleta Motivacional</h3>
                      <p className="text-sm text-muted-foreground">Apuesta por momentos inolvidables</p>
                    </div>
                    <div className="mt-6 text-xs font-semibold tracking-widest text-muted-foreground">
                      JUGAR AHORA →
                    </div>
                    <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{background:"radial-gradient(120px 120px at 20% 20%, rgba(255,255,255,0.2), transparent)"}} />
                  </div>
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
