"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Coins, CircleDollarSign } from "lucide-react"

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
    setPlayerHand([deck[0], deck[2]])
    setDealerHand([deck[1], deck[3]])
    setGameStarted(true)
    setResult("")
    setGameOver(false)
  }

  const hit = () => {
    const deck = createDeck()
    const newHand = [...playerHand, deck[0]]
    setPlayerHand(newHand)
    if (calculateScore(newHand) > 21) endGame(newHand, dealerHand)
  }

  const stand = () => {
    const newDealerHand = [...dealerHand]
    const deck = createDeck()
    let deckIndex = 0
    while (calculateScore(newDealerHand) < 17) newDealerHand.push(deck[deckIndex++])
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

  const renderCard = (card: Card, index: number, total: number) => (
    <div
      key={index}
      className={`w-20 h-28 bg-white rounded-lg shadow-md flex flex-col items-center justify-between p-2 relative ${
        card.suit === "♥" || card.suit === "♦" ? "text-red-500" : "text-black"
      }`}
      style={{
        marginLeft: index > 0 ? "-1rem" : "0",
        zIndex: total - index,
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
      }}
    >
      <div className="text-left w-full text-lg font-bold">
        {card.value}
        {card.suit}
      </div>
      <div className="text-4xl">{card.suit}</div>
      <div className="absolute bottom-1 right-1 w-6 h-6 bg-black text-white text-xs rounded-full flex items-center justify-center">
        {card.value}
      </div>
    </div>
  )

  return (
    <div className="h-full bg-gradient-to-br from-green-800 to-green-900 p-4 md:p-6 text-white flex items-center justify-center">
      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
        {/* MAIN GAME AREA */}
        <div className="flex flex-col justify-center">
          {/* Dealer */}
          <div className="bg-black/30 rounded-xl p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Dealer</h2>
              <div className="bg-black/50 px-3 py-1 rounded-full text-sm font-mono">
                {calculateScore(dealerHand)} pts
              </div>
            </div>
            <div className="flex flex-wrap gap-2 min-h-32 items-center justify-center">
              {dealerHand.map((card, i) =>
                !gameOver && i === 1 ? (
                  <div
                    key={i}
                    className="w-20 h-28 bg-gradient-to-br from-red-700 to-red-900 rounded-lg flex items-center justify-center"
                  >
                    <div className="w-10 h-14 bg-white/20 rounded"></div>
                  </div>
                ) : (
                  renderCard(card, i, dealerHand.length)
                )
              )}
            </div>
          </div>

          {/* Player */}
          <div className="bg-black/30 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Jugador</h2>
              <div className="bg-black/50 px-3 py-1 rounded-full text-sm font-mono">
                {calculateScore(playerHand)} pts
              </div>
            </div>
            <div className="flex flex-wrap gap-2 min-h-32 items-center justify-center">
              {playerHand.map((card, i) => renderCard(card, i, playerHand.length))}
            </div>
          </div>
        </div>

        {/* SIDE PANEL (Apuesta + Controles) */}
        <div className="flex flex-col space-y-6">
          {/* Apuesta y saldo */}
          <div className="bg-black/30 p-4 rounded-xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-blue-500 p-3 rounded-full">
                <Coins className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-300">Apuesta</p>
                <p className="text-xl font-bold">{bet} fichas</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="bg-white p-3 rounded-full">
                <CircleDollarSign className="h-6 w-6 text-green-800" />
              </div>
              <div>
                <p className="text-sm text-gray-300">Saldo</p>
                <p className="text-xl font-bold">{currentTokens} fichas</p>
              </div>
            </div>
          </div>

          {/* Controles del juego */}
          <div className="bg-black/30 p-4 rounded-xl flex flex-col gap-3">
            {!gameStarted ? (
              <div className="space-y-4 w-full">
                <div className="flex flex-col items-center">
                  <Label className="text-sm mb-2">Apuesta (fichas)</Label>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full"
                  style={{
                    background: 'linear-gradient(to bottom, #1c4e1b8c, #132e0f90)',
                    border: '2px solid rgba(45, 146, 41, 0.6)',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
                  }}
                  >

                    <button
                      onClick={() => setBet(b => Math.max(1, b - 1))}
                      disabled={bet <= 1}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold disabled:opacity-50"
                      style={{
                      background: 'linear-gradient(to bottom, #3d5a7f, #2d4a6b)',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                    }}
                    >
                      −
                    </button>
                    <div className="w-24 text-center">
                      <Input
                        type="number"
                        min="1"
                        max={currentTokens}
                        value={bet}
                        onChange={(e) => setBet(Math.min(currentTokens, Math.max(1, Number(e.target.value) || 1)))}
                        className="border-0 text-white text-center text-lg h-12 appearance-none [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden [appearance:textfield]"
                      />
                    </div>
                    <button
                      onClick={() => setBet(b => Math.min(currentTokens, b + 1))}
                      disabled={bet >= currentTokens}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold disabled:opacity-50"
                      style={{
                      background: 'linear-gradient(to bottom, #3d5a7f, #2d4a6b)',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                    }}
                    >
                      +
                    </button>
                  </div>
                  <Button
                    onClick={() => setBet(currentTokens)}
                    variant="outline"
                    size="sm"
                    className="mt-2 text-xs h-8 px-3 text-white/80 hover:text-white bg-transparent hover:bg-white/10"
                  >
                    Máximo: {currentTokens}
                  </Button>
                </div>
                <Button
                  onClick={startGame}
                  disabled={bet > currentTokens || bet < 1}
                  className="w-full bg-green-600 hover:bg-green-700 py-6 text-lg"
                >
                  Apostar
                </Button>
              </div>
            ) : !gameOver ? (
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={hit} className="bg-red-600 hover:bg-red-700 py-6 text-lg">
                  Pedir
                </Button>
                <Button onClick={stand} className="bg-red-600 hover:bg-red-700 py-6 text-lg">
                  Plantarse
                </Button>
                <Button className="bg-yellow-600 hover:bg-yellow-700 py-6 text-lg">
                  Doblar
                </Button>
                <Button disabled className="bg-gray-800 text-gray-400 py-6 text-lg">
                  Dividir
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => setGameStarted(false)}
                  className="bg-blue-600 hover:bg-blue-700 py-6 text-lg"
                >
                  Nueva Ronda
                </Button>
                <Button onClick={onClose} variant="outline" className="py-6 text-lg bg-gray-800 hover:bg-gray-700 text-white hover:text-white border-gray-600">
                  Cerrar
                </Button>
              </div>
            )}
          </div>

          {/* Resultado */}
          {result && (
            <div
              className={`p-4 rounded-xl text-center ${
                result.includes("Ganaste") ? "bg-green-600/30" : "bg-red-600/30"
              }`}
            >
              <p className="font-bold text-lg">{result}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
