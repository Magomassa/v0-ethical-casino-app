"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { soundManager } from "@/lib/sounds"

const numbers = Array.from({ length: 37 }, (_, i) => i) // 0-36
const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]

export function RouletteGame({
  currentTokens,
  onGameEnd,
  onClose,
}: {
  currentTokens: number
  onGameEnd: (tokensWon: number) => void
  onClose: () => void
}) {
  const [bet, setBet] = useState(10)
  const [betType, setBetType] = useState<"red" | "black" | "even" | "odd" | null>(null)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<number | null>(null)
  const [message, setMessage] = useState("")

  const spin = () => {
    if (!betType || bet > currentTokens || bet < 1) return

    setSpinning(true)
    setMessage("")
    soundManager.play("spin")

    setTimeout(() => {
      const winningNumber = numbers[Math.floor(Math.random() * numbers.length)]
      setResult(winningNumber)
      setSpinning(false)

      // Determine if won
      let won = false
      if (betType === "red" && redNumbers.includes(winningNumber)) won = true
      if (betType === "black" && !redNumbers.includes(winningNumber) && winningNumber !== 0) won = true
      if (betType === "even" && winningNumber !== 0 && winningNumber % 2 === 0) won = true
      if (betType === "odd" && winningNumber % 2 !== 0) won = true

      if (won) {
        const winAmount = bet * 2
        setMessage(`¡GANASTE! El ${winningNumber} salió. +${winAmount} fichas`)
        soundManager.play("win")
        onGameEnd(winAmount)
      } else {
        setMessage(`Salió ${winningNumber}. Perdiste ${bet} fichas`)
        soundManager.play("lose")
        onGameEnd(-bet)
      }
    }, 2000)
  }

  const getNumberColor = (num: number) => {
    if (num === 0) return "bg-secondary/20 text-secondary-foreground"
    return redNumbers.includes(num) ? "bg-red-500 text-white" : "bg-gray-800 text-white"
  }

  return (
    <div className="space-y-6">
      {result !== null && (
        <div className="flex justify-center">
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold ${getNumberColor(result)}`}
          >
            {result}
          </div>
        </div>
      )}

      {message && (
        <div
          className={`text-center text-lg font-bold ${message.includes("GANASTE") ? "text-secondary" : "text-muted-foreground"}`}
        >
          {message}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="roulette-bet">Apuesta (fichas)</Label>
          <Input
            id="roulette-bet"
            type="number"
            min="1"
            max={currentTokens}
            value={bet}
            onChange={(e) => setBet(Number.parseInt(e.target.value) || 1)}
            disabled={spinning}
          />
        </div>

        <div className="space-y-2">
          <Label>Elige tu apuesta:</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={betType === "red" ? "default" : "outline"}
              onClick={() => {
                setBetType("red")
                soundManager.play("click")
              }}
              disabled={spinning}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Rojo (2x)
            </Button>
            <Button
              variant={betType === "black" ? "default" : "outline"}
              onClick={() => {
                setBetType("black")
                soundManager.play("click")
              }}
              disabled={spinning}
              className="bg-gray-800 hover:bg-gray-900 text-white"
            >
              Negro (2x)
            </Button>
            <Button
              variant={betType === "even" ? "default" : "outline"}
              onClick={() => {
                setBetType("even")
                soundManager.play("click")
              }}
              disabled={spinning}
            >
              Par (2x)
            </Button>
            <Button
              variant={betType === "odd" ? "default" : "outline"}
              onClick={() => {
                setBetType("odd")
                soundManager.play("click")
              }}
              disabled={spinning}
            >
              Impar (2x)
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={spin} disabled={spinning || !betType || bet > currentTokens} className="flex-1">
            {spinning ? "Girando..." : "Girar ruleta"}
          </Button>
          <Button onClick={onClose} variant="outline">
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  )
}
