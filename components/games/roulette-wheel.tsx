"use client"

import { motion, useAnimation, PanInfo, useMotionValue, useTransform } from "framer-motion"
import { forwardRef, useImperativeHandle, useEffect, useRef, useState,} from "react";
import { EUROPEAN_WHEEL, getNumberColor, RouletteResult } from "@/lib/roulette"



type RouletteWheelProps = {
  onSpinComplete?: (result: RouletteResult) => void
  spinning: boolean
  setSpinning: (spinning: boolean) => void
}

export const RouletteWheel = forwardRef( function RouletteWheel({ onSpinComplete, spinning, setSpinning }: RouletteWheelProps,
  ref
) {
  const controls = useAnimation()
  const [rotation, setRotation] = useState(0)
  const [result, setResult] = useState<number | null>(null)
  const wheelRef = useRef<HTMLDivElement>(null)
  
  // Configuración de la rueda
  const segments = EUROPEAN_WHEEL.length
  const segmentDegree = 360 / segments
  const degreesPerNumber = 360 / segments
  const spinDuration = 5 // Duración del giro en segundos
  
  // Exponer método spin() al padre
  useImperativeHandle(ref, () => ({
    spin: () => {
      if (!spinning) {
        spinWheel();
      }
    },
  }));
  
  // Inicializar la rueda
  useEffect(() => {
    // Asegurarse de que la rueda esté en la posición inicial
    controls.set({ rotate: rotation })
  }, [controls, rotation])
  
  // Función para girar la ruleta
  const spinWheel = () => {
    if (spinning) return
    
    setSpinning(true)
    setResult(null)
    
    // Número aleatorio para determinar el resultado
    const winningNumber = Math.floor(Math.random() * segments)
    const numberOnTop = EUROPEAN_WHEEL[winningNumber]
    
    // Calcular la rotación necesaria para que el número salga en la parte superior
    const targetRotation = 3600 + (360 - (winningNumber * segmentDegree))
    const newRotation = rotation + targetRotation
    
    // Animar la rueda
    controls.start({
      rotate: newRotation,
      transition: {
        duration: spinDuration,
        ease: [0.2, 0, 0, 1],
      },
    })
    
    // Establecer el resultado cuando termine la animación
    setTimeout(() => {
      setResult(numberOnTop)
      setSpinning(false)
      
      if (onSpinComplete) {
        onSpinComplete({
          number: numberOnTop,
          color: getNumberColor(numberOnTop),
          isEven: numberOnTop % 2 === 0 && numberOnTop !== 0,
          isLow: numberOnTop >= 1 && numberOnTop <= 18,
          dozen: numberOnTop === 0 ? 1 : Math.ceil(numberOnTop / 12) as 1 | 2 | 3,
          column: numberOnTop === 0 ? 1 : ((numberOnTop - 1) % 3 + 1) as 1 | 2 | 3,
        })
      }
    }, spinDuration * 1000)
    setRotation(newRotation % 360)
  }
  
  

  // Manejar el clic en el botón de girar
  /*const handleSpinClick = () => {
    if (!spinning) {
      spinWheel()
    }
  }*/
  
  // Renderizar los números en la rueda
  const renderWheelNumbers = () => {
    return EUROPEAN_WHEEL.map((number, index) => {
      // Calcular el ángulo del segmento actual
      const segmentAngle = index * segmentDegree - 95; // -90 para que el 0 esté arriba
      // Calcular el ángulo del centro del segmento
      const centerAngle = segmentAngle + (segmentDegree / 2);
      const radian = (centerAngle * Math.PI) / 180;
      
      // Posicionar los números más cerca del borde exterior de la rueda
      const radius = 180; // Ajustar según sea necesario
      const x = Math.cos(radian) * radius;
      const y = Math.sin(radian) * radius;
      
      const color = getNumberColor(number);
      
      return (
        <div
          key={index}
          className="absolute flex items-center justify-center font-bold text-xs rounded-full z-20"
          style={{
            left: `calc(50% + ${x}px)`,
            top: `calc(50% + ${y}px)`,
            transform: 'translate(-50%, -50%)',
            width: "24px",
            height: "24px",
            backgroundColor: color === "red" ? "#EF4444" : color === "black" ? "#1F2937" : "#10B981",
            color: "white",
            textAlign: 'center',
            lineHeight: '24px',
            fontSize: '10px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
          }}
        >
          {number}
        </div>
      )
  })}
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-96 h-96 md:w-[450px] md:h-[450px] mb-8">
        {/* Rueda exterior */}
        <div className="absolute inset-0 rounded-full border-8 border-gray-300" />
        
        {/* Indicador de giro (flecha fija) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30">
          <div
            className="
                     w-0 h-0 
                     border-l-[12px] border-l-transparent
                     border-r-[12px] border-r-transparent
                     border-b-[20px] border-b-yellow-400
                     drop-shadow-md"
          />
        </div>

        {/* Rueda giratoria */}
        <motion.div
          ref={wheelRef}
          className="absolute inset-2 rounded-full bg-gray-200 overflow-hidden"
          animate={controls}
        >
          {/* Segmentos de la rueda */}
          <div className="absolute inset-0">
            {EUROPEAN_WHEEL.map((number, index) => {
              const color = getNumberColor(number)
              const rotation = (index * segmentDegree) - 354

              return (
                <div
                  key={index}
                  className="absolute"
                  style={{
                    width: "40%",
                    height: "50%",
                    left: "50%",
                    top: "50%",
                    transformOrigin: "50% 100%",
                    transform: `translate(-50%, -100%) rotate(${rotation}deg)`,
                    backgroundColor:
                      color === "red"
                        ? "#EF4444"
                        : color === "black"
                          ? "#1F2937"
                          : "#10B981",
                    clipPath: `polygon(25% 0%, 50% 0%, 50% 100%)`,
                  }}
                />
              )
            })}
          </div>

          
          {/* Números de la rueda */}
          <div className="absolute inset-0">
            {renderWheelNumbers()}
          </div>
          
          {/* Centro de la rueda */}
          <div className="absolute top-1/2 left-1/2 w-16 h-16 -ml-8 -mt-8 bg-white rounded-full border-4 border-gray-300 z-10" />
          
        </motion.div>
        
        {/* Indicador de ganador */}
       { /*{result !== null && (
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg font-bold">
            Número: {result} - {getNumberColor(result) === 'red' ? 'Rojo' : getNumberColor(result) === 'black' ? 'Negro' : 'Verde'}
          </div>
        )}*/}
      </div>
      
      {/* Botón de girar */}
     {/* <button
        onClick={handleSpinClick}
        disabled={spinning}
        className={`px-8 py-3 text-lg font-bold text-white rounded-full ${
          spinning ? 'bg-gray-500' : 'bg-red-600 hover:bg-red-700'
        } transition-colors duration-200`}
      >
        {spinning ? 'Girando...' : 'Girar Ruleta'}
      </button>*/}
    </div>
  );
});
