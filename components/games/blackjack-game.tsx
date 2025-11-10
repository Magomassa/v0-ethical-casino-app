"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

type Card = { suit: string; value: string; numValue: number }

const suits = ["♠", "♥", "♦", "♣"]
const values = [
  { value: "A", numValue: 11 },
  { value: "2", numValue: 2 },
  { value: "3", numValue: 3 },
  { value: "4", numValue: 4 },
  { value: "5", numValue: 5 },
  { value: "6", numValue: 6 },
  { value: "7", numValue: 7 },
  { value: "8", numValue: 8 },
  { value: "9", numValue: 9 },
  { value: "10", numValue: 10 },
  { value: "J", numValue: 10 },
  { value: "Q", numValue: 10 },
  { value: "K", numValue: 10 },
]

export function BlackjackGame({
  currentTokens,
  onGameEnd,
  onClose,
}: {
  currentTokens: number
  onGameEnd: (tokensWon: number) => void
  onClose: () => void
}) {
  const [bet, setBet] = useState(10)
  const [gameStarted, setGameStarted] = useState(false)
  const [playerHand, setPlayerHand] = useState<Card[]>([])
  const [dealerHand, setDealerHand] = useState<Card[]>([])
  const [result, setResult] = useState("")
  const [gameOver, setGameOver] = useState(false)

  const createDeck = (): Card[] => {
    const deck: Card[] = []
    for (const suit of suits) {
      for (const { value, numValue } of values) {
        deck.push({ suit, value, numValue })
      }
    }
    return deck.sort(() => Math.random() - 0.5)
  }

  const calculateScore = (hand: Card[]): number => {
    let score = hand.reduce((sum, card) => sum + card.numValue, 0)
    let aces = hand.filter((card) => card.value === "A").length

    while (score > 21 && aces > 0) {
      score -= 10
      aces--
    }

    return score
  }

  const startGame = () => {
    if (bet > currentTokens || bet < 1) return

    const deck = createDeck()
    const newPlayerHand = [deck[0], deck[2]]
    const newDealerHand = [deck[1], deck[3]]

    setPlayerHand(newPlayerHand)
    setDealerHand(newDealerHand)
    setGameStarted(true)
    setResult("")
    setGameOver(false)
  }

  const hit = () => {
    const deck = createDeck()
    const newHand = [...playerHand, deck[0]]
    setPlayerHand(newHand)

    const score = calculateScore(newHand)
    if (score > 21) {
      endGame(newHand, dealerHand)
    }
  }

  const stand = () => {
    const newDealerHand = [...dealerHand]
    const deck = createDeck()
    let deckIndex = 0

    while (calculateScore(newDealerHand) < 17) {
      newDealerHand.push(deck[deckIndex++])
    }

    setDealerHand(newDealerHand)
    endGame(playerHand, newDealerHand)
  }

  const endGame = (finalPlayerHand: Card[], finalDealerHand: Card[]) => {
    const playerScore = calculateScore(finalPlayerHand)
    const dealerScore = calculateScore(finalDealerHand)

    setGameOver(true)

    if (playerScore > 21) {
      setResult(`Te pasaste! Perdiste ${bet} fichas`)
      onGameEnd(-bet)
    } else if (dealerScore > 21) {
      setResult(`¡Dealer se pasó! Ganaste ${bet * 2} fichas`)
      onGameEnd(bet * 2)
    } else if (playerScore > dealerScore) {
      setResult(`¡Ganaste! +${bet * 2} fichas`)
      onGameEnd(bet * 2)
    } else if (playerScore < dealerScore) {
      setResult(`Perdiste ${bet} fichas`)
      onGameEnd(-bet)
    } else {
      setResult("Empate! Recuperas tu apuesta")
      onGameEnd(0)
    }
  }

  const renderCard = (card: Card) => (
    <div
      className={`w-16 h-24 bg-card border-2 rounded-lg flex flex-col items-center justify-center text-2xl font-bold ${card.suit === "♥" || card.suit === "♦" ? "text-red-500" : "text-foreground"}`}
    >
      <div>{card.value}</div>
      <div className="text-xl">{card.suit}</div>
    </div>
  )

  return (
    <div className="space-y-6">
      {!gameStarted ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="blackjack-bet">Apuesta (fichas)</Label>
            <Input
              id="blackjack-bet"
              type="number"
              min="1"
              max={currentTokens}
              value={bet}
              onChange={(e) => setBet(Number.parseInt(e.target.value) || 1)}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={startGame} disabled={bet > currentTokens} className="flex-1">
              Iniciar juego
            </Button>
            <Button onClick={onClose} variant="outline">
              Cerrar
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Dealer</span>
                <Badge>{calculateScore(dealerHand)}</Badge>
              </div>
              <div className="flex gap-2">
                {dealerHand.map((card, i) => (
                  <div key={i}>
                    {!gameOver && i === 1 ? (
                      <div className="w-16 h-24 bg-muted border-2 rounded-lg" />
                    ) : (
                      renderCard(card)
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Tu mano</span>
                <Badge variant="secondary">{calculateScore(playerHand)}</Badge>
              </div>
              <div className="flex gap-2">
                {playerHand.map((card, i) => (
                  <div key={i}>{renderCard(card)}</div>
                ))}
              </div>
            </div>
          </div>

          {result && (
            <div
              className={`text-center text-lg font-bold ${result.includes("Ganaste") ? "text-secondary" : "text-muted-foreground"}`}
            >
              {result}
            </div>
          )}

          <div className="flex gap-2">
            {!gameOver ? (
              <>
                <Button onClick={hit} className="flex-1">
                  Pedir
                </Button>
                <Button onClick={stand} variant="secondary" className="flex-1">
                  Plantarse
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setGameStarted(false)} className="flex-1">
                  Nueva ronda
                </Button>
                <Button onClick={onClose} variant="outline">
                  Cerrar
                </Button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
