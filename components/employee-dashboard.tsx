"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
import { Coins, Trophy, Gift, Sparkles, LogOut, Gamepad2 } from "lucide-react"
import { SlotsGame } from "./games/slots-game"
import { BlackjackGame } from "./games/blackjack-game"
import { RouletteGame } from "./games/roulette-game"
import { AIMotivator } from "./ai-motivator"

export function EmployeeDashboard() {
  const [user, setUser] = useState(getCurrentUser())
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [gameDialogOpen, setGameDialogOpen] = useState(false)
  const [selectedGame, setSelectedGame] = useState<"slots" | "blackjack" | "roulette" | null>(null)

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
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-accent px-4 py-2 rounded-lg">
              <Coins className="h-5 w-5 text-secondary" />
              <span className="font-bold text-lg">{user.tokens}</span>
              <span className="text-sm text-muted-foreground">fichas</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* AI Motivator */}
        <AIMotivator userName={user.email.split("@")[0]} tokens={user.tokens} />

        {/* Games Section */}
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

        {/* Prizes Section */}
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
                    <img
                      src={prize.image || "/placeholder.svg"}
                      alt={prize.name}
                      className="w-full h-32 object-cover"
                    />
                    <CardContent className="p-4 space-y-2">
                      <h3 className="font-semibold text-balance">{prize.name}</h3>
                      <p className="text-sm text-muted-foreground text-pretty">{prize.description}</p>
                      <div className="flex items-center justify-between pt-2">
                        <Badge variant="secondary" className="gap-1">
                          <Coins className="h-3 w-3" />
                          {prize.cost}
                        </Badge>
                        <Button size="sm" onClick={() => handleRedeemPrize(prize)} disabled={user.tokens < prize.cost}>
                          Canjear
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Achievements Section */}
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
                <p className="text-muted-foreground text-center py-8">Aún no tienes logros. ¡Sigue trabajando duro!</p>
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
