import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: ".next_dev2",
  // Next 16 ya no soporta la clave eslint aquí
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Fijar el root para evitar que Turbopack detecte otra carpeta por el lockfile
  turbopack: {
    root: __dirname,
  },
}

export default nextConfig
