"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Chip } from "@/components/ui/chip"
import { Bet, BetType, getNumberColor, RouletteResult } from "@/lib/roulette"

type RouletteBetTableProps = {
  onBetPlaced: (bet: Bet) => void
  onBetRemoved: (betId: string) => void
  currentBets: Bet[]
  spinning: boolean
  result: RouletteResult | null
}

export function RouletteBetTable({ 
  onBetPlaced, 
  onBetRemoved, 
  currentBets, 
  spinning, 
  result 
}: RouletteBetTableProps) {
  const [selectedChip, setSelectedChip] = useState<number>(10)
  const chipValues = [1, 5, 10, 25, 50, 100, 500, 1000]
  
  // Colores para los números
  const getNumberBgColor = (number: number) => {
    if (number === 0) return 'bg-green-600 hover:bg-green-700'
    if ([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(number)) {
      return 'bg-red-600 hover:bg-red-700'
    }
    return 'bg-black hover:bg-gray-900'
  }
  
  // Manejar clic en un número
  const handleNumberClick = (number: number) => {
    if (spinning) return
    
    const bet: Bet = {
      id: `straight-${number}`,
      type: 'straight',
      numbers: [number],
      amount: selectedChip
    }
    
    onBetPlaced(bet)
  }
  
  // Manejar clic en una apuesta externa (rojo, negro, par, impar, etc.)
  const handleOutsideBetClick = (type: BetType, numbers: number[]) => {
    if (spinning) return
    
    const bet: Bet = {
      id: `${type}-${numbers.join('-')}`,
      type,
      numbers,
      amount: selectedChip
    }
    
    onBetPlaced(bet)
  }
  
  // Obtener el total apostado en una posición específica
  const getTotalBetOnPosition = (betId: string): number => {
    return currentBets
      .filter(bet => bet.id === betId)
      .reduce((total, bet) => total + bet.amount, 0)
  }
  
  // Verificar si un número es ganador
  const isWinningNumber = (number: number): boolean => {
    if (!result) return false
    return result.number === number
  }
  
  // Verificar si una apuesta externa es ganadora
  const isWinningBet = (type: BetType, numbers: number[]): boolean => {
    if (!result) return false
    
    switch (type) {
      case 'red':
        return result.color === 'red' && result.number !== 0
      case 'black':
        return result.color === 'black'
      case 'even':
        return result.isEven && result.number !== 0
      case 'odd':
        return !result.isEven
      case 'low':
        return result.isLow
      case 'high':
        return !result.isLow && result.number !== 0
      case 'dozen':
        return numbers.some(n => {
          if (n === 1) return result.number >= 1 && result.number <= 12
          if (n === 13) return result.number >= 13 && result.number <= 24
          return result.number >= 25 && result.number <= 36
        })
      case 'column':
        return numbers.some(n => (result.number - 1) % 3 === (n - 1) % 3)
      default:
        return false
    }
  }
  
  // Renderizar los números del 1 al 36 en la cuadrícula
  const renderNumberGrid = () => {
    const rows = []
    
    // Crear 3 filas de 12 números cada una
    for (let row = 0; row < 3; row++) {
      const cols = []
      
      // Cada fila tiene 12 columnas (para los números 1-36)
      for (let col = 1; col <= 12; col++) {
        const number = (row * 12) + col
        const totalBet = getTotalBetOnPosition(`straight-${number}`)
        const isWinner = isWinningNumber(number)
        
        cols.push(
          <div 
            key={number} 
            className={`relative flex items-center justify-center h-10 border border-gray-300 cursor-pointer transition-colors ${getNumberBgColor(number)}`}
            onClick={() => handleNumberClick(number)}
          >
            <span className="text-white font-bold">{number}</span>
            
            {/* Mostrar fichas apostadas */}
            {totalBet > 0 && (
              <div className="absolute -top-2 -right-2">
                <Chip value={totalBet} size="sm" />
              </div>
            )}
            
            {/* Resaltar número ganador */}
            {isWinner && (
              <div className="absolute inset-0 border-2 border-yellow-400 pointer-events-none" />
            )}
          </div>
        )
      }
      
      rows.push(
        <div key={row} className="grid grid-cols-12 gap-0.5">
          {cols}
        </div>
      )
    }
    
    return rows
  }
  
  // Renderizar apuestas externas (rojo, negro, par, impar, etc.)
  const renderOutsideBets = () => {
    const outsideBets = [
      { type: 'dozen', label: '1st 12', numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], className: 'bg-red-600 hover:bg-red-700' },
      { type: 'dozen', label: '2nd 12', numbers: [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24], className: 'bg-red-600 hover:bg-red-700' },
      { type: 'dozen', label: '3rd 12', numbers: [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36], className: 'bg-red-600 hover:bg-red-700' },
      { type: 'low', label: '1-18', numbers: Array.from({ length: 18 }, (_, i) => i + 1), className: 'bg-gray-800 hover:bg-gray-900' },
      { type: 'even', label: 'EVEN', numbers: Array.from({ length: 18 }, (_, i) => (i + 1) * 2), className: 'bg-gray-800 hover:bg-gray-900' },
      { type: 'red', label: 'RED', numbers: [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36], className: 'bg-red-600 hover:bg-red-700' },
      { type: 'black', label: 'BLACK', numbers: [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35], className: 'bg-black hover:bg-gray-900' },
      { type: 'odd', label: 'ODD', numbers: Array.from({ length: 18 }, (_, i) => i * 2 + 1), className: 'bg-gray-800 hover:bg-gray-900' },
      { type: 'high', label: '19-36', numbers: Array.from({ length: 18 }, (_, i) => i + 19), className: 'bg-gray-800 hover:bg-gray-900' },
    ]
    
    return (
      <div className="grid grid-cols-3 gap-1 mt-1">
        {outsideBets.map((bet, index) => {
          const totalBet = getTotalBetOnPosition(`${bet.type}-${bet.numbers.join('-')}`)
          const isWinner = isWinningBet(bet.type as BetType, bet.numbers)
          
          return (
            <div 
              key={index}
              className={`relative flex items-center justify-center h-10 border border-gray-300 cursor-pointer transition-colors ${bet.className} ${isWinner ? 'ring-2 ring-yellow-400' : ''}`}
              onClick={() => handleOutsideBetClick(bet.type as BetType, bet.numbers)}
            >
              <span className="text-white font-bold text-sm">{bet.label}</span>
              
              {/* Mostrar fichas apostadas */}
              {totalBet > 0 && (
                <div className="absolute -top-2 -right-2">
                  <Chip value={totalBet} size="sm" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }
  
  // Renderizar selector de fichas
  const renderChipSelector = () => {
    return (
      <div className="flex flex-wrap justify-center gap-2 p-2 bg-gray-100 rounded-lg mt-4">
        {chipValues.map((value) => (
          <div 
            key={value} 
            className={`cursor-pointer transition-transform ${selectedChip === value ? 'scale-110' : 'hover:scale-105'}`}
            onClick={() => setSelectedChip(value)}
          >
            <Chip value={value} selected={selectedChip === value} />
          </div>
        ))}
      </div>
    )
  }
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      {/* Mostrar número 0 */}
      <div className="mb-2">
        <div 
          className={`relative flex items-center justify-center h-10 w-full border border-gray-300 cursor-pointer transition-colors bg-green-600 hover:bg-green-700 ${isWinningNumber(0) ? 'ring-2 ring-yellow-400' : ''}`}
          onClick={() => handleNumberClick(0)}
        >
          <span className="text-white font-bold">0</span>
          
          {/* Mostrar fichas apostadas */}
          {getTotalBetOnPosition('straight-0') > 0 && (
            <div className="absolute -top-2 -right-2">
              <Chip value={getTotalBetOnPosition('straight-0')} size="sm" />
            </div>
          )}
        </div>
      </div>
      
      {/* Cuadrícula de números */}
      <div className="grid gap-0.5">
        {renderNumberGrid()}
      </div>
      
      {/* Apuestas externas */}
      {renderOutsideBets()}
      
      {/* Selector de fichas */}
      {renderChipSelector()}
      
      {/* Resumen de apuestas */}
      <div className="mt-4 p-3 bg-gray-100 rounded-lg">
        <h3 className="font-bold mb-2">Tus apuestas</h3>
        {currentBets.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay apuestas realizadas</p>
        ) : (
          <div className="space-y-2">
            {currentBets.map((bet) => (
              <div key={bet.id} className="flex justify-between items-center p-2 bg-white rounded border">
                <span className="text-sm">
                  {bet.type === 'straight' ? `Número ${bet.numbers[0]}` : 
                   bet.type === 'red' ? 'Rojo' : 
                   bet.type === 'black' ? 'Negro' : 
                   bet.type === 'even' ? 'Par' : 
                   bet.type === 'odd' ? 'Impar' : 
                   bet.type === 'low' ? '1-18' : 
                   bet.type === 'high' ? '19-36' : 
                   bet.type === 'dozen' ? `Docena ${bet.numbers[0] <= 12 ? '1' : bet.numbers[0] <= 24 ? '2' : '3'}` : 
                   bet.type}
                </span>
                <div className="flex items-center gap-2">
                  <Chip value={bet.amount} size="sm" />
                  <button 
                    className="text-red-500 hover:text-red-700"
                    onClick={(e) => {
                      e.stopPropagation()
                      onBetRemoved(bet.id)
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
