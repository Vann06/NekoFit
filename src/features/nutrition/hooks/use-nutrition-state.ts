"use client";

import { useEffect, useState } from "react";

import { createEmptyDiaryDay, createEmptyPlannedDay, createInitialNutritionState, getLocalDateKey, getNutritionState, saveNutritionState } from "../repositories/nutrition-repository";
import type { FoodItem, MealKey, NutritionGoals, NutritionState, PlannedItem } from "../types/nutrition";
import { scaleFoodMacros } from "../utils/nutrition-calculations";

export function useNutritionState() {
  const [state, setState] = useState<NutritionState>(() => createInitialNutritionState(getLocalDateKey()));
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    getNutritionState(createInitialNutritionState(getLocalDateKey()))
      .then((storedState) => {
        if (isCurrent) setState(storedState);
      })
      .finally(() => {
        if (isCurrent) setIsHydrated(true);
      });
    return () => { isCurrent = false; };
  }, []);

  function updateState(updater: (currentState: NutritionState) => NutritionState) {
    setState((currentState) => {
      const nextState = updater(currentState);
      void saveNutritionState(nextState);
      return nextState;
    });
  }

  function addFood(date: string, meal: MealKey, food: FoodItem, grams: number) {
    updateState((currentState) => {
      const currentDay = currentState.diaryDays[date] ?? createEmptyDiaryDay(date);
      const entry = { id: crypto.randomUUID(), food, grams, macros: scaleFoodMacros(food, grams) };
      return {
        ...currentState,
        diaryDays: {
          ...currentState.diaryDays,
          [date]: { ...currentDay, meals: { ...currentDay.meals, [meal]: [...currentDay.meals[meal], entry] } },
        },
      };
    });
  }

  function removeFood(date: string, meal: MealKey, entryId: string) {
    updateState((currentState) => {
      const currentDay = currentState.diaryDays[date] ?? createEmptyDiaryDay(date);
      return {
        ...currentState,
        diaryDays: {
          ...currentState.diaryDays,
          [date]: { ...currentDay, meals: { ...currentDay.meals, [meal]: currentDay.meals[meal].filter((entry) => entry.id !== entryId) } },
        },
      };
    });
  }

  function updateGoals(goals: NutritionGoals) {
    updateState((currentState) => ({ ...currentState, goals }));
  }

  function addPlannedItem(date: string, meal: MealKey, item: Omit<PlannedItem, "id">) {
    updateState((currentState) => {
      const currentDay = currentState.planDays[date] ?? createEmptyPlannedDay(date);
      const plannedItem = { ...item, id: crypto.randomUUID() };
      return {
        ...currentState,
        planDays: {
          ...currentState.planDays,
          [date]: { ...currentDay, meals: { ...currentDay.meals, [meal]: [...currentDay.meals[meal], plannedItem] } },
        },
      };
    });
  }

  function removePlannedItem(date: string, meal: MealKey, itemId: string) {
    updateState((currentState) => {
      const currentDay = currentState.planDays[date] ?? createEmptyPlannedDay(date);
      return {
        ...currentState,
        planDays: {
          ...currentState.planDays,
          [date]: { ...currentDay, meals: { ...currentDay.meals, [meal]: currentDay.meals[meal].filter((item) => item.id !== itemId) } },
        },
      };
    });
  }

  function duplicatePlannedDay(sourceDate: string, targetDate: string) {
    updateState((currentState) => {
      const sourceDay = currentState.planDays[sourceDate] ?? createEmptyPlannedDay(sourceDate);
      const copiedMeals = Object.fromEntries(Object.entries(sourceDay.meals).map(([meal, items]) => [meal, items.map((item) => ({ ...item, id: crypto.randomUUID() }))])) as typeof sourceDay.meals;
      return { ...currentState, planDays: { ...currentState.planDays, [targetDate]: { date: targetDate, meals: copiedMeals } } };
    });
  }

  return { state, isHydrated, addFood, removeFood, updateGoals, addPlannedItem, removePlannedItem, duplicatePlannedDay };
}
