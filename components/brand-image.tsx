"use client"

import React, { useRef } from "react"

type BrandImageProps = {
  name: "pnglogo" | "pngtitulo"
  alt: string
  className?: string
  style?: React.CSSProperties
}

// Intenta PNG y, si falla carga placeholder
export function BrandImage({ name, alt, className, style }: BrandImageProps) {
  const imagePath = `/${name}.png`
  const placeholder = "/placeholder-logo.png"

  return (
    <img
      src={imagePath}
      alt={alt}
      className={className}
      style={style}
      onError={(e) => {
        // Si falla la carga, usar placeholder
        e.currentTarget.src = placeholder
      }}
    />
  )
}