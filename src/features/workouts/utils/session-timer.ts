import type { WorkoutSession } from "../types/workout";

function secondsSince(value: string | null, now: Date) {
  return value ? Math.max(0, Math.floor((now.getTime() - new Date(value).getTime()) / 1000)) : 0;
}

export function pauseWorkoutSession(session: WorkoutSession, now = new Date()): WorkoutSession {
  if (session.status !== "in_progress") return session;
  return {
    ...session,
    status: "paused",
    elapsedSeconds: session.elapsedSeconds + secondsSince(session.timerStartedAt, now),
    timerStartedAt: null,
    updatedAt: now.toISOString(),
  };
}

export function resumeWorkoutSession(session: WorkoutSession, now = new Date()): WorkoutSession {
  if (session.status !== "paused") return session;
  return {
    ...session,
    status: "in_progress",
    pausedSeconds: session.pausedSeconds + secondsSince(session.updatedAt, now),
    timerStartedAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

export function finishWorkoutSession(session: WorkoutSession, now = new Date()): WorkoutSession {
  const wasRunning = session.status === "in_progress";
  const wasPaused = session.status === "paused";
  return {
    ...session,
    status: "completed",
    elapsedSeconds: session.elapsedSeconds + (wasRunning ? secondsSince(session.timerStartedAt, now) : 0),
    pausedSeconds: session.pausedSeconds + (wasPaused ? secondsSince(session.updatedAt, now) : 0),
    timerStartedAt: null,
    endedAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}
