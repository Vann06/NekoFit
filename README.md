# NekoFit

Aplicación personal construida con Next.js, TypeScript y App Router para organizar alimentación, entrenamientos, progreso, compras y outfits.

## Desarrollo local

1. Instala las dependencias:

   ```powershell
   npm install
   ```

2. Crea el archivo local de variables de entorno desde la raíz del proyecto:

   ```powershell
   Copy-Item .env.example .env.local
   ```

3. Abre `.env.local` y agrega únicamente las claves que ya tengas:

   ```env
   WORKOUTX_API_KEY=tu_clave_nueva
   USDA_API_KEY=tu_clave_de_fooddata_central
   SPOONACULAR_API_KEY=tu_clave_de_spoonacular
   ```

   La variable no utiliza `NEXT_PUBLIC_` porque debe permanecer solamente en el servidor.

4. Inicia Next.js:

   ```powershell
   npm run dev
   ```

5. Abre `http://localhost:3000`.

## Cómo funciona WorkoutX

El navegador consulta `/api/exercises`. La Route Handler de Next.js lee `WORKOUTX_API_KEY` y solicita los ejercicios a WorkoutX usando el encabezado privado `X-WorkoutX-Key`. La clave nunca se envía al navegador.

Si la API todavía no está configurada o no responde, NekoFit utiliza temporalmente el catálogo de respaldo.

## Alimentos y recetas

- `USDA_API_KEY` alimenta `/api/foods`. USDA FoodData Central aporta alimentos generales y empacados, calorías, macros y las medidas disponibles para cada resultado.
- `SPOONACULAR_API_KEY` alimenta `/api/recipes`. NekoFit solicita preparaciones sencillas de hasta 40 minutos, con al menos 25 g de proteína y sin recetas fritas en la colección final.
- Open Food Facts no necesita llave para consultas de lectura y quedará como complemento para códigos de barras y productos empacados.

El navegador nunca consulta estas APIs con una clave visible. Los componentes llaman a Route Handlers de Next.js y Vercel ejecuta esas rutas en el servidor.

## Publicar en Vercel

1. Sube el proyecto a un repositorio de GitHub.
2. En Vercel selecciona **Add New → Project**.
3. Importa el repositorio de NekoFit.
4. Conserva el preset **Next.js** y los comandos detectados automáticamente.
5. En **Environment Variables**, agrega `WORKOUTX_API_KEY`, `USDA_API_KEY` y `SPOONACULAR_API_KEY` para Production, Preview y Development.
6. Selecciona **Deploy**.

Cada nuevo push a la rama principal creará un deployment de producción. Las demás ramas podrán generar previews independientes.

## Comprobaciones

```powershell
npm run lint
npm run typecheck
npm run build
```
