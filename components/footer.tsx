import Link from "next/link"

export function Footer() {
  return (
    <footer className="py-6 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-auto">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row px-4">
        <p className="text-sm text-muted-foreground text-center md:text-left">
          © 2025 MotivaPlay - Casino Ético Corporativo.
        </p>
        <nav className="flex gap-4 text-sm text-muted-foreground">
          <Link href="/terms" className="hover:underline hover:text-primary">
            Términos y Condiciones
          </Link>
          <a href="#" className="hover:underline hover:text-primary">
            Soporte
          </a>
        </nav>
      </div>
    </footer>
  )
}
