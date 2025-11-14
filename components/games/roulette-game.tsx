"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

// Configuración de la ruleta americana (0, 00, 1-36)
const rouletteNumbers = [
  0, 28, 9, 26, 30, 11, 7, 20, 32, 17, 5, 22, 34, 15, 3, 24, 36, 13, 1, "00", 27, 10, 25, 29, 12, 8, 19, 31, 18, 6, 21,
  33, 16, 4, 23, 35, 14, 2,
]

const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]
const blackNumbers = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35]

// Layout del tablero (3 columnas x 12 filas)
const tableLayout = [
  [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
  [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
  [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34],
]

// Sonidos desde CDN
const sounds = {
  spin: "https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3",
  win: "https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3",
  lose: "https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3",
  ballRoll: "https://assets.mixkit.co/active_storage/sfx/3007/3007-preview.mp3",
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
  const [bet, setBet] = useState(10)
  const [selectedBets, setSelectedBets] = useState<BetType[]>([])
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<number | "00" | null>(null)
  const [message, setMessage] = useState("")
  const [history, setHistory] = useState<(number | "00")[]>([])
  const [rotation, setRotation] = useState(0)
  const [ballRotation, setBallRotation] = useState(0)

  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({})

  // Inicializar audios
  useEffect(() => {
    Object.entries(sounds).forEach(([key, url]) => {
      const audio = new Audio(url)
      audio.preload = "auto"
      audioRefs.current[key] = audio
    })
  }, [])

  const playSound = (key: string) => {
    const audio = audioRefs.current[key]
    if (audio) {
      audio.currentTime = 0
      audio.play().catch(() => {}) // Ignore errors
    }
  }

  // Dibujar ruleta
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = 108

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Guardar estado y rotar
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.translate(-centerX, -centerY)

    // Dibujar fondo de la ruleta
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius + 10, 0, Math.PI * 2)
    ctx.fillStyle = "#1a1a1a"
    ctx.fill()
    ctx.strokeStyle = "#ffd700"
    ctx.lineWidth = 3
    ctx.stroke()

    // Dibujar números
    const angleStep = (Math.PI * 2) / rouletteNumbers.length
    rouletteNumbers.forEach((num, i) => {
      const angle = i * angleStep - Math.PI / 2
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius

      // Color del segmento
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

      // Número
      ctx.fillStyle = "white"
      ctx.font = "bold 10px Arial"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(num.toString(), x, y)
    })

    // Centro dorado
    ctx.beginPath()
    ctx.arc(centerX, centerY, 14, 0, Math.PI * 2)
    ctx.fillStyle = "#ffd700"
    ctx.fill()

    ctx.restore()

    // Dibujar pelotita
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

    // Marcador de resultado
    ctx.beginPath()
    ctx.moveTo(centerX, 16)
    ctx.lineTo(centerX - 7, 32)
    ctx.lineTo(centerX + 7, 32)
    ctx.closePath()
    ctx.fillStyle = "#ffd700"
    ctx.fill()
  }, [rotation, ballRotation, spinning])

  const addBet = (betType: BetType) => {
    if (selectedBets.some((b) => JSON.stringify(b) === JSON.stringify(betType))) {
      setSelectedBets(selectedBets.filter((b) => JSON.stringify(b) !== JSON.stringify(betType)))
    } else {
      setSelectedBets([...selectedBets, betType])
    }
  }

  const checkWin = (winningNumber: number | "00", betType: BetType): boolean => {
    if (betType.type === "number") return betType.value === winningNumber

    if (winningNumber === 0 || winningNumber === "00") return false

    const num = winningNumber as number

    switch (betType.type) {
      case "color":
        if (betType.value === "red") return redNumbers.includes(num)
        if (betType.value === "black") return blackNumbers.includes(num)
        return false

      case "parity":
        if (betType.value === "even") return num % 2 === 0
        if (betType.value === "odd") return num % 2 !== 0
        return false

      case "range":
        if (betType.value === "1-18") return num >= 1 && num <= 18
        if (betType.value === "19-36") return num >= 19 && num <= 36
        return false

      case "dozen":
        if (betType.value === "1st") return num >= 1 && num <= 12
        if (betType.value === "2nd") return num >= 13 && num <= 24
        if (betType.value === "3rd") return num >= 25 && num <= 36
        return false

      case "column":
        if (betType.value === 1) return num % 3 === 0
        if (betType.value === 2) return num % 3 === 2
        if (betType.value === 3) return num % 3 === 1
        return false
    }
  }

  const spin = () => {
    if (selectedBets.length === 0 || bet * selectedBets.length > currentTokens || bet < 1) return

    setSpinning(true)
    setMessage("")
    setResult(null)

    playSound("spin")
    playSound("ballRoll")

    // Animación
    const spinDuration = 4000
    const startTime = Date.now()
    const startRotation = rotation
    const startBallRotation = ballRotation
    const totalRotation = 360 * 5 + Math.random() * 360
    const totalBallRotation = -(360 * 7 + Math.random() * 360)

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / spinDuration, 1)

      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3)

      setRotation(startRotation + totalRotation * easeProgress)
      setBallRotation(startBallRotation + totalBallRotation * easeProgress)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        // Calcular resultado
        const finalRotation = (startRotation + totalRotation) % 360
        const segmentAngle = 360 / rouletteNumbers.length
        const normalizedAngle = (360 - finalRotation + 90) % 360
        const index = Math.floor(normalizedAngle / segmentAngle) % rouletteNumbers.length
        const winningNumber = rouletteNumbers[index] as number | "00"

        setResult(winningNumber)
        setHistory([winningNumber, ...history.slice(0, 7)])
        setSpinning(false)

        // Verificar apuestas
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
          setMessage(`🎉 ¡GANASTE! ${winningNumber}. ${wonBets}/${selectedBets.length} apuestas. +${netWin}`)
          onGameEnd(netWin)
        } else {
          playSound("lose")
          setMessage(`😔 Salió ${winningNumber}. -${totalBetAmount} fichas`)
          onGameEnd(-totalBetAmount)
        }

        setSelectedBets([])
      }
    }

    requestAnimationFrame(animate)
  }

  const getNumberColor = (num: number | "00") => {
    if (num === 0 || num === "00") return "bg-green-600"
    return redNumbers.includes(num as number) ? "bg-red-500" : "bg-gray-800"
  }

  const isBetSelected = (betType: BetType) => {
    return selectedBets.some((b) => JSON.stringify(b) === JSON.stringify(betType))
  }

  const totalBetAmount = bet * selectedBets.length
  const canSpin = selectedBets.length > 0 && totalBetAmount <= currentTokens && bet >= 1 && !spinning

  return (
    <div className="flex items-center justify-center gap-2 h-full w-full p-2 bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden">
      {/* Panel izquierdo - Ruleta e Historial */}
      <div className="flex flex-col items-center gap-1.5 shrink-0">
        {/* Ruleta */}
        <canvas
          ref={canvasRef}
          width={280}
          height={280}
          className="rounded-lg shadow-2xl bg-linear-to-br from-green-900 to-green-950"
        />

        {/* Resultado y mensaje compacto */}
        <div className="flex items-center gap-1.5 min-h-[40px]">
          {result !== null && (
            <div
              className={`${getNumberColor(result)} w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-lg`}
            >
              {result}
            </div>
          )}
          {message && (
            <div
              className={`text-[10px] font-bold max-w-[200px] ${message.includes("GANASTE") ? "text-yellow-400" : "text-gray-300"}`}
            >
              {message}
            </div>
          )}
        </div>

        {/* Historial compacto */}
        {history.length > 0 && (
          <div className="flex gap-1 flex-wrap justify-center max-w-[280px]">
            {history.map((num, i) => (
              <div
                key={i}
                className={`${getNumberColor(num)} w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-md`}
              >
                {num}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Panel derecho - Tablero de apuestas */}
      <div className="flex flex-col gap-1.5 h-full py-1 flex-shrink-0 max-h-screen overflow-hidden">
        {/* Header con fichas compacto */}
        <Card className="p-1.5 bg-slate-800 border-slate-700">
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1">
              <Label className="text-[10px] font-bold text-slate-200">Fichas:</Label>
              <div className="text-base font-bold text-yellow-400">{currentTokens}</div>
            </div>
            <div className="flex items-center gap-1">
              <Label className="text-[10px] text-slate-300">Apostar:</Label>
              <Input
                type="number"
                min="1"
                max={currentTokens}
                value={bet}
                onChange={(e) => setBet(Number.parseInt(e.target.value) || 1)}
                disabled={spinning}
                className="h-6 w-14 bg-slate-700 border-slate-600 text-white text-[10px]"
              />
            </div>
            <Button onClick={onClose} variant="outline" disabled={spinning} className="h-6 text-[10px] px-2 border-slate-600">
              Salir
            </Button>
          </div>
          <div className="text-center text-[9px] text-slate-400 mt-0.5">
            Total: <span className="font-bold text-yellow-400">{totalBetAmount}</span> ({selectedBets.length})
          </div>
        </Card>

        {/* Tablero tradicional compacto */}
        <Card className="p-1 bg-[#0a4d0a] border-yellow-700/50 flex-1 min-h-0 overflow-hidden">
          <div className="flex gap-0.5 h-full">
            {/* Zona de ceros */}
            <div className="flex flex-col gap-0.5 w-7">
              <button
                onClick={() => addBet({ type: "number", value: 0, payout: 36 })}
                disabled={spinning}
                className={`${getNumberColor(0)} flex-1 rounded text-white font-bold text-xs hover:opacity-80 transition-all ${
                  isBetSelected({ type: "number", value: 0, payout: 36 }) ? "ring-2 ring-yellow-400" : ""
                }`}
              >
                0
              </button>
              <button
                onClick={() => addBet({ type: "number", value: "00", payout: 36 })}
                disabled={spinning}
                className={`${getNumberColor("00")} flex-1 rounded text-white font-bold text-xs hover:opacity-80 transition-all ${
                  isBetSelected({ type: "number", value: "00", payout: 36 }) ? "ring-2 ring-yellow-400" : ""
                }`}
              >
                00
              </button>
            </div>

            {/* Grid de números */}
            <div className="flex-1 flex flex-col gap-0.5 min-h-0">
              {tableLayout.map((row, rowIdx) => (
                <div key={rowIdx} className="flex gap-0.5 flex-1 min-h-0">
                  {row.map((num) => (
                    <button
                      key={num}
                      onClick={() => addBet({ type: "number", value: num, payout: 36 })}
                      disabled={spinning}
                      className={`${getNumberColor(num)} flex-1 rounded text-white font-bold text-[9px] hover:opacity-80 transition-all ${
                        isBetSelected({ type: "number", value: num, payout: 36 }) ? "ring-2 ring-yellow-400" : ""
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              ))}

              {/* Docenas */}
              <div className="flex gap-0.5 h-7 mt-0.5">
                <button
                  onClick={() => addBet({ type: "dozen", value: "1st", payout: 3 })}
                  disabled={spinning}
                  className={`flex-1 bg-green-700 hover:bg-green-600 rounded text-white text-[9px] font-bold transition-all ${
                    isBetSelected({ type: "dozen", value: "1st", payout: 3 }) ? "ring-2 ring-yellow-400" : ""
                  }`}
                >
                  1-12
                </button>
                <button
                  onClick={() => addBet({ type: "dozen", value: "2nd", payout: 3 })}
                  disabled={spinning}
                  className={`flex-1 bg-green-700 hover:bg-green-600 rounded text-white text-[9px] font-bold transition-all ${
                    isBetSelected({ type: "dozen", value: "2nd", payout: 3 }) ? "ring-2 ring-yellow-400" : ""
                  }`}
                >
                  13-24
                </button>
                <button
                  onClick={() => addBet({ type: "dozen", value: "3rd", payout: 3 })}
                  disabled={spinning}
                  className={`flex-1 bg-green-700 hover:bg-green-600 rounded text-white text-[9px] font-bold transition-all ${
                    isBetSelected({ type: "dozen", value: "3rd", payout: 3 }) ? "ring-2 ring-yellow-400" : ""
                  }`}
                >
                  25-36
                </button>
              </div>

              {/* Apuestas externas */}
              <div className="grid grid-cols-3 gap-0.5 mt-0.5">
                <button
                  onClick={() => addBet({ type: "range", value: "1-18", payout: 2 })}
                  disabled={spinning}
                  className={`h-7 bg-green-700 hover:bg-green-600 rounded text-white text-[9px] font-bold transition-all ${
                    isBetSelected({ type: "range", value: "1-18", payout: 2 }) ? "ring-2 ring-yellow-400" : ""
                  }`}
                >
                  1-18
                </button>
                <button
                  onClick={() => addBet({ type: "parity", value: "even", payout: 2 })}
                  disabled={spinning}
                  className={`h-7 bg-green-700 hover:bg-green-600 rounded text-white text-[9px] font-bold transition-all ${
                    isBetSelected({ type: "parity", value: "even", payout: 2 }) ? "ring-2 ring-yellow-400" : ""
                  }`}
                >
                  PAR
                </button>
                <button
                  onClick={() => addBet({ type: "color", value: "red", payout: 2 })}
                  disabled={spinning}
                  className={`h-7 bg-red-600 hover:bg-red-500 rounded text-white text-[9px] font-bold transition-all ${
                    isBetSelected({ type: "color", value: "red", payout: 2 }) ? "ring-2 ring-yellow-400" : ""
                  }`}
                >
                  ROJO
                </button>
                <button
                  onClick={() => addBet({ type: "color", value: "black", payout: 2 })}
                  disabled={spinning}
                  className={`h-7 bg-gray-800 hover:bg-gray-700 rounded text-white text-[9px] font-bold transition-all ${
                    isBetSelected({ type: "color", value: "black", payout: 2 }) ? "ring-2 ring-yellow-400" : ""
                  }`}
                >
                  NEGRO
                </button>
                <button
                  onClick={() => addBet({ type: "parity", value: "odd", payout: 2 })}
                  disabled={spinning}
                  className={`h-7 bg-green-700 hover:bg-green-600 rounded text-white text-[9px] font-bold transition-all ${
                    isBetSelected({ type: "parity", value: "odd", payout: 2 }) ? "ring-2 ring-yellow-400" : ""
                  }`}
                >
                  IMPAR
                </button>
                <button
                  onClick={() => addBet({ type: "range", value: "19-36", payout: 2 })}
                  disabled={spinning}
                  className={`h-7 bg-green-700 hover:bg-green-600 rounded text-white text-[9px] font-bold transition-all ${
                    isBetSelected({ type: "range", value: "19-36", payout: 2 }) ? "ring-2 ring-yellow-400" : ""
                  }`}
                >
                  19-36
                </button>
              </div>
            </div>

            {/* Columnas */}
            <div className="flex flex-col gap-0.5 w-7">
              <button
                onClick={() => addBet({ type: "column", value: 1, payout: 3 })}
                disabled={spinning}
                className={`flex-1 bg-green-700 hover:bg-green-600 rounded text-white text-[9px] font-bold transition-all ${
                  isBetSelected({ type: "column", value: 1, payout: 3 }) ? "ring-2 ring-yellow-400" : ""
                }`}
              >
                2:1
              </button>
              <button
                onClick={() => addBet({ type: "column", value: 2, payout: 3 })}
                disabled={spinning}
                className={`flex-1 bg-green-700 hover:bg-green-600 rounded text-white text-[9px] font-bold transition-all ${
                  isBetSelected({ type: "column", value: 2, payout: 3 }) ? "ring-2 ring-yellow-400" : ""
                }`}
              >
                2:1
              </button>
              <button
                onClick={() => addBet({ type: "column", value: 3, payout: 3 })}
                disabled={spinning}
                className={`flex-1 bg-green-700 hover:bg-green-600 rounded text-white text-[9px] font-bold transition-all ${
                  isBetSelected({ type: "column", value: 3, payout: 3 }) ? "ring-2 ring-yellow-400" : ""
                }`}
              >
                2:1
              </button>
            </div>
          </div>
        </Card>

        {/* Botón girar */}
        <Button
          onClick={spin}
          disabled={!canSpin}
          className="h-8 text-xs font-bold bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white shadow-lg"
        >
          {spinning ? "🎰 GIRANDO..." : `🎲 GIRAR RULETA`}
        </Button>

        {totalBetAmount > currentTokens && (
          <p className="text-center text-[9px] text-red-400 font-bold">⚠️ No tienes suficientes fichas</p>
        )}
      </div>
    </div>
  )
}
