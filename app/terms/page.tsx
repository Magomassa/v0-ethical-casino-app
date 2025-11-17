import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function TermsPage() {
  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Términos y Condiciones de Uso</CardTitle>
          <p className="text-center text-muted-foreground">Última actualización: Noviembre 2025</p>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[70vh] pr-4">
            <div className="space-y-6 text-sm text-muted-foreground">
              
              <section>
                <h3 className="text-lg font-semibold text-foreground mb-2">1. Naturaleza del Servicio</h3>
                <p>
                  MotivaPlay es una plataforma de gamificación corporativa diseñada exclusivamente para fines recreativos y motivacionales dentro de la empresa.
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Sin Valor Monetario:</strong> Las "fichas" o "tokens" son unidades virtuales sin valor económico real. No pueden ser canjeadas por dinero en efectivo, ni transferidas a terceros fuera de la plataforma.</li>
                  <li><strong>Independencia Laboral:</strong> La participación en MotivaPlay es voluntaria. El desempeño en los juegos o la cantidad de fichas acumuladas <strong>no influye</strong> en las evaluaciones formales de desempeño laboral, promociones o revisiones salariales.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-foreground mb-2">2. Política de Privacidad y Datos</h3>
                <p>Nos comprometemos a proteger tu información:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Uso de Datos:</strong> Los datos generados por tu actividad se utilizan únicamente para calcular puntajes, rankings y entregar premios.</li>
                  <li><strong>Anonimización:</strong> Los datos utilizados para reportes estadísticos globales de la empresa son anonimizados.</li>
                  <li><strong>Retención:</strong> Los registros de juego detallados se conservan por un máximo de 12 meses. Posteriormente, se eliminan o se agregan en estadísticas anónimas.</li>
                  <li><strong>Consentimiento:</strong> Al usar la plataforma, aceptas que tus logros (no tu actividad detallada) sean visibles en los rankings públicos de la empresa.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-foreground mb-2">3. Juego Responsable y Bienestar</h3>
                <p>Promovemos un entorno digital saludable:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Límites:</strong> El sistema impone límites automáticos de tiempo de juego y cantidad máxima de partidas diarias para evitar la distracción laboral.</li>
                  <li><strong>Recordatorios:</strong> La interfaz mostrará avisos periódicos sugiriendo pausas activas.</li>
                  <li><strong>Auditorías:</strong> Un comité de bienestar independiente (RRHH) audita periódicamente el sistema para asegurar que no fomente comportamientos compulsivos.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-foreground mb-2">4. Transparencia Algorítmica e IA</h3>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Probabilidades:</strong> Los resultados de los juegos de azar (Slots, Ruleta) se generan mediante algoritmos matemáticos estándar (RNG) con probabilidades fijas. No están manipulados para favorecer o perjudicar a usuarios específicos.</li>
                  <li><strong>Inteligencia Artificial:</strong> El "MotivaAI" utiliza algoritmos automatizados para sugerir misiones o enviar mensajes motivacionales basados en tu progreso, pero no toma decisiones sobre premios ni sanciones.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-foreground mb-2">5. Reglas de Conducta y Premios</h3>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Anti-Trampas:</strong> El uso de bots, scripts o la explotación de errores del sistema resultará en la suspensión de la cuenta y la pérdida de fichas.</li>
                  <li><strong>Premios:</strong> El catálogo de premios está sujeto a disponibilidad y puede ser modificado por la empresa sin previo aviso.</li>
                  <li><strong>Cese Laboral:</strong> En caso de finalización de la relación laboral (renuncia o despido), las fichas no canjeadas se perderán automáticamente y no serán compensadas.</li>
                </ul>
              </section>

            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
