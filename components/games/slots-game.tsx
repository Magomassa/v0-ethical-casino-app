"use client"

import { useState, useEffect } from "react"

const symbols = ["🍒", "🍋", "🍊", "🍇", "⭐", "💎", "🔔", "🍑"]

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
  const [leverPulled, setLeverPulled] = useState(false)

  const spin = () => {
    if (bet > currentTokens || bet < 1) return

    setSpinning(true)
    setResult("")
    setLeverPulled(true)

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
      } else if (finalReels[0] === finalReels[1] || finalReels[1] === finalReels[2] || finalReels[0] === finalReels[2]) {
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

  // Reset lever animation after it completes
  useEffect(() => {
    if (leverPulled) {
      const timer = setTimeout(() => setLeverPulled(false), 700)
      return () => clearTimeout(timer)
    }
  }, [leverPulled])

  return (
    <div className="space-y-6">
      {/* Slot Machine Container */}
      <div className="flex justify-center">
        <div className="relative w-full max-w-2xl">
          {/* Slot Machine Body */}
          <div 
            className="relative rounded-3xl shadow-2xl border-4 p-6"
            style={{
              backgroundColor: '#7B099A',
              borderColor: 'rgba(123, 9, 154, 0.7)',
            }}
          >
            {/* Top Lights */}
            <div className="flex justify-center gap-3 mb-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    spinning ? "bg-yellow-300 animate-pulse" : "bg-white/80"
                  } shadow-lg`}
                />
              ))}
            </div>

            {/* Screen and Lever Container */}
            <div className="relative flex items-center gap-4">
              {/* Machine Screen Area */}
              <div className="flex-1 relative bg-white rounded-2xl p-4 shadow-inner border-2 border-gray-300">
                {/* Reels Container */}
                <div className="flex justify-center gap-2">
                  {reels.map((symbol, i) => (
                    <div
                      key={i}
                      className="flex-1 aspect-square bg-gradient-to-b from-gray-100 to-gray-200 rounded-lg border-2 border-gray-400 flex items-center justify-center shadow-inner overflow-hidden"
                    >
                      <div
                        className={`text-6xl md:text-7xl transition-all duration-100 ${
                          spinning ? "animate-slot-spin blur-sm" : ""
                        }`}
                      >
                        {symbol}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lever - Positioned at the same height as the screen */}
              <div className="flex items-center justify-center">
                <div
                  className={`relative flex flex-col items-center ${leverPulled ? "animate-lever-pull" : ""
                    }`}
                  style={{
                    transformOrigin: "bottom center", // pivote realista
                  }}
                >
                  {/* Red Knob */}
                  <div
                    className="w-12 h-12 rounded-full mb-2 z-10"
                    style={{
                      background: "radial-gradient(circle at 30% 30%, #ff4444, #cc0000)",
                      boxShadow:
                        "0 4px 12px rgba(0, 0, 0, 0.4), inset -2px -2px 4px rgba(0, 0, 0, 0.3), inset 2px 2px 4px rgba(255, 255, 255, 0.2)",
                      border: "2px solid #990000",
                    }}
                  />
                  {/* Gray Shaft */}
                  <div
                    className="w-6 rounded-full"
                    style={{
                      height: "100px",
                      background:
                        "linear-gradient(to bottom, #e5e7eb, #d1d5db, #9ca3af)",
                      boxShadow:
                        "inset 0 2px 4px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1)",
                      border: "1px solid #9ca3af",
                    }}
                  />
                </div>
              </div>

            </div>

            {/* Coin Slot */}
            <div className="mt-4 bg-gray-300 h-2 rounded-full mx-8 shadow-inner" />

            {/* Result Display */}
            {result && (
              <div className="mt-4 text-center">
                <div
                  className={`inline-block px-4 py-2 rounded-lg font-bold text-sm ${
                    result.includes("GANASTE")
                      ? "bg-yellow-400 text-yellow-900 border-2 border-yellow-500 shadow-lg"
                      : result.includes("Par")
                      ? "bg-green-400 text-green-900 border-2 border-green-500 shadow-lg"
                      : "bg-gray-300 text-gray-800 border-2 border-gray-400"
                  }`}
                >
                  {result}
                </div>
              </div>
            )}

            {/* Control Panel - Integrated into machine */}
            <div 
              className="mt-6 rounded-2xl p-4"
              style={{
                background: 'linear-gradient(to bottom, #1e3a5f, #0f1f35)',
                boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.5), 0 4px 20px rgba(0, 0, 0, 0.3)',
                border: '2px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div className="flex items-center gap-3 flex-wrap">
                {/*Info Buttons */}
                <div className="flex gap-2">
                  <button
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                    style={{
                      background: 'linear-gradient(to bottom, #2d4a6b, #1e3a5f)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <span className="text-lg font-bold">i</span>
                  </button>
                </div>

                {/* Bet Control */}
                <div 
                  className="flex items-center gap-2 px-4 py-2 rounded-full"
                  style={{
                    background: 'linear-gradient(to bottom, #2d1b4e, #1a0f2e)',
                    border: '2px solid rgba(123, 9, 154, 0.5)',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <button
                    onClick={() => setBet((b) => Math.max(1, b - 1))}
                    disabled={spinning || bet <= 1}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(to bottom, #3d5a7f, #2d4a6b)',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    −
                  </button>
                  <div className="px-4 py-1 text-center min-w-[100px]">
                    <div className="text-xs text-pink-300/80 font-medium">BET</div>
                    <div className="text-lg font-bold text-pink-400">{bet}</div>
                  </div>
                  <button
                    onClick={() => setBet((b) => Math.min(currentTokens, b + 1))}
                    disabled={spinning || bet >= currentTokens}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(to bottom, #3d5a7f, #2d4a6b)',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    +
                  </button>
                </div>

                {/* MAX BET Button */}
                <button
                  onClick={() => setBet(Math.max(1, currentTokens))}
                  disabled={spinning}
                  className="px-4 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(to bottom, #3d5a7f, #2d4a6b)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  MAX BET
                </button>

                {/* SPIN Button */}
                <button
                  onClick={spin}
                  disabled={spinning || bet > currentTokens}
                  className="flex-1 px-6 py-3 rounded-xl text-white font-bold text-lg disabled:opacity-50 min-w-[120px]"
                  style={{
                    background: 'linear-gradient(to bottom, #22c55e, #16a34a)',
                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.2)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                  }}
                >
                  {spinning ? "GIRANDO..." : "SPIN"}
                </button>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                  style={{
                    background: 'linear-gradient(to bottom, #3d5a7f, #2d4a6b)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
