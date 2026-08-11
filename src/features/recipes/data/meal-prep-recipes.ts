import type { IngredientWithNutrition, MealPrepRecipe } from "../types/recipe";
import { calculateRecipeMacros } from "../utils/calculate-recipe-macros";

type RecipeSeed = Omit<MealPrepRecipe, "ingredients" | "macros" | "source"> & {
  ingredients: IngredientWithNutrition[];
};

function createMealPrepRecipe(seed: RecipeSeed): MealPrepRecipe {
  return {
    ...seed,
    macros: calculateRecipeMacros(seed.ingredients, seed.servings),
    ingredients: seed.ingredients.map(({ name, amount }) => ({ name, amount })),
    source: "NekoFit",
  };
}

export const mealPrepRecipes: MealPrepRecipe[] = [
  createMealPrepRecipe({
    id: "chicken-rice-broccoli",
    name: "Pollo, arroz y brócoli",
    description: "El clásico del gym: pocos ingredientes, buen volumen y fácil de recalentar.",
    goal: "Alta proteína",
    prepMinutes: 32,
    servings: 4,
    difficulty: "Muy fácil",
    imagePosition: "0% 0%",
    ingredients: [
      { name: "Pechuga de pollo", amount: "600 g", batchNutrition: { calories: 990, protein: 186, carbs: 0, fat: 21, fiber: 0 } },
      { name: "Arroz integral cocido", amount: "600 g", batchNutrition: { calories: 738, protein: 15, carbs: 153, fat: 6, fiber: 11 } },
      { name: "Brócoli", amount: "400 g", batchNutrition: { calories: 136, protein: 11, carbs: 28, fat: 2, fiber: 10 } },
      { name: "Aceite de oliva", amount: "20 g", batchNutrition: { calories: 177, protein: 0, carbs: 0, fat: 20, fiber: 0 } },
      { name: "Ajo, paprika, sal y pimienta", amount: "al gusto", batchNutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 } },
    ],
    steps: [
      "Sazona el pollo con ajo, paprika, sal y pimienta.",
      "Cocínalo en plancha o air fryer hasta que esté completamente cocido.",
      "Cocina el brócoli al vapor durante 5 a 7 minutos.",
      "Divide arroz, pollo y brócoli en cuatro recipientes.",
    ],
    storage: "Refrigera hasta 4 días. Añade un chorrito de agua al arroz antes de recalentar.",
  }),
  createMealPrepRecipe({
    id: "turkey-sweet-potato",
    name: "Pavo, camote y ejotes",
    description: "Albóndigas horneadas con carbohidrato saciante y verduras crujientes.",
    goal: "Balanceado",
    prepMinutes: 38,
    servings: 4,
    difficulty: "Fácil",
    imagePosition: "50% 0%",
    ingredients: [
      { name: "Pavo molido magro", amount: "600 g", batchNutrition: { calories: 1020, protein: 132, carbs: 0, fat: 48, fiber: 0 } },
      { name: "Camote", amount: "800 g", batchNutrition: { calories: 688, protein: 13, carbs: 160, fat: 1, fiber: 24 } },
      { name: "Ejotes", amount: "400 g", batchNutrition: { calories: 124, protein: 7, carbs: 28, fat: 1, fiber: 12 } },
      { name: "Aceite de oliva", amount: "20 g", batchNutrition: { calories: 177, protein: 0, carbs: 0, fat: 20, fiber: 0 } },
      { name: "Cebolla en polvo y orégano", amount: "al gusto", batchNutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 } },
    ],
    steps: [
      "Forma albóndigas pequeñas con el pavo y los condimentos.",
      "Corta el camote en cubos y mézclalo con la mitad del aceite.",
      "Hornea pavo y camote a 200 °C durante 22 a 26 minutos.",
      "Cocina los ejotes al vapor y distribuye todo en cuatro porciones.",
    ],
    storage: "Dura 4 días refrigerado. Guarda los ejotes separados si los prefieres más firmes.",
  }),
  createMealPrepRecipe({
    id: "salmon-quinoa-zucchini",
    name: "Salmón, quinoa y zucchini",
    description: "Una bandeja, cuatro porciones y grasas saludables para variar el pollo.",
    goal: "Alta proteína",
    prepMinutes: 30,
    servings: 4,
    difficulty: "Muy fácil",
    imagePosition: "100% 0%",
    ingredients: [
      { name: "Filete de salmón", amount: "600 g", batchNutrition: { calories: 1248, protein: 120, carbs: 0, fat: 78, fiber: 0 } },
      { name: "Quinoa cocida", amount: "600 g", batchNutrition: { calories: 720, protein: 26, carbs: 128, fat: 12, fiber: 17 } },
      { name: "Zucchini", amount: "500 g", batchNutrition: { calories: 85, protein: 6, carbs: 16, fat: 2, fiber: 5 } },
      { name: "Aceite de oliva", amount: "10 g", batchNutrition: { calories: 89, protein: 0, carbs: 0, fat: 10, fiber: 0 } },
      { name: "Limón, eneldo, sal y pimienta", amount: "al gusto", batchNutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 } },
    ],
    steps: [
      "Coloca el salmón y el zucchini en una bandeja.",
      "Agrega aceite, limón, eneldo, sal y pimienta.",
      "Hornea a 200 °C durante 14 a 18 minutos.",
      "Sirve sobre quinoa y divide en cuatro recipientes.",
    ],
    storage: "Refrigera hasta 3 días. Recalienta suavemente para evitar secar el salmón.",
  }),
  createMealPrepRecipe({
    id: "beef-rice-peppers",
    name: "Res, arroz y pimientos",
    description: "Tiras de res magra, vegetales coloridos y una base sencilla de arroz.",
    goal: "Alta proteína",
    prepMinutes: 28,
    servings: 4,
    difficulty: "Fácil",
    imagePosition: "0% 100%",
    ingredients: [
      { name: "Res magra en tiras", amount: "600 g", batchNutrition: { calories: 1260, protein: 156, carbs: 0, fat: 60, fiber: 0 } },
      { name: "Arroz blanco cocido", amount: "600 g", batchNutrition: { calories: 780, protein: 16, carbs: 169, fat: 2, fiber: 2 } },
      { name: "Pimientos de colores", amount: "450 g", batchNutrition: { calories: 140, protein: 5, carbs: 31, fat: 1, fiber: 9 } },
      { name: "Aceite de oliva", amount: "10 g", batchNutrition: { calories: 89, protein: 0, carbs: 0, fat: 10, fiber: 0 } },
      { name: "Salsa de soya baja en sodio", amount: "30 ml", batchNutrition: { calories: 16, protein: 2, carbs: 2, fat: 0, fiber: 0 } },
    ],
    steps: [
      "Calienta una sartén grande y cocina la res en dos tandas.",
      "Retira la res y cocina los pimientos durante 4 minutos.",
      "Devuelve la carne, agrega la salsa de soya y mezcla.",
      "Divide el arroz y la mezcla de res entre cuatro recipientes.",
    ],
    storage: "Refrigera hasta 4 días. Puedes congelar dos porciones hasta por 1 mes.",
  }),
  createMealPrepRecipe({
    id: "overnight-oats",
    name: "Overnight oats con yogurt",
    description: "Desayuno frío listo desde la noche anterior, con proteína y mucha fibra.",
    goal: "Desayuno",
    prepMinutes: 10,
    servings: 4,
    difficulty: "Muy fácil",
    imagePosition: "50% 100%",
    ingredients: [
      { name: "Avena", amount: "240 g", batchNutrition: { calories: 933, protein: 41, carbs: 159, fat: 17, fiber: 25 } },
      { name: "Yogurt griego natural", amount: "800 g", batchNutrition: { calories: 584, protein: 80, carbs: 29, fat: 16, fiber: 0 } },
      { name: "Frutos rojos", amount: "400 g", batchNutrition: { calories: 200, protein: 3, carbs: 48, fat: 1, fiber: 20 } },
      { name: "Banano", amount: "300 g", batchNutrition: { calories: 267, protein: 3, carbs: 69, fat: 1, fiber: 8 } },
      { name: "Semillas de chía", amount: "40 g", batchNutrition: { calories: 194, protein: 7, carbs: 17, fat: 12, fiber: 14 } },
    ],
    steps: [
      "Mezcla la avena, el yogurt y la chía.",
      "Añade un poco de agua o leche hasta obtener la textura deseada.",
      "Divide en cuatro frascos y refrigera toda la noche.",
      "Agrega banano y frutos rojos justo antes de comer.",
    ],
    storage: "Dura 4 días refrigerado. Guarda el banano aparte para que conserve su textura.",
  }),
  createMealPrepRecipe({
    id: "tofu-edamame-soba",
    name: "Tofu, edamame y soba",
    description: "Opción vegetal completa, alta en proteína y fácil de comer fría o caliente.",
    goal: "Vegetariano",
    prepMinutes: 35,
    servings: 4,
    difficulty: "Fácil",
    imagePosition: "100% 100%",
    ingredients: [
      { name: "Tofu firme", amount: "600 g", batchNutrition: { calories: 864, protein: 96, carbs: 18, fat: 48, fiber: 6 } },
      { name: "Edamame cocido", amount: "400 g", batchNutrition: { calories: 484, protein: 48, carbs: 36, fat: 20, fiber: 20 } },
      { name: "Fideos soba cocidos", amount: "600 g", batchNutrition: { calories: 594, protein: 30, carbs: 126, fat: 1, fiber: 8 } },
      { name: "Vegetales mixtos", amount: "500 g", batchNutrition: { calories: 200, protein: 8, carbs: 40, fat: 2, fiber: 15 } },
      { name: "Aceite de ajonjolí", amount: "10 g", batchNutrition: { calories: 88, protein: 0, carbs: 0, fat: 10, fiber: 0 } },
    ],
    steps: [
      "Presiona el tofu, córtalo en cubos y sazónalo.",
      "Hornea o cocina en air fryer a 200 °C durante 18 minutos.",
      "Cocina los vegetales y mezcla con soba y edamame.",
      "Añade el tofu y divide en cuatro recipientes.",
    ],
    storage: "Refrigera hasta 4 días. También funciona como ensalada fría para llevar.",
  }),
];
