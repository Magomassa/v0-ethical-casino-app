import { render, screen } from "@testing-library/react"

import { Footer } from "@/components/footer"

describe("Footer", () => {
  it("muestra el enlace de Términos y Condiciones", () => {
    render(<Footer />)
    expect(screen.getByText("Términos y Condiciones")).toBeInTheDocument()
  })
})
