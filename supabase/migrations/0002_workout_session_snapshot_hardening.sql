-- Ejecutar después de 0001 si el esquema inicial ya se aplicó antes de que
-- las sesiones guardaran instrucciones y validaran pertenencia en sus FKs.
begin;

alter table public.workout_session_exercises
  add column if not exists instructions text not null default '';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'workout_sessions_schedule_owner_fkey') then
    alter table public.workout_sessions add constraint workout_sessions_schedule_owner_fkey
      foreign key (user_id, week_schedule_id)
      references public.workout_week_schedules(user_id, id) on delete set null (week_schedule_id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'workout_sessions_plan_owner_fkey') then
    alter table public.workout_sessions add constraint workout_sessions_plan_owner_fkey
      foreign key (user_id, weekly_plan_id)
      references public.weekly_workout_plans(user_id, id) on delete set null (weekly_plan_id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'workout_sessions_day_owner_fkey') then
    alter table public.workout_sessions add constraint workout_sessions_day_owner_fkey
      foreign key (user_id, workout_day_id)
      references public.workout_days(user_id, id) on delete set null (workout_day_id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'workout_session_exercises_plan_owner_fkey') then
    alter table public.workout_session_exercises add constraint workout_session_exercises_plan_owner_fkey
      foreign key (user_id, planned_exercise_id)
      references public.workout_exercises(user_id, id) on delete set null (planned_exercise_id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'workout_set_results_plan_owner_fkey') then
    alter table public.workout_set_results add constraint workout_set_results_plan_owner_fkey
      foreign key (user_id, planned_set_id)
      references public.workout_exercise_sets(user_id, id) on delete set null (planned_set_id);
  end if;
end;
$$;

commit;
