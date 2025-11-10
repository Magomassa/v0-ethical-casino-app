"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

const symbols = ["🍒", "🍋", "🍊", "🍇", "⭐", "💎"]

export function SlotsGame({
  currentTokens,
  onGameEnd,
  onClose,
}: {
  currentTokens: number
  onGameEnd: (tokensWon: number) => void
  onClose: () => void
}) {
  const [bet, setBet] = useState(10)
  const [reels, setReels] = useState(["🍒", "🍒", "🍒"])
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState("")

  const spin = () => {
    if (bet > currentTokens || bet < 1) return

    setSpinning(true)
    setResult("")

    // Animate spinning
    const spinInterval = setInterval(() => {
      setReels([
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
      ])
    }, 100)

    setTimeout(() => {
      clearInterval(spinInterval)
      const finalReels = [
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
      ]
      setReels(finalReels)
      setSpinning(false)

      // Check win
      if (finalReels[0] === finalReels[1] && finalReels[1] === finalReels[2]) {
        // Three of a kind
        const winAmount = bet * 10
        setResult(`¡GANASTE! +${winAmount} fichas`)
        onGameEnd(winAmount)
      } else if (finalReels[0] === finalReels[1] || finalReels[1] === finalReels[2]) {
        // Two of a kind
        const winAmount = bet * 2
        setResult(`¡Par! +${winAmount} fichas`)
        onGameEnd(winAmount)
      } else {
        setResult(`Perdiste ${bet} fichas`)
        onGameEnd(-bet)
      }
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-center gap-4">
        {reels.map((symbol, i) => (
          <Card key={i} className="w-24 h-24 flex items-center justify-center text-5xl bg-accent">
            <CardContent className="p-0">{symbol}</CardContent>
          </Card>
        ))}
      </div>

      {result && (
        <div
          className={`text-center text-lg font-bold ${result.includes("GANASTE") ? "text-secondary" : "text-muted-foreground"}`}
        >
          {result}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bet">Apuesta (fichas)</Label>
          <Input
            id="bet"
            type="number"
            min="1"
            max={currentTokens}
            value={bet}
            onChange={(e) => setBet(Number.parseInt(e.target.value) || 1)}
            disabled={spinning}
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={spin} disabled={spinning || bet > currentTokens} className="flex-1">
            {spinning ? "Girando..." : "Girar"}
          </Button>
          <Button onClick={onClose} variant="outline">
            Cerrar
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>3 iguales: 10x apuesta</p>
          <p>2 iguales: 2x apuesta</p>
        </div>
      </div>
    </div>
  )
}
