import { commonFoods } from "../data/food-catalog";
import { mealDefinitions } from "../data/meal-definitions";
import { planningOptions } from "../data/planning-options";
import type { DiaryDay, LoggedFood, MealKey, NutritionState, PlannedDay } from "../types/nutrition";
import { scaleFoodMacros } from "../utils/nutrition-calculations";

const databaseName = "nekofit-nutrition";
const storeName = "nutrition-state";
const stateId = "main";

export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(dateKey: string, amount: number) {
  const date = new Date(`${dateKey}T12:00:00`);
  date.setDate(date.getDate() + amount);
  return getLocalDateKey(date);
}

export function getWeekStart(dateKey: string) {
  const date = new Date(`${dateKey}T12:00:00`);
  const mondayOffset = date.getDay() === 0 ? -6 : 1 - date.getDay();
  date.setDate(date.getDate() + mondayOffset);
  return getLocalDateKey(date);
}

export function createEmptyMeals<T>(): Record<MealKey, T[]> {
  return mealDefinitions.reduce<Record<MealKey, T[]>>((meals, meal) => {
    meals[meal.key] = [];
    return meals;
  }, {} as Record<MealKey, T[]>);
}

export function createEmptyDiaryDay(date: string): DiaryDay {
  return { date, meals: createEmptyMeals<LoggedFood>() };
}

export function createEmptyPlannedDay(date: string): PlannedDay {
  return { date, meals: createEmptyMeals() };
}

function loggedFood(id: string, foodId: string, grams: number): LoggedFood {
  const food = commonFoods.find((item) => item.id === foodId);
  if (!food) throw new Error(`No existe el alimento inicial ${foodId}`);
  return { id, food, grams, macros: scaleFoodMacros(food, grams) };
}

function createInitialDiaryDay(date: string): DiaryDay {
  const day = createEmptyDiaryDay(date);
  day.meals.breakfast = [
    loggedFood("demo-oats", "oats", 50),
    loggedFood("demo-yogurt", "greek-yogurt", 150),
    loggedFood("demo-banana", "banana", 80),
  ];
  day.meals.lunch = [
    loggedFood("demo-chicken", "chicken-breast", 130),
    loggedFood("demo-rice-lunch", "brown-rice", 160),
    loggedFood("demo-broccoli-lunch", "broccoli", 120),
  ];
  day.meals.snack = [loggedFood("demo-eggs", "egg-whole", 100)];
  day.meals.dinner = [
    loggedFood("demo-avocado", "avocado", 70),
    loggedFood("demo-rice-dinner", "brown-rice", 100),
    loggedFood("demo-broccoli-dinner", "broccoli", 100),
    loggedFood("demo-oil", "olive-oil", 12),
  ];
  return day;
}

function createInitialPlan(weekStart: string) {
  return Array.from({ length: 7 }, (_, dayIndex) => addDays(weekStart, dayIndex)).reduce<Record<string, PlannedDay>>((days, date, dayIndex) => {
    const day = createEmptyPlannedDay(date);
    const breakfast = dayIndex % 2 === 0 ? planningOptions[3] : planningOptions[4];
    const lunch = planningOptions[dayIndex % 3];
    const dinner = planningOptions[(dayIndex + 1) % 3];
    day.meals.breakfast = [{ ...breakfast, id: `${date}-breakfast` }];
    day.meals.lunch = [{ ...lunch, id: `${date}-lunch` }];
    day.meals.snack = [{ ...planningOptions[5], id: `${date}-snack` }];
    day.meals.dinner = [{ ...dinner, id: `${date}-dinner` }];
    days[date] = day;
    return days;
  }, {});
}

export function createInitialNutritionState(today = getLocalDateKey()): NutritionState {
  return {
    version: 2,
    goals: {
      calories: 1900,
      protein: 120,
      carbs: 210,
      fat: 60,
      fiber: 28,
      waterGlasses: 8,
      mealCalories: { preWorkout: 150, breakfast: 400, postWorkout: 200, lunch: 550, snack: 200, dinner: 400 },
    },
    diaryDays: { [today]: createInitialDiaryDay(today) },
    planDays: createInitialPlan(getWeekStart(today)),
    waterByDate: { [today]: 5 },
  };
}

function openNutritionDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(storeName)) request.result.createObjectStore(storeName, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function requestResult<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getNutritionState(fallbackState: NutritionState) {
  const database = await openNutritionDatabase();
  const transaction = database.transaction(storeName, "readonly");
  const record = await requestResult(transaction.objectStore(storeName).get(stateId)) as { id: string; state: NutritionState } | undefined;
  database.close();
  if (record?.state?.version === 2) return record.state;
  if (record?.state?.version === 1) {
    const previousState = record.state as unknown as Omit<NutritionState, "version" | "waterByDate"> & { version: 1; goals: Omit<NutritionState["goals"], "waterGlasses"> };
    const migratedState: NutritionState = {
      ...previousState,
      version: 2,
      goals: { ...previousState.goals, waterGlasses: fallbackState.goals.waterGlasses },
      waterByDate: fallbackState.waterByDate,
    };
    await saveNutritionState(migratedState);
    return migratedState;
  }
  await saveNutritionState(fallbackState);
  return fallbackState;
}

export async function saveNutritionState(state: NutritionState) {
  const database = await openNutritionDatabase();
  const transaction = database.transaction(storeName, "readwrite");
  await requestResult(transaction.objectStore(storeName).put({ id: stateId, state }));
  database.close();
}
