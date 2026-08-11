"use client";

import { type CSSProperties, useEffect, useMemo, useState } from "react";

import { getHealthyRecipeIdeas, getRecipeDetail } from "../services/themealdb-service";
import type { RecipeCollection, RecipeDetail, RecipeSummary } from "../types/recipe";
import styles from "../recipes.module.css";

type RecipeFilter = "Todas" | RecipeCollection;
const recipeFilters: RecipeFilter[] = ["Todas", "Vegetariana", "Pescado", "Proteína"];

export function RecipeGallery() {
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<RecipeFilter>("Todas");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrentRequest = true;
    const storedFavorites = window.localStorage.getItem("nekofit-recipe-favorites");
    if (storedFavorites) {
      queueMicrotask(() => {
        if (isCurrentRequest) setFavorites(new Set(JSON.parse(storedFavorites) as string[]));
      });
    }

    getHealthyRecipeIdeas()
      .then((recipeIdeas) => {
        if (isCurrentRequest) setRecipes(recipeIdeas);
      })
      .catch(() => {
        if (isCurrentRequest) setError("No pudimos consultar las recetas. Revisa tu conexión e intenta otra vez.");
      })
      .finally(() => {
        if (isCurrentRequest) setIsLoading(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, []);

  const visibleRecipes = useMemo(() => recipes.filter((recipe) => {
    const matchesFilter = filter === "Todas" || recipe.collection === filter;
    const matchesQuery = recipe.name.toLowerCase().includes(query.trim().toLowerCase());
    return matchesFilter && matchesQuery;
  }), [filter, query, recipes]);

  function toggleFavorite(recipeId: string) {
    setFavorites((currentFavorites) => {
      const nextFavorites = new Set(currentFavorites);
      if (nextFavorites.has(recipeId)) nextFavorites.delete(recipeId);
      else nextFavorites.add(recipeId);
      window.localStorage.setItem("nekofit-recipe-favorites", JSON.stringify([...nextFavorites]));
      return nextFavorites;
    });
  }

  async function openRecipe(recipe: RecipeSummary) {
    setIsDetailLoading(true);
    setError(null);
    try {
      setSelectedRecipe(await getRecipeDetail(recipe));
    } catch {
      setError("No logramos abrir esa receta. Prueba nuevamente.");
    } finally {
      setIsDetailLoading(false);
    }
  }

  function retryLoading() {
    setIsLoading(true);
    setError(null);
    getHealthyRecipeIdeas()
      .then(setRecipes)
      .catch(() => setError("La API sigue sin responder. Podemos continuar con los otros módulos."))
      .finally(() => setIsLoading(false));
  }

  return (
    <main className={styles.recipesPage}>
      <header className={styles.pageIntro}>
        <div>
          <p className={styles.eyebrow}>Recetario para sentirte bien</p>
          <h1>Ideas ricas,<br />días ligeros</h1>
          <p>Una selección variada de vegetales, pescado y proteína para inspirar tus próximas comidas.</p>
        </div>
        <aside className={styles.recipeNote}><span aria-hidden="true">♡</span><strong>Nota honesta</strong><p>Los macros llegarán con USDA. Aquí no inventamos valores.</p></aside>
      </header>

      <section className={styles.recipeBook} aria-label="Explorador de recetas">
        <div className={styles.bookTape} aria-hidden="true" />
        <div className={styles.recipeToolbar}>
          <label className={styles.searchField}>
            <span className={styles.visuallyHidden}>Buscar receta</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Busca una idea rica..." />
            <span aria-hidden="true">⌕</span>
          </label>
          <div className={styles.filters} aria-label="Filtrar recetas">
            {recipeFilters.map((option) => <button key={option} type="button" className={filter === option ? styles.filterActive : ""} aria-pressed={filter === option} onClick={() => setFilter(option)}>{option}</button>)}
          </div>
        </div>

        {error && <div className={styles.errorNote} role="alert"><strong>Ups, la cocina se pausó.</strong><span>{error}</span><button type="button" onClick={retryLoading}>Intentar otra vez</button></div>}

        <div className={styles.recipeGrid} aria-busy={isLoading}>
          {isLoading
            ? Array.from({ length: 6 }, (_, index) => <div key={index} className={styles.recipeSkeleton} />)
            : visibleRecipes.map((recipe, index) => (
              <article key={recipe.id} className={styles.recipeCard} style={{ "--card-angle": `${[-2, 1.5, -1, 2][index % 4]}deg`, "--card-delay": `${index * 55}ms` } as CSSProperties}>
                <button type="button" className={styles.favoriteButton} aria-label={favorites.has(recipe.id) ? `Quitar ${recipe.name} de favoritas` : `Guardar ${recipe.name} como favorita`} aria-pressed={favorites.has(recipe.id)} onClick={() => toggleFavorite(recipe.id)}>{favorites.has(recipe.id) ? "♥" : "♡"}</button>
                <button type="button" className={styles.recipeOpenButton} onClick={() => openRecipe(recipe)}>
                  <span className={styles.recipePhoto} style={{ backgroundImage: `url("${recipe.imageUrl}")` }} />
                  <span className={styles.recipeCollection}>{recipe.collection}</span>
                  <strong>{recipe.name}</strong>
                  <small>Ver ingredientes →</small>
                </button>
              </article>
            ))}
        </div>

        {!isLoading && !error && visibleRecipes.length === 0 && <p className={styles.emptyState}>No encontramos esa receta en esta selección. Prueba otra palabra ✦</p>}
        <p className={styles.apiCredit}>Recetas obtenidas desde <a href="https://www.themealdb.com/" target="_blank" rel="noreferrer">TheMealDB</a>.</p>
      </section>

      {isDetailLoading && <div className={styles.detailLoading} role="status">Preparando la receta...</div>}
      {selectedRecipe && <RecipeDetailDialog recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />}
    </main>
  );
}

function RecipeDetailDialog({ recipe, onClose }: { recipe: RecipeDetail; onClose: () => void }) {
  return (
    <div className={styles.detailBackdrop} role="presentation" onPointerDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <article className={styles.detailCard} role="dialog" aria-modal="true" aria-labelledby="recipe-detail-title">
        <button type="button" className={styles.closeDetail} aria-label="Cerrar receta" onClick={onClose}>×</button>
        <div className={styles.detailPhoto} style={{ backgroundImage: `url("${recipe.imageUrl}")` }} />
        <div className={styles.detailCopy}>
          <p className={styles.detailEyebrow}>{recipe.collection} · {recipe.area}</p>
          <h2 id="recipe-detail-title">{recipe.name}</h2>
          <div className={styles.detailColumns}>
            <section><h3>Ingredientes</h3><ul>{recipe.ingredients.map((ingredient, index) => <li key={`${ingredient.name}-${index}`}><span>{ingredient.measure}</span>{ingredient.name}</li>)}</ul></section>
            <section><h3>Preparación</h3><p>{recipe.instructions}</p></section>
          </div>
          <div className={styles.detailLinks}>
            {recipe.sourceUrl && <a href={recipe.sourceUrl} target="_blank" rel="noreferrer">Fuente original</a>}
            {recipe.videoUrl && <a href={recipe.videoUrl} target="_blank" rel="noreferrer">Ver video</a>}
          </div>
        </div>
      </article>
    </div>
  );
}
