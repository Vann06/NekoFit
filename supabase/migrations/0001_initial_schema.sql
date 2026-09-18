-- NekoFit · Esquema inicial para Supabase
-- Compatible con los modelos actuales del repositorio Vann06/NekoFit.
-- Ejecutar una sola vez desde Supabase > SQL Editor > New query.

begin;

create extension if not exists pgcrypto;

-- Actualiza updated_at automáticamente.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Perfil público-privado asociado al usuario autenticado de Supabase.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  birth_date date,
  height_cm numeric(5,2) check (height_cm is null or (height_cm > 0 and height_cm <= 300)),
  preferred_weight_unit text not null default 'kg' check (preferred_weight_unit in ('kg','lb')),
  timezone text not null default 'America/Guatemala',
  locale text not null default 'es-GT',
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Crea el perfil automáticamente después del primer login (Google u otro proveedor).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- También cubre usuarios que ya existieran antes de ejecutar esta migración.
insert into public.profiles (id, full_name, avatar_url)
select
  id,
  coalesce(raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'name'),
  coalesce(raw_user_meta_data ->> 'avatar_url', raw_user_meta_data ->> 'picture')
from auth.users
on conflict (id) do nothing;

-- Metas del módulo de nutrición. Una fila por usuario.
create table if not exists public.nutrition_goals (
  user_id uuid primary key references auth.users(id) on delete cascade,
  calories numeric(10,2) not null default 1900 check (calories >= 0),
  protein numeric(10,2) not null default 120 check (protein >= 0),
  carbs numeric(10,2) not null default 210 check (carbs >= 0),
  fat numeric(10,2) not null default 60 check (fat >= 0),
  fiber numeric(10,2) not null default 28 check (fiber >= 0),
  water_glasses smallint not null default 8 check (water_glasses between 0 and 30),
  meal_calories jsonb not null default '{"preWorkout":150,"breakfast":400,"postWorkout":200,"lunch":550,"snack":200,"dinner":400}'::jsonb
    check (jsonb_typeof(meal_calories) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Alimentos registrados en el diario. Conserva una fotografía de los datos
-- nutricionales usados al momento del registro.
create table if not exists public.food_entries (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  entry_date date not null,
  meal_key text not null check (meal_key in ('preWorkout','breakfast','postWorkout','lunch','snack','dinner')),
  food_id text not null,
  food_name text not null,
  food_detail text not null default '',
  serving_label text not null default '',
  serving_grams numeric(10,2) not null check (serving_grams > 0),
  measures jsonb,
  macros_per_100g jsonb not null check (jsonb_typeof(macros_per_100g) = 'object'),
  food_source text not null check (food_source in ('NekoFit','USDA')),
  grams numeric(10,2) not null check (grams > 0),
  amount numeric(10,3) check (amount is null or amount > 0),
  measure_label text,
  calories numeric(10,2) not null check (calories >= 0),
  protein numeric(10,2) not null check (protein >= 0),
  carbs numeric(10,2) not null check (carbs >= 0),
  fat numeric(10,2) not null check (fat >= 0),
  fiber numeric(10,2) not null check (fiber >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- Elementos del calendario/planificador de comidas.
create table if not exists public.meal_plan_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  plan_date date not null,
  meal_key text not null check (meal_key in ('preWorkout','breakfast','postWorkout','lunch','snack','dinner')),
  title text not null,
  subtitle text not null default '',
  calories numeric(10,2) not null default 0 check (calories >= 0),
  protein numeric(10,2) not null default 0 check (protein >= 0),
  kind text not null check (kind in ('food','recipe')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- Vasos de agua por día.
create table if not exists public.water_entries (
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null,
  glasses smallint not null default 0 check (glasses between 0 and 30),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, entry_date)
);

-- Peso, composición corporal y medidas.
create table if not exists public.progress_entries (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  entry_date date not null,
  weight_kg numeric(6,2) check (weight_kg is null or (weight_kg > 0 and weight_kg <= 500)),
  body_fat_percentage numeric(5,2) check (body_fat_percentage is null or body_fat_percentage between 0 and 100),
  muscle_mass_kg numeric(6,2) check (muscle_mass_kg is null or muscle_mass_kg between 0 and 500),
  body_water_percentage numeric(5,2) check (body_water_percentage is null or body_water_percentage between 0 and 100),
  waist_cm numeric(6,2) check (waist_cm is null or waist_cm > 0),
  hips_cm numeric(6,2) check (hips_cm is null or hips_cm > 0),
  chest_cm numeric(6,2) check (chest_cm is null or chest_cm > 0),
  thigh_cm numeric(6,2) check (thigh_cm is null or thigh_cm > 0),
  arm_cm numeric(6,2) check (arm_cm is null or arm_cm > 0),
  source text not null default 'manual' check (source in ('manual','apple_health','import')),
  source_record_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- Catálogo de planes semanales. Cada registro representa una semana completa
-- que puede reutilizarse, duplicarse o activarse para una fecha determinada.
create table if not exists public.weekly_workout_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  legacy_id text,
  name text not null,
  description text not null default '',
  objective text not null default '',
  is_template boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, id),
  unique (user_id, legacy_id)
);

-- Asigna un plan del catálogo a una semana real del calendario.
create table if not exists public.workout_week_schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  weekly_plan_id uuid not null,
  week_start_date date not null,
  status text not null default 'planned' check (status in ('planned','active','completed','skipped')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, id),
  unique (user_id, week_start_date),
  foreign key (user_id, weekly_plan_id)
    references public.weekly_workout_plans(user_id, id) on delete cascade
);

-- Días del plan semanal: día 1 a 7, enfoque y duración estimada.
create table if not exists public.workout_days (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  weekly_plan_id uuid not null,
  day_number smallint not null check (day_number between 1 and 7),
  day_name text not null,
  focus text not null default '',
  description text not null default '',
  estimated_minutes integer not null default 0 check (estimated_minutes >= 0),
  is_rest_day boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, id),
  unique (weekly_plan_id, day_number),
  foreign key (user_id, weekly_plan_id)
    references public.weekly_workout_plans(user_id, id) on delete cascade
);

-- Secciones ordenadas dentro de cada día.
create table if not exists public.workout_sections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_day_id uuid not null,
  section_type text not null check (section_type in ('warmup','workout','abs','cardio','cooldown')),
  title text not null,
  position smallint not null check (position > 0),
  estimated_minutes integer not null default 0 check (estimated_minutes >= 0),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, id),
  unique (workout_day_id, section_type),
  unique (workout_day_id, position),
  foreign key (user_id, workout_day_id)
    references public.workout_days(user_id, id) on delete cascade
);

-- Ejercicios planificados en cada sección, incluyendo su representación visual.
create table if not exists public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_section_id uuid not null,
  source_exercise_id text,
  name text not null,
  description text not null default '',
  instructions text not null default '',
  muscles jsonb not null default '[]'::jsonb check (jsonb_typeof(muscles) = 'array'),
  equipment jsonb not null default '[]'::jsonb check (jsonb_typeof(equipment) = 'array'),
  exercise_source text not null default 'NekoFit' check (exercise_source in ('NekoFit','WorkoutX','wger','custom')),
  media_type text not null default 'none' check (media_type in ('none','image','gif','video')),
  media_url text,
  thumbnail_url text,
  metric_type text not null default 'reps' check (metric_type in ('reps','duration','distance')),
  position smallint not null check (position > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, id),
  unique (workout_section_id, position),
  foreign key (user_id, workout_section_id)
    references public.workout_sections(user_id, id) on delete cascade,
  check (media_type = 'none' or media_url is not null)
);

-- Tabla planificada de sets. Permite que cada set tenga metas diferentes.
create table if not exists public.workout_exercise_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_exercise_id uuid not null,
  set_number smallint not null check (set_number > 0),
  set_type text not null default 'working' check (set_type in ('warmup','working','drop','amrap')),
  target_reps text,
  target_weight numeric(8,2) check (target_weight is null or target_weight >= 0),
  weight_unit text check (weight_unit is null or weight_unit in ('kg','lb')),
  target_duration_seconds integer check (target_duration_seconds is null or target_duration_seconds >= 0),
  target_distance numeric(10,3) check (target_distance is null or target_distance >= 0),
  distance_unit text check (distance_unit is null or distance_unit in ('km','mi','m')),
  rest_seconds integer not null default 0 check (rest_seconds >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, id),
  unique (workout_exercise_id, set_number),
  foreign key (user_id, workout_exercise_id)
    references public.workout_exercises(user_id, id) on delete cascade
);

-- Ejecución de un día de entrenamiento. Guarda el timer aun si se pausa.
create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_schedule_id uuid,
  weekly_plan_id uuid,
  workout_day_id uuid,
  scheduled_date date not null,
  name text not null,
  focus text not null default '',
  status text not null default 'planned' check (status in ('planned','in_progress','paused','completed','skipped')),
  started_at timestamptz,
  timer_started_at timestamptz,
  ended_at timestamptz,
  elapsed_seconds integer not null default 0 check (elapsed_seconds >= 0),
  paused_seconds integer not null default 0 check (paused_seconds >= 0),
  active_calories numeric(10,2) check (active_calories is null or active_calories >= 0),
  notes text not null default '',
  source text not null default 'manual' check (source in ('manual','apple_health','import')),
  source_record_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, id),
  foreign key (user_id, week_schedule_id)
    references public.workout_week_schedules(user_id, id) on delete set null (week_schedule_id),
  foreign key (user_id, weekly_plan_id)
    references public.weekly_workout_plans(user_id, id) on delete set null (weekly_plan_id),
  foreign key (user_id, workout_day_id)
    references public.workout_days(user_id, id) on delete set null (workout_day_id),
  check (ended_at is null or started_at is null or ended_at >= started_at)
);

-- Resultado de cada ejercicio en una sesión. Conserva nombre y multimedia
-- aunque el plan semanal se edite posteriormente.
create table if not exists public.workout_session_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_session_id uuid not null,
  planned_exercise_id uuid,
  section_type text not null check (section_type in ('warmup','workout','abs','cardio','cooldown')),
  exercise_name text not null,
  instructions text not null default '',
  media_type text not null default 'none' check (media_type in ('none','image','gif','video')),
  media_url text,
  position smallint not null check (position > 0),
  completed boolean not null default false,
  completed_at timestamptz,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, id),
  unique (workout_session_id, section_type, position),
  foreign key (user_id, workout_session_id)
    references public.workout_sessions(user_id, id) on delete cascade,
  foreign key (user_id, planned_exercise_id)
    references public.workout_exercises(user_id, id) on delete set null (planned_exercise_id),
  check (media_type = 'none' or media_url is not null)
);

-- Mini tabla real de cada ejercicio: peso, unidad, repeticiones y check por set.
create table if not exists public.workout_set_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_exercise_id uuid not null,
  planned_set_id uuid,
  set_number smallint not null check (set_number > 0),
  target_reps text,
  actual_reps text,
  target_weight numeric(8,2) check (target_weight is null or target_weight >= 0),
  actual_weight numeric(8,2) check (actual_weight is null or actual_weight >= 0),
  weight_unit text check (weight_unit is null or weight_unit in ('kg','lb')),
  target_duration_seconds integer check (target_duration_seconds is null or target_duration_seconds >= 0),
  actual_duration_seconds integer check (actual_duration_seconds is null or actual_duration_seconds >= 0),
  target_distance numeric(10,3) check (target_distance is null or target_distance >= 0),
  actual_distance numeric(10,3) check (actual_distance is null or actual_distance >= 0),
  distance_unit text check (distance_unit is null or distance_unit in ('km','mi','m')),
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, id),
  unique (session_exercise_id, set_number),
  foreign key (user_id, session_exercise_id)
    references public.workout_session_exercises(user_id, id) on delete cascade,
  foreign key (user_id, planned_set_id)
    references public.workout_exercise_sets(user_id, id) on delete set null (planned_set_id)
);

-- Lista de compras (actualmente solo vive en memoria en la interfaz).
create table if not exists public.shopping_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  name text not null check (char_length(trim(name)) > 0),
  quantity text not null default '1 unidad',
  category text not null check (category in ('Frutas','Verduras','Proteínas','Cereales','Lácteos','Grasas','Azúcares')),
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- Favoritos del recetario local o de Spoonacular.
create table if not exists public.recipe_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  recipe_id text not null,
  recipe_source text check (recipe_source is null or recipe_source in ('NekoFit','Spoonacular')),
  recipe_snapshot jsonb check (recipe_snapshot is null or jsonb_typeof(recipe_snapshot) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, recipe_id)
);

-- Armario. Admite sprites incluidos, cargas locales antiguas y Cloudinary.
create table if not exists public.wardrobe_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  name text not null,
  category text not null check (category in ('Tops','Bottoms','Zapatos')),
  image_kind text not null check (image_kind in ('sprite','upload','cloudinary')),
  image_position text,
  image_size text,
  image_data_url text,
  cloudinary_public_id text,
  cloudinary_original_url text,
  cloudinary_display_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id),
  check (
    (image_kind = 'sprite' and image_position is not null)
    or (image_kind = 'upload' and image_data_url is not null)
    or (image_kind = 'cloudinary' and cloudinary_public_id is not null and cloudinary_original_url is not null and cloudinary_display_url is not null)
  )
);

-- Resumen diario para el dashboard y futuros datos agregados de Apple Health.
create table if not exists public.daily_activity (
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_date date not null,
  steps integer not null default 0 check (steps >= 0),
  active_calories numeric(10,2) not null default 0 check (active_calories >= 0),
  distance_km numeric(10,3) not null default 0 check (distance_km >= 0),
  exercise_minutes integer not null default 0 check (exercise_minutes >= 0),
  source text not null default 'manual' check (source in ('manual','apple_health','import','mixed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, activity_date)
);

-- Muestras detalladas de Apple Health. external_id evita importar dos veces
-- la misma muestra cuando exista un identificador de origen.
create table if not exists public.health_samples (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sample_type text not null check (char_length(trim(sample_type)) > 0),
  start_at timestamptz not null,
  end_at timestamptz not null,
  value numeric(18,6) not null,
  unit text not null,
  source_name text,
  source_bundle_id text,
  external_id text,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_at >= start_at)
);

create unique index if not exists health_samples_external_id_unique
  on public.health_samples (user_id, sample_type, external_id)
  where external_id is not null;

-- Estado de sincronización con Apple Health / Atajos.
create table if not exists public.health_sync_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  sync_method text check (sync_method is null or sync_method in ('shortcut','native_ios','manual_import')),
  last_synced_at timestamptz,
  sync_cursor text,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Controla la importación única de IndexedDB/localStorage a Supabase.
create table if not exists public.data_migrations (
  user_id uuid not null references auth.users(id) on delete cascade,
  migration_key text not null,
  completed_at timestamptz not null default now(),
  details jsonb not null default '{}'::jsonb check (jsonb_typeof(details) = 'object'),
  primary key (user_id, migration_key)
);

-- Índices de las consultas principales.
create index if not exists food_entries_user_date_idx on public.food_entries (user_id, entry_date desc);
create index if not exists food_entries_user_date_meal_idx on public.food_entries (user_id, entry_date, meal_key);
create index if not exists meal_plan_items_user_date_idx on public.meal_plan_items (user_id, plan_date);
create index if not exists progress_entries_user_date_idx on public.progress_entries (user_id, entry_date desc);
create unique index if not exists progress_entries_source_unique
  on public.progress_entries (user_id, source, source_record_id)
  where source_record_id is not null;
create index if not exists weekly_workout_plans_user_updated_idx on public.weekly_workout_plans (user_id, updated_at desc);
create index if not exists workout_week_schedules_user_week_idx on public.workout_week_schedules (user_id, week_start_date desc);
create index if not exists workout_days_plan_day_idx on public.workout_days (weekly_plan_id, day_number);
create index if not exists workout_sections_day_position_idx on public.workout_sections (workout_day_id, position);
create index if not exists workout_exercises_section_position_idx on public.workout_exercises (workout_section_id, position);
create index if not exists workout_exercise_sets_exercise_set_idx on public.workout_exercise_sets (workout_exercise_id, set_number);
create index if not exists workout_sessions_user_date_idx on public.workout_sessions (user_id, scheduled_date desc);
create index if not exists workout_session_exercises_session_idx on public.workout_session_exercises (workout_session_id, section_type, position);
create index if not exists workout_set_results_exercise_idx on public.workout_set_results (session_exercise_id, set_number);
create unique index if not exists workout_sessions_source_unique
  on public.workout_sessions (user_id, source, source_record_id)
  where source_record_id is not null;
create index if not exists shopping_items_user_completed_idx on public.shopping_items (user_id, completed, created_at);
create index if not exists wardrobe_items_user_category_idx on public.wardrobe_items (user_id, category);
create index if not exists health_samples_user_type_start_idx on public.health_samples (user_id, sample_type, start_at desc);

-- Triggers updated_at.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles', 'nutrition_goals', 'food_entries', 'meal_plan_items',
    'water_entries', 'progress_entries', 'weekly_workout_plans', 'workout_week_schedules', 'workout_days',
    'workout_sections', 'workout_exercises', 'workout_exercise_sets',
    'workout_sessions', 'workout_session_exercises', 'workout_set_results', 'shopping_items',
    'recipe_favorites', 'wardrobe_items', 'daily_activity', 'health_samples',
    'health_sync_state'
  ]
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', table_name);
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      table_name
    );
  end loop;
end;
$$;

-- Seguridad: ningún usuario anónimo puede leer las tablas.
revoke all on table
  public.profiles,
  public.nutrition_goals,
  public.food_entries,
  public.meal_plan_items,
  public.water_entries,
  public.progress_entries,
  public.weekly_workout_plans,
  public.workout_week_schedules,
  public.workout_days,
  public.workout_sections,
  public.workout_exercises,
  public.workout_exercise_sets,
  public.workout_sessions,
  public.workout_session_exercises,
  public.workout_set_results,
  public.shopping_items,
  public.recipe_favorites,
  public.wardrobe_items,
  public.daily_activity,
  public.health_samples,
  public.health_sync_state,
  public.data_migrations
from anon;

grant select, insert, update, delete on table
  public.profiles,
  public.nutrition_goals,
  public.food_entries,
  public.meal_plan_items,
  public.water_entries,
  public.progress_entries,
  public.weekly_workout_plans,
  public.workout_week_schedules,
  public.workout_days,
  public.workout_sections,
  public.workout_exercises,
  public.workout_exercise_sets,
  public.workout_sessions,
  public.workout_session_exercises,
  public.workout_set_results,
  public.shopping_items,
  public.recipe_favorites,
  public.wardrobe_items,
  public.daily_activity,
  public.health_samples,
  public.health_sync_state,
  public.data_migrations
to authenticated;

-- RLS especial para profiles, cuya columna de usuario se llama id.
alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- RLS común para todas las tablas que utilizan user_id.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'nutrition_goals', 'food_entries', 'meal_plan_items', 'water_entries',
    'progress_entries', 'weekly_workout_plans', 'workout_week_schedules', 'workout_days', 'workout_sections',
    'workout_exercises', 'workout_exercise_sets', 'workout_sessions',
    'workout_session_exercises', 'workout_set_results', 'shopping_items', 'recipe_favorites',
    'wardrobe_items', 'daily_activity', 'health_samples', 'health_sync_state',
    'data_migrations'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);

    execute format('drop policy if exists "Users can view own rows" on public.%I', table_name);
    execute format(
      'create policy "Users can view own rows" on public.%I for select to authenticated using ((select auth.uid()) = user_id)',
      table_name
    );

    execute format('drop policy if exists "Users can insert own rows" on public.%I', table_name);
    execute format(
      'create policy "Users can insert own rows" on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)',
      table_name
    );

    execute format('drop policy if exists "Users can update own rows" on public.%I', table_name);
    execute format(
      'create policy "Users can update own rows" on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)',
      table_name
    );

    execute format('drop policy if exists "Users can delete own rows" on public.%I', table_name);
    execute format(
      'create policy "Users can delete own rows" on public.%I for delete to authenticated using ((select auth.uid()) = user_id)',
      table_name
    );
  end loop;
end;
$$;

commit;
