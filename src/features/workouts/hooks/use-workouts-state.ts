"use client";

import { useEffect, useState } from "react";

import { cloneWorkout, createBlankWorkout, createInitialWorkoutsState, getWorkoutsState, saveWorkoutsState } from "../repositories/workouts-repository";
import type { CardioConfig, ExerciseCatalogItem, WorkoutBlockKey, WorkoutExercise, WorkoutPlan, WorkoutsState } from "../types/workout";

export function useWorkoutsState() {
  const [state, setState] = useState<WorkoutsState>(createInitialWorkoutsState);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    getWorkoutsState(createInitialWorkoutsState())
      .then((stored) => { if (isCurrent) setState(stored); })
      .finally(() => { if (isCurrent) setIsHydrated(true); });
    return () => { isCurrent = false; };
  }, []);

  function updateState(updater: (current: WorkoutsState) => WorkoutsState) {
    setState((current) => {
      const next = updater(current);
      void saveWorkoutsState(next);
      return next;
    });
  }

  function createWorkout() {
    const workout = createBlankWorkout();
    updateState((current) => ({ ...current, workouts: [workout, ...current.workouts] }));
    return workout.id;
  }

  function updateWorkout(id: string, changes: Partial<WorkoutPlan>) {
    updateState((current) => ({
      ...current,
      workouts: current.workouts.map((workout) => workout.id === id ? { ...workout, ...changes, updatedAt: new Date().toISOString() } : workout),
    }));
  }

  function duplicateWorkout(id: string) {
    const source = state.workouts.find((workout) => workout.id === id);
    if (!source) return "";
    const duplicate = cloneWorkout(source);
    updateState((current) => ({ ...current, workouts: [duplicate, ...current.workouts] }));
    return duplicate.id;
  }

  function deleteWorkout(id: string) {
    updateState((current) => ({ ...current, workouts: current.workouts.filter((workout) => workout.id !== id) }));
  }

  function addExercise(workoutId: string, block: WorkoutBlockKey, exercise: ExerciseCatalogItem) {
    const entry: WorkoutExercise = { id: crypto.randomUUID(), exercise, sets: block === "warmup" || block === "cooldown" ? 2 : 3, reps: block === "warmup" || block === "cooldown" ? "30 s" : "10", weightKg: 0 };
    updateState((current) => ({
      ...current,
      workouts: current.workouts.map((workout) => workout.id === workoutId
        ? { ...workout, blocks: { ...workout.blocks, [block]: [...workout.blocks[block], entry] }, updatedAt: new Date().toISOString() }
        : workout),
    }));
  }

  function updateExercise(workoutId: string, block: WorkoutBlockKey, exerciseId: string, changes: Partial<WorkoutExercise>) {
    updateState((current) => ({
      ...current,
      workouts: current.workouts.map((workout) => workout.id === workoutId
        ? { ...workout, blocks: { ...workout.blocks, [block]: workout.blocks[block].map((entry) => entry.id === exerciseId ? { ...entry, ...changes } : entry) }, updatedAt: new Date().toISOString() }
        : workout),
    }));
  }

  function removeExercise(workoutId: string, block: WorkoutBlockKey, exerciseId: string) {
    updateState((current) => ({
      ...current,
      workouts: current.workouts.map((workout) => workout.id === workoutId
        ? { ...workout, blocks: { ...workout.blocks, [block]: workout.blocks[block].filter((entry) => entry.id !== exerciseId) }, updatedAt: new Date().toISOString() }
        : workout),
    }));
  }

  function moveExercise(workoutId: string, block: WorkoutBlockKey, exerciseId: string, direction: -1 | 1) {
    updateState((current) => ({
      ...current,
      workouts: current.workouts.map((workout) => {
        if (workout.id !== workoutId) return workout;
        const entries = [...workout.blocks[block]];
        const index = entries.findIndex((entry) => entry.id === exerciseId);
        const target = index + direction;
        if (index < 0 || target < 0 || target >= entries.length) return workout;
        [entries[index], entries[target]] = [entries[target], entries[index]];
        return { ...workout, blocks: { ...workout.blocks, [block]: entries }, updatedAt: new Date().toISOString() };
      }),
    }));
  }

  function updateCardio(workoutId: string, changes: Partial<CardioConfig>) {
    updateState((current) => ({
      ...current,
      workouts: current.workouts.map((workout) => workout.id === workoutId ? { ...workout, cardio: { ...workout.cardio, ...changes }, updatedAt: new Date().toISOString() } : workout),
    }));
  }

  return { state, isHydrated, createWorkout, updateWorkout, duplicateWorkout, deleteWorkout, addExercise, updateExercise, removeExercise, moveExercise, updateCardio };
}
