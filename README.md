<div align="center">

# 🐾 NekoFit

Tu espacio personal para organizar **alimentación, entrenamientos, progreso, compras y outfits** desde una sola aplicación web.

NekoFit combina una interfaz retro en tonos verdes y amarillos con registros rápidos, almacenamiento local e integraciones nutricionales y deportivas protegidas mediante el servidor de Next.js.

[![Next.js](https://img.shields.io/badge/Next.js-16.3-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Image_API-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

</div>

---

##  Funcionalidades

- **Dashboard diario:** calorías consumidas y restantes, macros, agua y pasos.
- **Alimentación:** registro de comidas, búsqueda de alimentos, porciones, macros y objetivos editables.
- **Calendario de comidas:** planificación semanal conectada con el diario y el dashboard.
- **Recetas:** colección meal prep, búsqueda, filtros, favoritos y macros por porción.
- **Entrenamientos:** rutinas divididas en warm up, entrenamiento principal, abdomen, cardio y cooldown.
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

---

##  Variables de entorno

```env
WORKOUTX_API_KEY=
USDA_API_KEY=
SPOONACULAR_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

| Variable | Uso |
| --- | --- |
| `WORKOUTX_API_KEY` | Catálogo e imágenes de ejercicios. |
| `USDA_API_KEY` | Alimentos, nutrientes y medidas disponibles. |
| `SPOONACULAR_API_KEY` | Recetas y datos nutricionales. |
| `CLOUDINARY_CLOUD_NAME` | Identificador de la cuenta de Cloudinary. |
| `CLOUDINARY_API_KEY` | Identificador público utilizado en subidas firmadas. |
| `CLOUDINARY_API_SECRET` | Firma privada para subir y eliminar imágenes. |

Estas variables no utilizan el prefijo `NEXT_PUBLIC_`. Las claves se leen únicamente dentro de los Route Handlers de Next.js y no se incluyen en el JavaScript enviado al navegador.

Cuando una API nutricional o deportiva no está configurada, NekoFit utiliza una colección local de respaldo. Cloudinary sí es necesario para subir fotografías personales al armario.

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

Los registros personales se guardan inicialmente en **IndexedDB**. `localStorage` se utiliza para preferencias, favoritos y caché de consultas.

---


##  Responsive y accesibilidad

- Diseño adaptable para escritorio, tablet y móvil.
- Navegación accesible mediante teclado.
- Estados de foco visibles.
- Animaciones reducidas cuando el sistema utiliza `prefers-reduced-motion`.
- Cursores personalizados solo en dispositivos que admiten un puntero preciso.

---

## 🌱 Estado del proyecto

NekoFit está diseñado inicialmente para una sola usuaria y guarda la información personal en su navegador. La sincronización entre dispositivos y Apple Health forman parte de una fase futura.

---

<div align="center">

Hecho con cariño por [Vianka Castro](https://github.com/Vann06) 🐾

</div>
