<div align="center">

# 🐾 NekoFit

Tu espacio personal para organizar **alimentación, entrenamientos, progreso, compras y outfits** desde una sola aplicación web.

NekoFit combina una interfaz retro en tonos verdes y amarillos con registros rápidos, almacenamiento local e integraciones nutricionales y deportivas protegidas mediante el servidor de Next.js.

[![Next.js](https://img.shields.io/badge/Next.js-16.3-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_%26_Postgres-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Image_API-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

</div>

---

##  Funcionalidades

- **Dashboard diario:** calorías consumidas y restantes, macros, agua y pasos.
- **Alimentación:** registro de comidas, búsqueda de alimentos, porciones, macros y objetivos editables.
- **Calendario de comidas:** planificación semanal conectada con el diario y el dashboard.
- **Recetas:** colección meal prep, búsqueda, filtros, favoritos y macros por porción.
- **Entrenamientos:** planes semanales de 7 días, sets planificados/reales, multimedia, checks, timer e historial inmutable.
- **Cuenta y sincronización:** acceso con Google, sesiones SSR y datos privados protegidos mediante RLS en Supabase.
- **PWA instalable:** ícono propio, modo standalone, actualización automática de recursos y pantalla offline segura.
- **Progreso:** peso, grasa corporal, masa muscular, agua y medidas corporales.
- **Lista de compras:** productos, cantidades, categorías y estados de compra.
- **Armario:** carruseles de prendas, combinaciones aleatorias y fotografías procesadas con Cloudinary.

---

##  Tecnologías y herramientas

<div align="center">

### Frontend

[![Next.js](https://img.shields.io/badge/Next.js-App_Router-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/docs/app)
[![React](https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![CSS Modules](https://img.shields.io/badge/CSS-Modules-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://github.com/css-modules/css-modules)

### Datos e integraciones

[![IndexedDB](https://img.shields.io/badge/IndexedDB-Local_Data-F6DD78?style=for-the-badge&logoColor=24452E)](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
[![USDA](https://img.shields.io/badge/USDA-FoodData_Central-2E7D32?style=for-the-badge)](https://fdc.nal.usda.gov/api-guide)
[![Spoonacular](https://img.shields.io/badge/Spoonacular-Recipes-8F6BB3?style=for-the-badge)](https://spoonacular.com/food-api)
[![WorkoutX](https://img.shields.io/badge/WorkoutX-Exercises-C9E66B?style=for-the-badge)](https://workoutxapp.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Wardrobe_Images-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)

</div>

---

##  Desarrollo local

### Requisitos

- Node.js 20.9 o superior.
- npm.
- Claves de API para habilitar las integraciones externas.

### Instalación

```bash
git clone https://github.com/Vann06/NekoFit.git
cd NekoFit
npm install
```

Copia el ejemplo de variables de entorno:

```powershell
Copy-Item .env.example .env.local
```

En macOS o Linux puedes utilizar:

```bash
cp .env.example .env.local
```

Inicia el servidor de desarrollo:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

### Instalar como app

- En iPhone o iPad: abre NekoFit en Safari, toca **Compartir** y luego **Agregar a pantalla de inicio**.
- En Android o un navegador de escritorio compatible: utiliza **Instalar app** desde el menú del navegador.

El service worker se registra únicamente en producción. Para probar la instalación localmente, ejecuta `npm run build` y después `npm run start`; el sitio usa el manifest de `/manifest.webmanifest` y conserva las sesiones mediante las cookies seguras de Supabase. La caché PWA solo guarda recursos estáticos y la pantalla offline, nunca páginas autenticadas ni respuestas privadas.

---

##  Variables de entorno

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
WORKOUTX_API_KEY=
USDA_API_KEY=
SPOONACULAR_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

| Variable | Uso |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL pública del proyecto Supabase. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave publishable pública; RLS controla el acceso real a los datos. |
| `WORKOUTX_API_KEY` | Catálogo e imágenes de ejercicios. |
| `USDA_API_KEY` | Alimentos, nutrientes y medidas disponibles. |
| `SPOONACULAR_API_KEY` | Recetas y datos nutricionales. |
| `CLOUDINARY_CLOUD_NAME` | Identificador de la cuenta de Cloudinary. |
| `CLOUDINARY_API_KEY` | Identificador público utilizado en subidas firmadas. |
| `CLOUDINARY_API_SECRET` | Firma privada para subir y eliminar imágenes. |

Solo las dos variables públicas de Supabase utilizan `NEXT_PUBLIC_`, tal como requiere su cliente web. Las demás claves se leen únicamente dentro de los Route Handlers de Next.js y no se incluyen en el JavaScript enviado al navegador.

Cuando una API nutricional o deportiva no está configurada, NekoFit utiliza una colección local de respaldo. Cloudinary sí es necesario para subir fotografías personales al armario.

### Configuración de Supabase y Google

1. Ejecuta, en orden, los archivos de `supabase/migrations/` desde SQL Editor. Si `0001_initial_schema.sql` ya estaba aplicado, ejecuta únicamente `0002_workout_session_snapshot_hardening.sql`.
2. En Supabase Authentication > URL Configuration define `http://localhost:3000` como Site URL local y agrega estas Redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://neko-fit.vercel.app/auth/callback`
3. En Google Cloud conserva como Authorized redirect URI la URL de callback que muestra el proveedor Google de Supabase (`https://<project-ref>.supabase.co/auth/v1/callback`).
4. Configura las dos variables públicas de Supabase en `.env.local` y en Vercel para Production, Preview y Development. Nunca confirmes `.env.local` en Git.

El primer acceso crea `profiles` mediante un trigger sobre `auth.users`; el callback también hace un `upsert` defensivo. Las rutas internas se protegen tanto en `src/proxy.ts` como en el layout del tracker.

---

##  Comandos disponibles

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia Next.js en modo de desarrollo. |
| `npm run build` | Genera y valida la compilación de producción. |
| `npm run start` | Ejecuta localmente la compilación de producción. |
| `npm run lint` | Revisa la calidad y las reglas del código. |
| `npm run typecheck` | Comprueba los tipos de TypeScript sin generar archivos. |

---

## 📁 Arquitectura

El proyecto sigue una organización **feature-based**: cada funcionalidad contiene sus componentes, tipos, servicios, repositorios y utilidades.

```text
src/
├── app/
│   ├── (tracker)/        # Páginas del tracker personal
│   └── api/              # Route Handlers y proxies seguros
├── features/
│   ├── dashboard/
│   ├── nutrition/
│   ├── progress/
│   ├── recipes/
│   ├── shopping/
│   ├── wardrobe/
│   └── workouts/
└── shared/               # UI, hooks y utilidades compartidas
```

Supabase es la fuente principal del módulo de entrenamientos. IndexedDB conserva una caché offline y se importa una sola vez al iniciar sesión; la tabla `data_migrations` evita duplicados. Otros módulos locales se migrarán gradualmente con el mismo patrón.

---


##  Responsive y accesibilidad

- Diseño adaptable para escritorio, tablet y móvil.
- Navegación accesible mediante teclado.
- Estados de foco visibles.
- Animaciones reducidas cuando el sistema utiliza `prefers-reduced-motion`.
- Cursores personalizados solo en dispositivos que admiten un puntero preciso.

---

## 🌱 Estado del proyecto

NekoFit admite cuentas privadas y sincronización de entrenamientos entre dispositivos. La migración gradual del resto de módulos y Apple Health continúa como trabajo futuro.

---

<div align="center">

Hecho con cariño por [Vianka Castro](https://github.com/Vann06) 🐾

</div>
