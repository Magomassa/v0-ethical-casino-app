"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { RouletteWheel } from "./roulette-wheel"
import { RouletteBetTable } from "./roulette-bet-table"
import { Bet, RouletteResult, calculatePayout, getNumberColor } from "@/lib/roulette"

type RouletteGameProps = {
  currentTokens: number
  onGameEnd: (tokensWon: number) => void
  onClose: () => void
}

export function RouletteGame({ currentTokens, onGameEnd, onClose }: RouletteGameProps) {
  const [bets, setBets] = useState<Bet[]>([])
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<RouletteResult | null>(null)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  
  const wheelRef = useRef<any>(null);

  const [lastResult, setLastResult] = useState<any>(null);

  const handleResult = (result: any) => {
    setLastResult(result);
  };
  
  // Calcular el total apostado
  const totalBet = bets.reduce((sum, bet) => sum + bet.amount, 0)
  
  // Agregar una apuesta
  const handleBetPlaced = useCallback((bet: Bet) => {
    // Verificar si el jugador tiene suficientes fichas
    if (currentTokens < (totalBet + bet.amount)) {
      setMessage({ text: "No tienes suficientes fichas para realizar esta apuesta", type: 'error' })
      return
    }
    
    setBets(prevBets => [...prevBets, bet])
  }, [currentTokens, totalBet])
  
  // Eliminar una apuesta
  const handleBetRemoved = useCallback((betId: string) => {
    setBets(prevBets => {
      const index = prevBets.findIndex(bet => bet.id === betId)
      if (index === -1) return prevBets
      
      const newBets = [...prevBets]
      newBets.splice(index, 1)
      return newBets
    })
  }, [])
  
  // Girar la ruleta
  const spinWheel = useCallback(() => {
    if (bets.length === 0) {
      setMessage({ text: "Debes realizar al menos una apuesta", type: 'error' })
      return
    }
    
    if (spinning) return
    
    setSpinning(true)
    setMessage(null)
  }, [bets.length, spinning])
  
  // Manejar el resultado del giro
  const handleSpinComplete = useCallback((result: RouletteResult) => {
    setResult(result)
    
    // Calcular ganancias
    const winnings = calculatePayout(bets, result)
    const netWinnings = winnings - totalBet
    
    // Mostrar mensaje
    if (netWinnings > 0) {
      setMessage({ 
        text: `¡Ganaste ${netWinnings} fichas! Número: ${result.number} (${result.color})`, 
        type: 'success' 
      })
    } else if (netWinnings < 0) {
      setMessage({ 
        text: `Perdiste ${Math.abs(netWinnings)} fichas. Número: ${result.number} (${result.color})`, 
        type: 'error' 
      })
    } else {
      setMessage({ 
        text: `Empate. Número: ${result.number} (${result.color})`, 
        type: 'success' 
      })
    }
    
    // Actualizar el saldo
    onGameEnd(netWinnings)
    
    // Limpiar apuestas después de un breve retraso
    setTimeout(() => {
      setBets([])
    }, 3000)
  }, [bets, onGameEnd, totalBet])
  
  // Limpiar el mensaje después de 5 segundos
  useEffect(() => {
    if (!message) return
    
    const timer = setTimeout(() => {
      setMessage(null)
    }, 5000)
    
    return () => clearTimeout(timer)
  }, [message])
  
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Ruleta Europea</h1>
        <div className="flex items-center gap-4">
          <div className="bg-gray-100 px-4 py-2 rounded-lg">
            <span className="text-sm text-gray-600">Tus fichas:</span>
            <span className="ml-2 font-bold text-lg">{currentTokens}</span>
          </div>
          <Button onClick={onClose} variant="outline">
            Cerrar
          </Button>
        </div>
      </div>
      
      {/* Mensaje de estado */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-3 rounded-lg mb-6 text-white ${
              message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Rueda de la ruleta */}
        <div className="flex flex-col items-center">
          <RouletteWheel 
			ref={wheelRef}
            onSpinComplete={handleSpinComplete} 
            spinning={spinning}
            setSpinning={setSpinning}
          />
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 mb-2">Apuesta total: <span className="font-bold">{totalBet}</span> fichas</p>
            <button
				className={`px-8 py-4 text-xl font-bold text-white rounded-xl transition
				${spinning ? "bg-gray-500" : "bg-red-600 hover:bg-red-700"}`}
				disabled={spinning}
				onClick={() => wheelRef.current?.spin()}
				>
				{spinning ? "Girando..." : "Girar ruleta"}
			</button>
          </div>
        </div>
        
        {/* Tapete de apuestas */}
        <div className="overflow-auto max-h-[calc(100vh-200px)]">
          <RouletteBetTable 
            onBetPlaced={handleBetPlaced}
            onBetRemoved={handleBetRemoved}
            currentBets={bets}
            spinning={spinning}
            result={result}
          />
        </div>
      </div>
    </div>
  )
}
