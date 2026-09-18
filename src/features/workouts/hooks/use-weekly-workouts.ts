"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { createClient } from "@/lib/supabase/client";

import {
  cacheWeeklyWorkouts,
  createBlankWeeklyPlan,
  deleteWeeklyPlan,
  getCachedWeeklyWorkouts,
  loadWeeklyWorkouts,
  persistSessionExercise,
  persistSessionTimer,
  persistSetResult,
  persistWeeklyPlan,
  startWorkoutSession,
} from "../repositories/supabase-workouts-repository";
import type { WeightUnit, WeeklyWorkoutPlan, WeeklyWorkoutsState, WorkoutSession, WorkoutSessionExercise, WorkoutSetResult } from "../types/workout";
import { finishWorkoutSession, pauseWorkoutSession, resumeWorkoutSession } from "../utils/session-timer";

type SyncStatus = "loading" | "synced" | "saving" | "offline" | "error";

const emptyState: WeeklyWorkoutsState = { version: 4, plans: [], activeSession: null };

export function useWeeklyWorkouts(userId: string, preferredUnit: WeightUnit) {
  const [state, setState] = useState<WeeklyWorkoutsState>(emptyState);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("loading");
  const [error, setError] = useState("");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const client = createClient();

  const saveCache = useCallback((next: WeeklyWorkoutsState) => {
    void cacheWeeklyWorkouts(next).catch(() => undefined);
  }, []);

  useEffect(() => {
    let current = true;
    if (!client) {
      queueMicrotask(() => {
        if (!current) return;
        setSyncStatus("error");
        setError("Supabase no está configurado.");
      });
      return () => { current = false; };
    }

    loadWeeklyWorkouts(client, userId, preferredUnit)
      .then((loaded) => {
        if (!current) return;
        setState(loaded);
        setSyncStatus("synced");
      })
      .catch(async (loadError: unknown) => {
        const cached = await getCachedWeeklyWorkouts().catch(() => null);
        if (!current) return;
        if (cached) setState(cached);
        setSyncStatus(cached ? "offline" : "error");
        setError(loadError instanceof Error ? loadError.message : "No fue posible cargar tus entrenamientos.");
      });

    return () => {
      current = false;
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [client, preferredUnit, userId]);

  function reportSaveError(saveError: unknown) {
    setSyncStatus(navigator.onLine ? "error" : "offline");
    setError(saveError instanceof Error ? saveError.message : "No fue posible sincronizar los cambios.");
  }

  function queuePlanSave(plan: WeeklyWorkoutPlan) {
    if (!client) return;
    setSyncStatus("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      persistWeeklyPlan(client, userId, plan)
        .then(() => { setSyncStatus("synced"); setError(""); })
        .catch(reportSaveError);
    }, 650);
  }

  function updatePlan(planId: string, updater: (plan: WeeklyWorkoutPlan) => WeeklyWorkoutPlan) {
    setState((current) => {
      let changedPlan: WeeklyWorkoutPlan | null = null;
      const next: WeeklyWorkoutsState = {
        ...current,
        plans: current.plans.map((plan) => {
          if (plan.id !== planId) return plan;
          changedPlan = { ...updater(plan), updatedAt: new Date().toISOString() };
          return changedPlan;
        }),
      };
      saveCache(next);
      if (changedPlan) queuePlanSave(changedPlan);
      return next;
    });
  }

  function createPlan() {
    const plan = createBlankWeeklyPlan();
    setState((current) => {
      const next = { ...current, plans: [plan, ...current.plans] };
      saveCache(next);
      return next;
    });
    queuePlanSave(plan);
    return plan.id;
  }

  async function removePlan(planId: string) {
    if (!client) return;
    const previous = state;
    const next = { ...state, plans: state.plans.filter((plan) => plan.id !== planId) };
    setState(next);
    saveCache(next);
    try {
      await deleteWeeklyPlan(client, userId, planId);
      setSyncStatus("synced");
    } catch (deleteError) {
      setState(previous);
      reportSaveError(deleteError);
    }
  }

  async function startSession(plan: WeeklyWorkoutPlan, dayId: string) {
    if (!client) return;
    const day = plan.days.find((item) => item.id === dayId);
    if (!day || day.isRestDay) return;
    setSyncStatus("saving");
    try {
      const session = await startWorkoutSession(client, userId, plan, day);
      setState((current) => {
        const next = { ...current, activeSession: session };
        saveCache(next);
        return next;
      });
      setSyncStatus("synced");
    } catch (sessionError) {
      reportSaveError(sessionError);
    }
  }

  function updateActiveSession(updater: (session: WorkoutSession) => WorkoutSession, persist: (session: WorkoutSession) => Promise<void>) {
    setState((current) => {
      if (!current.activeSession) return current;
      const session = updater(current.activeSession);
      const next = { ...current, activeSession: session };
      saveCache(next);
      setSyncStatus("saving");
      void persist(session).then(() => setSyncStatus("synced")).catch(reportSaveError);
      return next;
    });
  }

  function pauseSession() {
    if (!client) return;
    updateActiveSession((session) => pauseWorkoutSession(session), (session) => persistSessionTimer(client, userId, session));
  }

  function resumeSession() {
    if (!client) return;
    updateActiveSession((session) => resumeWorkoutSession(session), (session) => persistSessionTimer(client, userId, session));
  }

  function finishSession() {
    if (!client) return;
    updateActiveSession((session) => finishWorkoutSession(session), (session) => persistSessionTimer(client, userId, session));
  }

  function updateExerciseResult(exerciseId: string, changes: Partial<WorkoutSessionExercise>) {
    if (!client) return;
    updateActiveSession((session) => ({
      ...session,
      exercises: session.exercises.map((exercise) => exercise.id === exerciseId ? { ...exercise, ...changes } : exercise),
    }), async (session) => {
      const exercise = session.exercises.find((item) => item.id === exerciseId);
      if (exercise) await persistSessionExercise(client, userId, exercise);
    });
  }

  function updateSetResult(exerciseId: string, setId: string, changes: Partial<WorkoutSetResult>) {
    if (!client) return;
    updateActiveSession((session) => ({
      ...session,
      exercises: session.exercises.map((exercise) => exercise.id === exerciseId ? {
        ...exercise,
        sets: exercise.sets.map((set) => set.id === setId ? { ...set, ...changes } : set),
      } : exercise),
    }), async (session) => {
      const set = session.exercises.find((exercise) => exercise.id === exerciseId)?.sets.find((item) => item.id === setId);
      if (set) await persistSetResult(client, userId, set);
    });
  }

  function dismissCompletedSession() {
    setState((current) => {
      if (current.activeSession?.status !== "completed") return current;
      const next = { ...current, activeSession: null };
      saveCache(next);
      return next;
    });
  }

  return {
    state, syncStatus, error, createPlan, updatePlan, removePlan, startSession,
    pauseSession, resumeSession, finishSession, updateExerciseResult, updateSetResult,
    dismissCompletedSession,
  };
}
