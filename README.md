![MotivaPlay banner](public/icon.svg)

# MotivaPlay – Casino Ético Corporativo

Aplicación web construida con **Next.js 16** y **shadcn/ui** para gamificar la motivación interna de equipos corporativos. El proyecto ofrece experiencias de juego recreativas con fichas sin valor monetario, paneles de misión, rankings sociales y gestión de premios.

Incluye roles diferenciados para **Administradores** (gestión) y **Empleados** (juego), junto con una página formal de Términos y Condiciones.

![Deployed on Vercel](https://v0-ethical-casino-app.vercel.app/)

## Características principales

- **Roles de Usuario:** Dashboards diferenciados para Empleados (Juegos, Misiones, Social) y Administradores (Gestión de Usuarios, Premios y Auditoría).
- **Juegos Integrados:** Slots, Blackjack y Ruleta totalmente funcionales.
- **Sistema de Economía:** Gestión de fichas (tokens), transacciones y canje de premios.
- **Next.js App Router:** Soporte SSR/ISR y fuentes personalizadas.
- **UI Moderna:** Componentes de shadcn/ui (cards, toasts, dialogs).
- **Legal & Ética:** Página de Términos (`/terms`) y Footer global.
- **Backend:** Integración completa con **Firebase** (Auth & Firestore).
- **Testing:** Configuración de pruebas unitarias con Jest y React Testing Library.

## Requisitos previos

- Node.js >= 18.18
- pnpm >= 8 (Gestor de paquetes recomendado)
- Cuenta en Firebase (para autenticación y base de datos)

## Instalación

```bash
# 1. Clonar el repositorio
git clone [https://github.com/Magomassa/v0-ethical-casino-app.git](https://github.com/Magomassa/v0-ethical-casino-app.git)
cd v0-ethical-casino-app

# 2. Instalar dependencias
pnpm install

# Alternativa usando npm (no recomendado para despliegue Vercel)
npm install
```

## Variables de entorno

Crea un archivo `.env.local` en la raíz con los valores necesarios para Firebase, Supabase o cualquier servicio adicional. Ejemplo:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=tucodigo...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tuproyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tuproyecto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tuproyecto.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

Consulta los archivos en `lib/` o `hooks/` para conocer los env vars que requiere cada integración.

## Uso

```bash
# Modo desarrollo
pnpm dev
# o npm run dev

# Build de producción
pnpm build && pnpm start
```

Una vez arranque el servidor de desarrollo, visita **http://localhost:3000**. Para ver la nueva página de políticas navega a **http://localhost:3000/terms**.

### Scripts útiles

| Script        | Descripción                                      |
| ------------- | ------------------------------------------------ |
| `pnpm dev`    | Inicia el servidor Next.js con Turbopack.        |
| `pnpm build`  | Compila el proyecto para producción.             |
| `pnpm start`  | Sirve la build generada.                         |
| `pnpm lint`   | Ejecuta ESLint sobre todo el código fuente.      |
| `pnpm test`   | Ejecuta las pruebas unitarias (Jest).             |

## Despliegue

El proyecto está configurado para desplegarse en **Vercel**. Una vez pushes a `main`, Vercel detecta los cambios, instala dependencias usando `pnpm`, ejecuta `pnpm build` y publica automáticamente.

Para evitar errores `ERR_PNPM_OUTDATED_LOCKFILE`, siempre sincroniza `pnpm-lock.yaml` antes de hacer push:

```bash
pnpm install
git add pnpm-lock.yaml
git commit -m "chore: update pnpm lock"
git push origin main
```
Nota: Si encuentras errores de lockfile en Vercel, asegúrate de no subir pnpm-lock.yaml o configurar el comando de instalación como pnpm install --no-frozen-lockfile.

## Estructura destacada

```
app/
  admin/              # Rutas protegidas de administrador
  api/                # API Routes (Backend serverless)
  terms/              # Página pública de términos
components/
  games/              # Lógica de juegos (Slots, Blackjack, etc.)
  social/             # Paneles de amigos y rankings
  ui/                 # Componentes reutilizables (shadcn)
lib/
  firebase/           # Configuración y lógica de BD
__tests__/            # Pruebas unitarias (Jest)
```

## Contribuir

1. Crea una rama (`git checkout -b feature/nueva-funcionalidad`).
2. Realiza los cambios, corre `pnpm lint`/`pnpm build` para validar.
3. Haz commit y push.
4. Crea un Pull Request describiendo la mejora.

## Licencia

Este proyecto se distribuye bajo la licencia MIT. Consulta el archivo `LICENSE` (si corresponde) o verifica las condiciones en tu organización antes de usarlo en producción.
