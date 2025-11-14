"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
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
import {
  Coins,
  Trophy,
  Gift,
  Sparkles,
  LogOut,
  Gamepad2,
  Crown,
  Flame,
  Star,
  ArrowUpRight,
  History,
} from "lucide-react"
import { SlotsGame } from "./games/slots-game"
import { BlackjackGame } from "./games/blackjack-game"
import { RouletteGame } from "./games/roulette-game"
import { AIMotivator } from "./ai-motivator"
import { SoundControl } from "./sound-control"
import { MissionsPanel } from "./missions-panel"

export function EmployeeDashboard() {
  const [user, setUser] = useState(getCurrentUser())
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [gameDialogOpen, setGameDialogOpen] = useState(false)
  const [selectedGame, setSelectedGame] = useState<"slots" | "blackjack" | "roulette" | null>(null)
  const [tickerIndex, setTickerIndex] = useState(0)

  useEffect(() => {
    setPrizes(getPrizes())
    const userAchievements = getAchievements().filter((a) => a.userId === user?.id)
    setAchievements(userAchievements)
    // Sonido cuando hay un nuevo logro
    if (userAchievements.length > 0 && typeof window !== "undefined") {
      const { soundManager } = require("@/lib/sounds")
      // Solo reproducir si es un logro reciente (últimos 5 segundos)
      const latestAchievement = userAchievements[userAchievements.length - 1]
      const achievementDate = new Date(latestAchievement.date).getTime()
      const now = Date.now()
      if (now - achievementDate < 5000) {
        soundManager.play("achievement")
      }
    }
  }, [user])

  useEffect(() => {
    if (!prizes.length) return
    const interval = window.setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % prizes.length)
    }, 3500)
    return () => window.clearInterval(interval)
  }, [prizes.length])

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
    // Sonido de canje
    if (typeof window !== "undefined") {
      const { soundManager } = require("@/lib/sounds")
      soundManager.play("redeem")
    }
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
    // Sonido según resultado
    if (typeof window !== "undefined") {
      const { soundManager } = require("@/lib/sounds")
      if (tokensWon > 0) {
        soundManager.play("win")
      } else if (tokensWon < 0) {
        soundManager.play("lose")
      } else {
        soundManager.play("coin")
      }
    }
  }

  if (!user) return null

  return (
    <div className="relative min-h-screen overflow-hidden casino-gradient text-foreground">
      <span className="casino-grid" />
      <span className="casino-sheen" />

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b border-primary/25 bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 rounded-2xl border border-primary/40 bg-secondary/30 px-4 py-2 shadow-gold">
              <Image src="/motivaplay-icon.svg" alt="MotivaPlay app icon" width={42} height={42} />
              <div>
                <p className="text-lg font-semibold text-glow leading-tight">MotivaPlay</p>
                <p className="text-xs uppercase tracking-[0.45em] text-muted-foreground">Casino corporativo</p>
              </div>
            </div>
            <div className="lg:pl-2">
              <p className="text-muted-foreground text-xs uppercase tracking-[0.35em] mb-1">Bienvenido</p>
              <h1 className="text-2xl font-extrabold text-white/95">{user.email}</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <div className="flex items-center gap-3 rounded-2xl border border-primary/40 bg-secondary/30 px-4 py-2 token-counter">
              <Coins className="h-6 w-6 text-primary drop-shadow-md" />
              <div className="leading-tight">
                <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Fichas</p>
                <p className="text-3xl font-black text-white flex items-baseline gap-1">
                  {user.tokens}
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.25em]">MP</span>
                </p>
              </div>
            </div>
            <SoundControl />
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
        <div className="border-t border-primary/20 bg-secondary/20">
          <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center gap-3 text-sm text-muted-foreground animate-in fade-in">
            <Sparkles className="h-4 w-4 text-primary animate-spin" />
            <p className="uppercase tracking-[0.35em] text-xs">Última recompensa destacada</p>
            {prizes.length > 0 ? (
              <div className="overflow-hidden relative flex-1">
                <div
                  key={prizes[tickerIndex].id}
                  className="animate-in slide-in-from-right-4 duration-500"
                >
                  {prizes[tickerIndex].name} · {prizes[tickerIndex].cost} fichas
                </div>
              </div>
            ) : (
              <span className="text-muted-foreground/70">Actualiza tu catálogo de premios para inspirar a tu equipo.</span>
            )}
          </div>
        </div>
      </header>

      <main className="container relative z-10 mx-auto px-4 sm:px-6 py-10 space-y-10">
        {/* Hero */}
        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Card className="glass-card rounded-3xl border border-primary/30 overflow-hidden">
            <CardContent className="p-8 sm:p-10 space-y-6">
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.45em] text-muted-foreground/70">
                <Sparkles className="h-4 w-4 text-primary" />
                Casino motivacional en vivo
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight text-white">
                ¡Eleva tu racha! Canjea tus logros por experiencias memorables.
              </h2>
              <p className="text-muted-foreground/90 text-base">
                Participa en dinámicas diarias, desbloquea logros y suma fichas para acceder a premios exclusivos de la
                compañía.
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-primary/30 bg-secondary/20 p-4 space-y-2">
                  <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Nivel actual</p>
                  <p className="text-2xl font-bold text-primary flex items-center gap-2">
                    <Crown className="h-5 w-5" />
                    Elite
                  </p>
                  <p className="text-xs text-muted-foreground/80">Aumenta tu ranking completando misiones diarias.</p>
                </div>
                <div className="rounded-2xl border border-primary/30 bg-secondary/20 p-4 space-y-2">
                  <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Misiones activas</p>
                  <p className="text-2xl font-bold text-primary flex items-center gap-2">
                    <Flame className="h-5 w-5" />
                    3 retos
                  </p>
                  <p className="text-xs text-muted-foreground/80">Explora el panel de logros para completar desafíos.</p>
                </div>
                <div className="rounded-2xl border border-primary/30 bg-secondary/20 p-4 space-y-2">
                  <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Jackpot del día</p>
                  <p className="text-2xl font-bold text-primary flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    1,500 fichas
                  </p>
                  <p className="text-xs text-muted-foreground/80">Participa en la ruleta motivacional para ganarlo.</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button
                  onClick={() => openGame("roulette")}
                  className="casino-button inline-flex items-center gap-2"
                >
                  Jugar ruleta motivacional
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Próximos sorteos · cada viernes 18:00
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card rounded-3xl border border-primary/30 overflow-hidden">
            <CardContent className="p-0">
              <AIMotivator userName={user.email.split("@")[0]} tokens={user.tokens} />
            </CardContent>
          </Card>
        </section>

        {/* Missions Panel */}
        <MissionsPanel />

        {/* Games Section */}
        <Card className="glass-card rounded-3xl border border-primary/30">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Gamepad2 className="h-6 w-6 text-primary" />
                Mesa de juegos
              </CardTitle>
              <CardDescription className="text-muted-foreground/80">
                Prueba tu suerte, multiplica tus fichas y desbloquea recompensas especiales.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-primary/30 bg-secondary/20 px-4 py-1 text-xs uppercase tracking-[0.4em] text-muted-foreground">
              <History className="h-4 w-4 text-primary" />
              historial en tiempo real
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-5 lg:grid-cols-3">
              {[
                {
                  id: "slots" as const,
                  title: "Slots Royal",
                  subtitle: "Gira y gana combinaciones épicas",
                  emoji: "🎰",
                  gradient: "from-primary/90 via-primary/70 to-secondary/70",
                },
                {
                  id: "blackjack" as const,
                  title: "Blackjack Pro",
                  subtitle: "Domina la mesa, asegure 21",
                  emoji: "🃏",
                  gradient: "from-secondary/90 via-secondary/70 to-accent/70",
                },
                {
                  id: "roulette" as const,
                  title: "Ruleta Motivacional",
                  subtitle: "Apuesta por momentos inolvidables",
                  emoji: "🎡",
                  gradient: "from-accent/90 via-accent/70 to-primary/70",
                },
              ].map((game) => (
                <button
                  key={game.id}
                  onClick={() => openGame(game.id)}
                  className={`relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br ${game.gradient} px-6 py-8 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-gold group`}
                >
                  <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10 blur-3xl opacity-30 group-hover:opacity-60 transition" />
                  <span className="text-5xl drop-shadow-lg">{game.emoji}</span>
                  <h3 className="mt-6 text-2xl font-bold text-white">{game.title}</h3>
                  <p className="mt-3 text-sm text-white/80 max-w-[16rem]">{game.subtitle}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-white/70">
                    Jugar ahora
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Prizes Section */}
        <Card className="glass-card rounded-3xl border border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Gift className="h-6 w-6 text-primary" />
              Vitrina de premios
            </CardTitle>
            <CardDescription className="text-muted-foreground/85">
              Canjea tus fichas por experiencias, productos o días de bienestar corporativo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {prizes
                .filter((p) => p.available)
                .map((prize) => (
                  <div
                    key={prize.id}
                    className="group relative overflow-hidden rounded-3xl border border-primary/20 bg-secondary/20 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-gold"
                  >
                    <div className="relative h-40 overflow-hidden">
                      <Image
                        src={prize.image || "/placeholder.svg"}
                        alt={prize.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
                      <Badge className="absolute left-4 top-4 border border-primary/40 bg-background/60 text-xs uppercase tracking-[0.4em]">
                        Premium
                      </Badge>
                    </div>
                    <div className="p-5 space-y-3">
                      <h3 className="text-lg font-semibold text-white leading-tight capitalize">{prize.name}</h3>
                      <p className="text-sm text-muted-foreground/85 min-h-[52px]">{prize.description}</p>
                      <div className="flex items-center justify-between pt-2">
                        <Badge variant="secondary" className="gap-1 rounded-full bg-primary/20 text-primary border border-primary/40">
                          <Coins className="h-3 w-3" />
                          {prize.cost}
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => handleRedeemPrize(prize)}
                          disabled={user.tokens < prize.cost}
                          className="rounded-full border border-primary/40 bg-primary/90 text-primary-foreground hover:bg-primary"
                        >
                          Canjear
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              {prizes.filter((p) => p.available).length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border border-dashed border-primary/30 bg-secondary/10 py-14 text-center space-y-3">
                  <Gift className="h-10 w-10 text-primary" />
                  <p className="text-lg font-semibold text-white">Aún no hay premios disponibles</p>
                  <p className="text-sm text-muted-foreground/80">
                    Solicita a tu administrador que agregue nuevas recompensas para mantener alta la motivación.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Achievements Section */}
        <Card className="glass-card rounded-3xl border border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Trophy className="h-6 w-6 text-primary" />
              Mi historial de logros
            </CardTitle>
            <CardDescription className="text-muted-foreground/85">
              Revisa tus hitos, reconoce tus progresos y planifica la próxima meta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {achievements.length === 0 ? (
                <p className="rounded-3xl border border-dashed border-primary/30 bg-secondary/10 text-muted-foreground/80 text-center py-12">
                  Aún no tienes logros registrados. ¡Sigue participando para sumarte al salón de la fama!
                </p>
              ) : (
                achievements
                  .slice()
                  .reverse()
                  .map((achievement) => (
                    <div
                      key={achievement.id}
                      className="relative flex flex-col gap-3 sm:flex-row sm:items-center justify-between rounded-2xl border border-primary/30 bg-secondary/15 px-5 py-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 flex items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
                          <Sparkles className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{achievement.title}</h3>
                          <p className="text-sm text-muted-foreground/85">{achievement.description}</p>
                          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground mt-2">
                            {new Date(achievement.date).toLocaleDateString("es-ES")}
                          </p>
                        </div>
                      </div>
                      <Badge className="gap-1 rounded-full border border-primary/40 bg-primary/90 text-primary-foreground self-start sm:self-center">
                        <Coins className="h-4 w-4" />
                        +{achievement.tokensAwarded}
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
        <DialogContent className="max-w-4xl border border-primary/30 bg-background/90 backdrop-blur-3xl">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              {selectedGame === "slots" && "🎰 Slots"}
              {selectedGame === "blackjack" && "🃏 Blackjack"}
              {selectedGame === "roulette" && "🎡 Ruleta"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground/80">
              Apuesta fichas y gana más. ¡Que la suerte corporativa esté de tu lado!
            </DialogDescription>
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
