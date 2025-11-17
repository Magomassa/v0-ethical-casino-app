"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

// Configuración de la ruleta americana (0, 00, 1-36)
const rouletteNumbers = [
  0, 28, 9, 26, 30, 11, 7, 20, 32, 17, 5, 22, 34, 15, 3, 24, 36, 13, 1, "00", 27, 10, 25, 29, 12, 8, 19, 31, 18, 6, 21,
  33, 16, 4, 23, 35, 14, 2,
]

const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]
const blackNumbers = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35]
const POINTER_ANGLE = -90

// Layout del tablero (3 columnas x 12 filas)
const tableLayout = [
  [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
  [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
  [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34],
]

// Sonidos locales
const sounds = {
  spin: "/sounds/spin.mp3",
  win: "/sounds/win.mp3",
  lose: "/sounds/lose.mp3",
  ballRoll: "/sounds/ballRoll.mp3",
}

type BetType =
  | { type: "color"; value: "red" | "black"; payout: 2 }
  | { type: "parity"; value: "even" | "odd"; payout: 2 }
  | { type: "range"; value: "1-18" | "19-36"; payout: 2 }
  | { type: "dozen"; value: "1st" | "2nd" | "3rd"; payout: 3 }
  | { type: "column"; value: 1 | 2 | 3; payout: 3 }
  | { type: "number"; value: number | "00"; payout: 36 }

export function RouletteGame({
  currentTokens,
  onGameEnd,
  onClose,
}: {
  currentTokens: number
  onGameEnd: (tokensWon: number) => void
  onClose: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [rotation, setRotation] = useState(0)
  const [ballRotation, setBallRotation] = useState(POINTER_ANGLE)
  const [spinning, setSpinning] = useState(false)
  const [bet, setBet] = useState(10)
  const [selectedBets, setSelectedBets] = useState<BetType[]>([])
  const [message, setMessage] = useState("")
  const [result, setResult] = useState<number | "00" | null>(null)
  const [history, setHistory] = useState<(number | "00")[]>([])
  const [tokens, setTokens] = useState(currentTokens)

  // Fichas rápidas
  const chipValues = [1, 5, 10, 25, 100]
  const [selectedChip, setSelectedChip] = useState<number | null>(10)

  const selectChip = (value: number) => {
    setSelectedChip(value)
    setBet(value)
  }

  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({})
  const [audioUnlocked, setAudioUnlocked] = useState(false)

  // Actualizar tokens cuando cambia currentTokens
  useEffect(() => {
    setTokens(currentTokens)
  }, [currentTokens])

  // Desbloquear audio en la primera interacción
  const unlockAudio = async () => {
    if (audioUnlocked) return
    try {
      const audios = Object.values(audioRefs.current)
      await Promise.all(
        audios.map(async (a) => {
          a.muted = true
          await a.play().catch(() => {})
          a.pause()
          a.currentTime = 0
          a.muted = false
        })
      )
    } catch {}
    setAudioUnlocked(true)
  }

  // Inicializar audios
  useEffect(() => {
    Object.entries(sounds).forEach(([key, url]) => {
      if (url) {
        const audio = new Audio()
        audio.src = url
        audio.preload = "auto"
        audio.crossOrigin = "anonymous"
        audioRefs.current[key] = audio
      }
    })
    const handler = () => {
      unlockAudio()
      window.removeEventListener("pointerdown", handler)
      window.removeEventListener("keydown", handler)
    }
    window.addEventListener("pointerdown", handler)
    window.addEventListener("keydown", handler)
    return () => {
      window.removeEventListener("pointerdown", handler)
      window.removeEventListener("keydown", handler)
    }
  }, [])

  const playSound = (key: string) => {
    try {
      if (!audioUnlocked) unlockAudio()
      const audio = audioRefs.current[key]
      if (!audio) {
        return
      }
      audio.currentTime = 0
      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn(`Audio play warning for ${key}:`, error.message)
        })
      }
    } catch (err) {
      console.warn(`Audio error for ${key}:`, err)
    }
  }

  // Dibujar ruleta
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    const displayWidth = canvas.clientWidth || 280
    const displayHeight = canvas.clientHeight || 280
    canvas.width = Math.floor(displayWidth * dpr)
    canvas.height = Math.floor(displayHeight * dpr)
    canvas.style.width = `${displayWidth}px`
    canvas.style.height = `${displayHeight}px`

    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const centerX = displayWidth / 2
    const centerY = displayHeight / 2
    const desiredRadius = Math.min(displayWidth, displayHeight) / 2 - 18
    const radius = Math.max(40, desiredRadius)

    ctx.clearRect(0, 0, displayWidth, displayHeight)

    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.translate(-centerX, -centerY)

    ctx.beginPath()
    ctx.arc(centerX, centerY, radius + 10, 0, Math.PI * 2)
    ctx.fillStyle = "#1a1a1a"
    ctx.fill()
    ctx.strokeStyle = "#ffd700"
    ctx.lineWidth = 3
    ctx.stroke()

    const angleStep = (Math.PI * 2) / rouletteNumbers.length
    rouletteNumbers.forEach((num, i) => {
      const angle = i * angleStep - Math.PI / 2
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, angle - angleStep / 2, angle + angleStep / 2)
      ctx.closePath()

      if (num === 0 || num === "00") {
        ctx.fillStyle = "#0a5f0a"
      } else if (redNumbers.includes(num as number)) {
        ctx.fillStyle = "#c41e3a"
      } else {
        ctx.fillStyle = "#1a1a1a"
      }
      ctx.fill()
      ctx.strokeStyle = "#ffd700"
      ctx.lineWidth = 1.5
      ctx.stroke()

      ctx.fillStyle = "white"
      const fontSize = Math.max(8, Math.floor(Math.min(displayWidth, displayHeight) / 14))
      ctx.font = `bold ${fontSize}px Arial`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(num.toString(), x, y)
    })

    ctx.beginPath()
    ctx.arc(centerX, centerY, 14, 0, Math.PI * 2)
    ctx.fillStyle = "#ffd700"
    ctx.fill()

    ctx.restore()

    if (spinning) {
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate((ballRotation * Math.PI) / 180)

      const ballDistance = radius - 10
      ctx.beginPath()
      ctx.arc(ballDistance, 0, 5, 0, Math.PI * 2)
      ctx.fillStyle = "white"
      ctx.fill()
      ctx.strokeStyle = "#333"
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.restore()
    }

    ctx.beginPath()
    ctx.moveTo(centerX, 16)
    ctx.lineTo(centerX - 7, 32)
    ctx.lineTo(centerX + 7, 32)
    ctx.closePath()
    ctx.fillStyle = "#ffd700"
    ctx.fill()
  }, [rotation, ballRotation, spinning])

  const checkWin = (numberRes: number | "00", betItem: BetType): boolean => {
    if (betItem.type === "number") return numberRes === betItem.value
    if (betItem.type === "color") {
      if (numberRes === 0 || numberRes === "00") return false
      return redNumbers.includes(numberRes as number) === (betItem.value === "red")
    }
    if (betItem.type === "parity") {
      if (numberRes === 0 || numberRes === "00") return false
      return ((numberRes as number) % 2 === 0) === (betItem.value === "even")
    }
    if (betItem.type === "range") {
      if (numberRes === 0 || numberRes === "00") return false
      return ((numberRes as number) >= 1 && (numberRes as number) <= 18) === (betItem.value === "1-18")
    }
    if (betItem.type === "dozen") {
      if (numberRes === 0 || numberRes === "00") return false
      if (betItem.value === "1st") return (numberRes as number) >= 1 && (numberRes as number) <= 12
      if (betItem.value === "2nd") return (numberRes as number) >= 13 && (numberRes as number) <= 24
      if (betItem.value === "3rd") return (numberRes as number) >= 25 && (numberRes as number) <= 36
      return false
    }
    if (betItem.type === "column") {
      if (numberRes === 0 || numberRes === "00") return false
      return tableLayout[betItem.value - 1].includes(numberRes as number)
    }
    return false
  }

  const spin = () => {
    if (selectedBets.length === 0 || bet * selectedBets.length > tokens || bet < 1) return

    setSpinning(true)
    setMessage("")
    setResult(null)

    playSound("spin")
    playSound("ballRoll")

    const spinDuration = 4000
    const startTime = Date.now()
    const startRotation = rotation
    const totalRotation = 360 * 5 + Math.random() * 360
    const extraBallTurns = 6 + Math.floor(Math.random() * 3)
    const totalBallRotation = 360 * extraBallTurns

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / spinDuration, 1)
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      const ballEase = 1 - Math.pow(1 - progress, 1.8)

      const currentRotation = startRotation + totalRotation * easeProgress
      setRotation(currentRotation)
      setBallRotation(POINTER_ANGLE - totalBallRotation * (1 - ballEase))

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        const finalRotation = (startRotation + totalRotation) % 360
        const segmentAngle = 360 / rouletteNumbers.length
        const normalizedRotation = ((finalRotation % 360) + 360) % 360
        const normalizedAngle = (360 - normalizedRotation) % 360
        const index = Math.floor(normalizedAngle / segmentAngle) % rouletteNumbers.length
        const winningNumber = rouletteNumbers[index] as number | "00"
        setBallRotation(POINTER_ANGLE)

        setResult(winningNumber)
        setHistory((h) => [winningNumber, ...h.slice(0, 7)])
        setSpinning(false)

        let totalWin = 0
        let wonBets = 0

        selectedBets.forEach((betType) => {
          if (checkWin(winningNumber, betType)) {
            totalWin += bet * betType.payout
            wonBets++
          }
        })

        const totalBetAmount = bet * selectedBets.length

        if (totalWin > 0) {
          playSound("win")
          const netWin = totalWin - totalBetAmount
          setTokens((t) => t + netWin)
          setMessage(`🎉 ¡GANASTE! ${winningNumber}. ${wonBets}/${selectedBets.length} apuestas. +${netWin}`)
          onGameEnd(netWin)
        } else {
          playSound("lose")
          setTokens((t) => t - totalBetAmount)
          setMessage(`😔 Salió ${winningNumber}. -${totalBetAmount} fichas`)
          onGameEnd(-totalBetAmount)
        }

        setSelectedBets([])
      }
    }

    requestAnimationFrame(animate)
  }

  // helper para comprobar si un número está entre las apuestas seleccionadas
  const isNumberSelected = (n: number) => selectedBets.some((b) => b.type === "number" && b.value === n)

  return (
    <div className="roulette-root flex flex-col items-center justify-start gap-3 w-full min-h-screen p-2 sm:p-4 overflow-y-auto">
      {/* Panel superior con fichas del jugador */}
      <div className="roulette-top-panel w-full bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-md p-2 text-center">
        <div className="text-xs font-semibold text-gray-900">FICHAS DISPONIBLES</div>
        <div className="text-lg md:text-xl font-bold text-gray-900">{tokens}</div>
      </div>

      {/* Contenedor principal: ruleta + tablero */}
      <div className="flex w-full max-w-6xl flex-col gap-3 px-1 sm:px-2">
        <div className="flex flex-col gap-3 w-full lg:flex-row">
          {/* RULETA */}
          <div className="roulette-wheel-panel w-full lg:max-w-[26rem] flex flex-col items-center gap-4 p-4 rounded-2xl">
            <div className="roulette-wheel-inner">
              <canvas ref={canvasRef} className="rounded-full" />
            </div>

            {/* Resultado */}
            <div className="roulette-result-badge text-sm font-bold text-gray-900 bg-green-800 px-3 py-1 rounded">
              {result ?? "-"}
            </div>
          </div>

          {/* TABLERO */}
          <div className="flex-1 flex flex-col gap-2 overflow-visible mt-3 lg:mt-0 w-full">
            {/* Botones de apuestas externas */}
            <Card className="roulette-board-card p-1 border-yellow-600 w-full">
              <div className="grid grid-cols-3 gap-1 text-[11px]">
                <button
                  onClick={() =>
                    setSelectedBets(
                      selectedBets.some((b) => b.type === "color" && b.value === "red")
                        ? selectedBets.filter((b) => !(b.type === "color" && b.value === "red"))
                        : [...selectedBets, { type: "color", value: "red", payout: 2 }]
                    )
                  }
                  disabled={spinning}
                  className={`w-full py-1 rounded-sm font-bold bg-red-600 text-white ${selectedBets.some((b) => b.type === "color" && b.value === "red") ? "ring-2 ring-yellow-300" : ""}`}
                >
                  Rojo
                </button>
                <button
                  onClick={() =>
                    setSelectedBets(
                      selectedBets.some((b) => b.type === "color" && b.value === "black")
                        ? selectedBets.filter((b) => !(b.type === "color" && b.value === "black"))
                        : [...selectedBets, { type: "color", value: "black", payout: 2 }]
                    )
                  }
                  disabled={spinning}
                  className={`w-full py-1 rounded-sm font-bold bg-black text-white ${selectedBets.some((b) => b.type === "color" && b.value === "black") ? "ring-2 ring-yellow-300" : ""}`}
                >
                  Negro
                </button>
                <div className="w-full grid grid-cols-2 gap-1">
                  <button
                    onClick={() =>
                      setSelectedBets(
                        selectedBets.some((b) => b.type === "parity" && b.value === "even")
                          ? selectedBets.filter((b) => !(b.type === "parity" && b.value === "even"))
                          : [...selectedBets, { type: "parity", value: "even", payout: 2 }]
                      )
                    }
                    disabled={spinning}
                    className="text-[10px] py-1 rounded-sm bg-green-800 text-white"
                  >
                    Par
                  </button>
                  <button
                    onClick={() =>
                      setSelectedBets(
                        selectedBets.some((b) => b.type === "parity" && b.value === "odd")
                          ? selectedBets.filter((b) => !(b.type === "parity" && b.value === "odd"))
                          : [...selectedBets, { type: "parity", value: "odd", payout: 2 }]
                      )
                    }
                    disabled={spinning}
                    className="text-[10px] py-1 rounded-sm bg-green-800 text-white"
                  >
                    Impar
                  </button>
                </div>
              </div>
            </Card>

            {/* Números del tablero */}
            <Card className="roulette-board-card mt-1 p-1 border-yellow-600 flex-1">
              <div className="roulette-board-grid grid grid-cols-3 gap-0.5 text-[10px] h-full">
                {[1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34].map((num) => {
                  const isSelected = isNumberSelected(num)
                  const isWinner = result === num
                  const baseColor = isWinner ? "bg-yellow-400 text-black" : redNumbers.includes(num) ? "bg-red-600 text-white" : "bg-black text-white"
                  return (
                    <button
                      key={num}
                      onClick={() =>
                        setSelectedBets(
                          isSelected
                            ? selectedBets.filter((b) => !(b.type === "number" && b.value === num))
                            : [...selectedBets, { type: "number", value: num, payout: 36 }]
                        )
                      }
                      disabled={spinning}
                      className={`h-6 rounded-sm font-semibold transition-all duration-150 ${baseColor} ${isSelected ? "roulette-number-selected" : ""} ${isWinner ? "animate-pulse" : ""}`}
                    >
                      {num}
                    </button>
                  )
                })}

                {[2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35].map((num) => {
                  const isSelected = isNumberSelected(num)
                  const isWinner = result === num
                  const baseColor = isWinner ? "bg-yellow-400 text-black" : redNumbers.includes(num) ? "bg-red-600 text-white" : "bg-black text-white"
                  return (
                    <button
                      key={num}
                      onClick={() =>
                        setSelectedBets(
                          isSelected
                            ? selectedBets.filter((b) => !(b.type === "number" && b.value === num))
                            : [...selectedBets, { type: "number", value: num, payout: 36 }]
                        )
                      }
                      disabled={spinning}
                      className={`h-6 rounded-sm font-semibold transition-all duration-150 ${baseColor} ${isSelected ? "roulette-number-selected" : ""} ${isWinner ? "animate-pulse" : ""}`}
                    >
                      {num}
                    </button>
                  )
                })}

                {[3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36].map((num) => {
                  const isSelected = isNumberSelected(num)
                  const isWinner = result === num
                  const baseColor = isWinner ? "bg-yellow-400 text-black" : redNumbers.includes(num) ? "bg-red-600 text-white" : "bg-black text-white"
                  return (
                    <button
                      key={num}
                      onClick={() =>
                        setSelectedBets(
                          isSelected
                            ? selectedBets.filter((b) => !(b.type === "number" && b.value === num))
                            : [...selectedBets, { type: "number", value: num, payout: 36 }]
                        )
                      }
                      disabled={spinning}
                      className={`h-6 rounded-sm font-semibold transition-all duration-150 ${baseColor} ${isSelected ? "roulette-number-selected" : ""} ${isWinner ? "animate-pulse" : ""}`}
                    >
                      {num}
                    </button>
                  )
                })}
              </div>
            </Card>

            {/* Mensaje e historial debajo del tablero */}
            {message && <div className="text-xs text-center text-white font-bold bg-green-800 p-1 rounded">{message}</div>}
            {history.length > 0 && (
              <div className="text-xs bg-green-800 p-1 rounded text-white">
                <strong>Últimos:</strong> {history.join(", ")}
              </div>
            )}
          </div>
        </div>

        {/* Franja inferior: fichas rápidas + controles */}
        <div className="mt-1 w-full flex flex-col gap-2">
          {/* Fichas rápidas */}
          <div className="roulette-chips-row flex flex-wrap gap-1 justify-center">
            {chipValues.map((v) => (
              <button
                key={v}
                onClick={() => selectChip(v)}
                disabled={spinning}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm ${
                  selectedChip === v ? "ring-2 ring-white" : ""
                } ${v === 1 ? "bg-gray-600" : v === 5 ? "bg-green-600" : v === 10 ? "bg-yellow-500" : v === 25 ? "bg-red-500" : "bg-purple-600"}`}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Controles */}
          <div className="w-full flex items-center gap-2">
            <Input
              type="number"
              min="1"
              value={bet}
              onChange={(e) => setBet(Math.max(1, parseInt(e.target.value) || 0))}
              disabled={spinning}
              className="bg-green-800 text-white text-sm w-28"
              placeholder="Apuesta"
            />
            <button
              onClick={spin}
              disabled={spinning || selectedBets.length === 0 || bet * selectedBets.length > tokens}
              className="flex-1 text-sm py-1 rounded-md bg-yellow-600 hover:bg-yellow-700 text-black font-bold disabled:opacity-50"
            >
              {spinning ? "Girando..." : "GIRAR"}
            </button>
            <Button onClick={onClose} variant="outline" className="w-20 text-sm">
              Salir
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
