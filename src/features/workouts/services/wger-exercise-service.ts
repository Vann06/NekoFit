import { localExerciseCatalog } from "../data/workout-options";
import type { ExerciseCatalogItem } from "../types/workout";

type WgerTranslation = { language?: number; name?: string; description?: string };
type WgerImage = { image?: string; is_main?: boolean; thumbnails?: { small?: string; medium?: string } };
type WgerVideo = { video?: string };
type WgerNamedValue = { name?: string; name_en?: string };
type WgerExercise = {
  id: number;
  category?: WgerNamedValue;
  muscles?: WgerNamedValue[];
  muscles_secondary?: WgerNamedValue[];
  equipment?: WgerNamedValue[];
  translations?: WgerTranslation[];
  images?: WgerImage[];
  videos?: WgerVideo[];
  license?: { short_name?: string };
  license_author?: string;
};
type WgerResponse = { results?: WgerExercise[] };
type CachedCatalog = { expiresAt: number; exercises: ExerciseCatalogItem[] };

const cacheKey = "nekofit-wger-catalog-v1";
const cacheDuration = 24 * 60 * 60 * 1000;

function stripHtml(value = "") {
  return value
    .replace(/<li>/gi, " • ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function mapWgerExercise(item: WgerExercise): ExerciseCatalogItem | null {
  const translation = item.translations?.find((entry) => entry.language === 4)
    ?? item.translations?.find((entry) => entry.language === 2)
    ?? item.translations?.[0];
  if (!translation?.name) return null;
  const mainImage = item.images?.find((image) => image.is_main) ?? item.images?.[0];
  const muscles = [...(item.muscles ?? []), ...(item.muscles_secondary ?? [])]
    .map((muscle) => muscle.name_en || muscle.name || "")
    .filter(Boolean);
  return {
    id: `wger-${item.id}`,
    name: translation.name,
    description: stripHtml(translation.description) || "Consulta la demostración y mantén el movimiento bajo control.",
    category: item.category?.name ?? "Ejercicio",
    muscles: [...new Set(muscles)],
    equipment: (item.equipment ?? []).map((equipment) => equipment.name ?? "").filter(Boolean),
    imageUrl: mainImage?.thumbnails?.medium ?? mainImage?.image,
    videoUrl: item.videos?.[0]?.video,
    source: "wger",
    attribution: `${item.license?.short_name ?? "CC"}${item.license_author ? ` · ${item.license_author}` : ""}`,
  };
}

function readCache() {
  try {
    const value = window.localStorage.getItem(cacheKey);
    if (!value) return null;
    const cached = JSON.parse(value) as CachedCatalog;
    return cached.expiresAt > Date.now() ? cached.exercises : null;
  } catch {
    return null;
  }
}

function writeCache(exercises: ExerciseCatalogItem[]) {
  try {
    window.localStorage.setItem(cacheKey, JSON.stringify({ expiresAt: Date.now() + cacheDuration, exercises } satisfies CachedCatalog));
  } catch {
    // La biblioteca local sigue disponible si el navegador bloquea el caché.
  }
}

export async function getExerciseCatalog() {
  const cached = readCache();
  if (cached) return [...localExerciseCatalog, ...cached];

  try {
    const proxy = process.env.NEXT_PUBLIC_WGER_PROXY_URL?.trim();
    const url = proxy || "https://wger.de/api/v2/exerciseinfo/?language=4&limit=120&ordering=-last_update_global";
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`wger respondió ${response.status}`);
    const data = await response.json() as WgerResponse;
    const exercises = (data.results ?? []).map(mapWgerExercise).filter((item): item is ExerciseCatalogItem => item !== null);
    writeCache(exercises);
    return [...localExerciseCatalog, ...exercises];
  } catch {
    return localExerciseCatalog;
  }
}

export function filterExerciseCatalog(catalog: ExerciseCatalogItem[], query: string, category: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase("es");
  return catalog.filter((exercise) => {
    const haystack = [exercise.name, exercise.category, ...exercise.muscles, ...exercise.equipment].join(" ").toLocaleLowerCase("es");
    const matchesQuery = normalizedQuery.length < 2 || haystack.includes(normalizedQuery);
    const matchesCategory = category === "Todos" || exercise.category.toLocaleLowerCase("es") === category.toLocaleLowerCase("es");
    return matchesQuery && matchesCategory;
  });
}
