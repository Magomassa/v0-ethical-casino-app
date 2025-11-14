import { cn } from "@/lib/utils"
import { motion, HTMLMotionProps } from "framer-motion"
import { forwardRef } from "react"

interface ChipProps extends Omit<HTMLMotionProps<"div">, 'onClick'> {
  value: number
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  selected?: boolean
}

export const Chip = forwardRef<HTMLDivElement, ChipProps>(({ 
  value, 
  size = 'md', 
  className, 
  onClick, 
  selected = false,
  ...props 
}, ref) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
  }[size]

  const colorClasses = {
    1: 'bg-blue-500 border-blue-700',
    5: 'bg-red-500 border-red-700',
    10: 'bg-yellow-500 border-yellow-700',
    25: 'bg-green-500 border-green-700',
    50: 'bg-purple-500 border-purple-700',
    100: 'bg-black border-gray-700 text-white',
    500: 'bg-orange-500 border-orange-700',
    1000: 'bg-pink-500 border-pink-700',
  }[value] || 'bg-gray-500 border-gray-700'

  return (
    <motion.div
      ref={ref}
      className={cn(
        'rounded-full border-2 flex items-center justify-center font-bold cursor-pointer select-none',
        'shadow-md hover:shadow-lg transition-all duration-200',
        'relative overflow-hidden',
        sizeClasses,
        colorClasses,
        selected && 'ring-2 ring-offset-2 ring-white',
        className
      )}
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-3/4 h-3/4 rounded-full bg-white/20" />
      </div>
      <span className="relative z-10">{value}</span>
      {selected && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white" />
      )}
    </motion.div>
  )
})

Chip.displayName = 'Chip'

interface ChipStackProps {
  value: number
  count?: number
}

export function ChipStack({ value, count = 1 }: ChipStackProps) {
  if (count <= 0) return null
  
  return (
    <div className="relative">
      {Array.from({ length: Math.min(count, 5) }).map((_, index) => (
        <motion.div
          key={index}
          className="absolute"
          style={{
            transform: `translate(${index * 2}px, ${-index * 2}px)`,
            zIndex: index,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Chip 
            value={value} 
            size={index === 0 ? 'md' : 'sm'} 
            className={index > 0 ? 'opacity-80' : ''}
          />
        </motion.div>
      ))}
      {count > 5 && (
        <div className="absolute -bottom-2 -right-2 bg-black/80 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center z-10">
          +{count - 5}
        </div>
      )}
    </div>
  )
}
