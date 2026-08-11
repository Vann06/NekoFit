"use client";

import { type CSSProperties, useEffect, useMemo, useState } from "react";

import { getMealPrepRecipes } from "../services/spoonacular-service";
import type { MealPrepRecipe, RecipeGoal, RecipeLoadResult } from "../types/recipe";
import styles from "../recipes.module.css";

type RecipeFilter = "Todos" | RecipeGoal;

const recipeFilters: RecipeFilter[] = ["Todos", "Alta proteína", "Balanceado", "Vegetariano", "Desayuno"];
const favoriteStorageKey = "nekofit-meal-prep-favorites";

export function RecipeGallery() {
  const [recipes, setRecipes] = useState<MealPrepRecipe[]>([]);
  const [mode, setMode] = useState<RecipeLoadResult["mode"]>("curated");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<RecipeFilter>("Todos");
  const [openRecipeId, setOpenRecipeId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrentRequest = true;
    const storedFavorites = window.localStorage.getItem(favoriteStorageKey);
    if (storedFavorites) {
      queueMicrotask(() => {
        if (isCurrentRequest) setFavorites(new Set(JSON.parse(storedFavorites) as string[]));
      });
    }

    getMealPrepRecipes()
      .then((result) => {
        if (!isCurrentRequest) return;
        setRecipes(result.recipes);
        setMode(result.mode);
        setOpenRecipeId(result.recipes[0]?.id ?? null);
      })
      .catch(() => {
        if (isCurrentRequest) setError("No pudimos preparar el recetario. Intenta recargar la página.");
      })
      .finally(() => {
        if (isCurrentRequest) setIsLoading(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, []);

  const visibleRecipes = useMemo(() => recipes.filter((recipe) => {
    const matchesFilter = filter === "Todos" || recipe.goal === filter;
    const normalizedQuery = query.trim().toLocaleLowerCase("es");
    const matchesQuery = normalizedQuery.length === 0
      || `${recipe.name} ${recipe.description}`.toLocaleLowerCase("es").includes(normalizedQuery);
    return matchesFilter && matchesQuery;
  }), [filter, query, recipes]);

  function toggleFavorite(recipeId: string) {
    setFavorites((currentFavorites) => {
      const nextFavorites = new Set(currentFavorites);
      if (nextFavorites.has(recipeId)) nextFavorites.delete(recipeId);
      else nextFavorites.add(recipeId);
      window.localStorage.setItem(favoriteStorageKey, JSON.stringify([...nextFavorites]));
      return nextFavorites;
    });
  }

  return (
    <main className={styles.recipesPage}>
      <header className={styles.pageIntro}>
        <div>
          <p className={styles.eyebrow}>Meal prep para tu semana</p>
          <h1>Cocina una vez,<br />come sin drama</h1>
          <p>Recetas sencillas, sin frituras y con macros por porción para que organizarte no se convierta en otra rutina complicada.</p>
        </div>
        <aside className={styles.prepNote}>
          <span aria-hidden="true">4×</span>
          <strong>Una tanda, cuatro comidas</strong>
          <p>Prepara, divide y guarda. Cada receta está pensada para repetirse bien durante la semana.</p>
        </aside>
      </header>

      <section className={styles.prepPrinciples} aria-label="Principios del recetario">
        <div><strong>25 g+</strong><span>de proteína</span></div>
        <div><strong>40 min</strong><span>o menos</span></div>
        <div><strong>4</strong><span>porciones</span></div>
        <div><strong>0</strong><span>frituras</span></div>
      </section>

      <section className={styles.recipeBook} aria-label="Recetario meal prep">
        <div className={styles.bookTape} aria-hidden="true" />

        <div className={styles.recipeToolbar}>
          <label className={styles.searchField}>
            <span className={styles.visuallyHidden}>Buscar receta</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Busca pollo, desayuno, tofu..." />
            <span aria-hidden="true">⌕</span>
          </label>
          <div className={styles.filters} aria-label="Filtrar recetas">
            {recipeFilters.map((option) => (
              <button key={option} type="button" className={filter === option ? styles.filterActive : ""} aria-pressed={filter === option} onClick={() => setFilter(option)}>
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.sourceStatus}>
          <span aria-hidden="true" />
          {mode === "spoonacular"
            ? "Recetas y macros obtenidos mediante Spoonacular."
            : "Colección meal-prep local · Spoonacular listo para conectarse mediante proxy."}
        </div>

        {error && <p className={styles.errorNote} role="alert">{error}</p>}

        <div className={styles.recipeList} aria-busy={isLoading}>
          {isLoading
            ? Array.from({ length: 4 }, (_, index) => <div key={index} className={styles.recipeSkeleton} />)
            : visibleRecipes.map((recipe, index) => (
              <RecipeAccordion
                key={recipe.id}
                recipe={recipe}
                index={index}
                isOpen={openRecipeId === recipe.id}
                isFavorite={favorites.has(recipe.id)}
                onToggle={() => setOpenRecipeId((currentId) => currentId === recipe.id ? null : recipe.id)}
                onFavorite={() => toggleFavorite(recipe.id)}
              />
            ))}
        </div>

        {!isLoading && !error && visibleRecipes.length === 0 && (
          <p className={styles.emptyState}>No hay una preparación con ese filtro. Prueba otra palabra o categoría.</p>
        )}
      </section>
    </main>
  );
}

type RecipeAccordionProps = {
  recipe: MealPrepRecipe;
  index: number;
  isOpen: boolean;
  isFavorite: boolean;
  onToggle: () => void;
  onFavorite: () => void;
};

function RecipeAccordion({ recipe, index, isOpen, isFavorite, onToggle, onFavorite }: RecipeAccordionProps) {
  const regionId = `recipe-${recipe.id}`;
  return (
    <article className={`${styles.recipeAccordion} ${isOpen ? styles.recipeAccordionOpen : ""}`} style={{ "--recipe-delay": `${index * 55}ms` } as CSSProperties}>
      <div className={styles.accordionHeader}>
        <button type="button" className={styles.recipeToggle} aria-expanded={isOpen} aria-controls={regionId} onClick={onToggle}>
          <RecipePicture recipe={recipe} />
          <span className={styles.recipeHeading}>
            <span className={styles.recipeGoal}>{recipe.goal}</span>
            <strong>{recipe.name}</strong>
            <small>{recipe.prepMinutes} min · {recipe.servings} porciones · {recipe.difficulty}</small>
          </span>
          <span className={styles.macroPreview} aria-label="Macros por porción">
            <span><b>{recipe.macros.calories}</b> kcal</span>
            <span><b>{recipe.macros.protein} g</b> proteína</span>
            <span><b>{recipe.macros.carbs} g</b> carbs</span>
            <span><b>{recipe.macros.fat} g</b> grasa</span>
          </span>
          <span className={styles.expandSymbol} aria-hidden="true">{isOpen ? "−" : "+"}</span>
        </button>
        <button type="button" className={styles.favoriteButton} aria-label={isFavorite ? `Quitar ${recipe.name} de favoritas` : `Guardar ${recipe.name} como favorita`} aria-pressed={isFavorite} onClick={onFavorite}>
          {isFavorite ? "♥" : "♡"}
        </button>
      </div>

      {isOpen && (
        <div id={regionId} className={styles.recipeDetails}>
          <p className={styles.recipeDescription}>{recipe.description}</p>
          <MacroPanel recipe={recipe} />
          <div className={styles.prepColumns}>
            <section>
              <h2>Ingredientes para {recipe.servings}</h2>
              <ul className={styles.ingredientList}>
                {recipe.ingredients.map((ingredient, ingredientIndex) => (
                  <li key={`${ingredient.name}-${ingredientIndex}`}><span>{ingredient.amount}</span>{ingredient.name}</li>
                ))}
              </ul>
            </section>
            <section>
              <h2>Prepáralo así</h2>
              <ol className={styles.stepList}>
                {recipe.steps.map((step, stepIndex) => <li key={`${recipe.id}-step-${stepIndex}`}>{step}</li>)}
              </ol>
            </section>
          </div>
          <footer className={styles.storageTip}>
            <span aria-hidden="true">✦</span>
            <p><strong>Guárdalo bien</strong>{recipe.storage}</p>
            <small>Macros por porción · fuente: {recipe.source}</small>
          </footer>
        </div>
      )}
    </article>
  );
}

function RecipePicture({ recipe }: { recipe: MealPrepRecipe }) {
  const pictureStyle = recipe.imageUrl
    ? { backgroundImage: `url("${recipe.imageUrl}")` }
    : {
      backgroundImage: "url('/images/recipes/meal-prep-sprite.png')",
      backgroundPosition: recipe.imagePosition,
      backgroundSize: "300% 200%",
    };
  return <span className={styles.recipePhoto} style={pictureStyle} role="img" aria-label={`Meal prep de ${recipe.name}`} />;
}

function MacroPanel({ recipe }: { recipe: MealPrepRecipe }) {
  const macros = [
    { label: "Proteína", value: `${recipe.macros.protein} g`, color: "purple" },
    { label: "Carbohidratos", value: `${recipe.macros.carbs} g`, color: "green" },
    { label: "Grasas", value: `${recipe.macros.fat} g`, color: "yellow" },
    { label: "Fibra", value: `${recipe.macros.fiber} g`, color: "mint" },
  ];
  return (
    <section className={styles.macroPanel} aria-label="Nutrición por porción">
      <div className={styles.calorieBadge}><strong>{recipe.macros.calories}</strong><span>kcal</span><small>por porción</small></div>
      {macros.map((macro) => (
        <div key={macro.label} className={styles.macroItem} data-color={macro.color}>
          <span>{macro.label}</span>
          <strong>{macro.value}</strong>
          <i aria-hidden="true"><b /></i>
        </div>
      ))}
    </section>
  );
}
