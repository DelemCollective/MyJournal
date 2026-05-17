-- MyJournal Database Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query)

-- Profiles (auto-created on signup)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  preferred_language text default 'nl',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Habit lists (e.g. "Ochtend", "Avond")
create table if not exists public.habit_lists (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  trigger_time time,
  color text default '#4f46e5',
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- Individual habits
create table if not exists public.habits (
  id uuid default gen_random_uuid() primary key,
  list_id uuid references public.habit_lists(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- Daily habit completions
create table if not exists public.habit_completions (
  id uuid default gen_random_uuid() primary key,
  habit_id uuid references public.habits(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  completed_date date not null default current_date,
  created_at timestamptz default now(),
  unique(habit_id, completed_date)
);

-- Journal sessions (e.g. "Avond reflectie")
create table if not exists public.journal_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  time_of_day text check (time_of_day in ('morning', 'afternoon', 'evening', 'custom')) default 'evening',
  trigger_time time,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Questions per journal session
create table if not exists public.journal_questions (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.journal_sessions(id) on delete cascade not null,
  question_text_nl text not null,
  question_text_en text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- One journal entry per session per day
create table if not exists public.journal_entries (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.journal_sessions(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  entry_date date not null default current_date,
  free_text text,
  mood integer check (mood between 1 and 5),
  created_at timestamptz default now(),
  unique(session_id, user_id, entry_date)
);

-- Answers to the guided questions
create table if not exists public.journal_answers (
  id uuid default gen_random_uuid() primary key,
  entry_id uuid references public.journal_entries(id) on delete cascade not null,
  question_id uuid references public.journal_questions(id) on delete cascade not null,
  answer_text text,
  created_at timestamptz default now(),
  unique(entry_id, question_id)
);

-- =====================
-- Row Level Security
-- =====================

alter table public.profiles enable row level security;
alter table public.habit_lists enable row level security;
alter table public.habits enable row level security;
alter table public.habit_completions enable row level security;
alter table public.journal_sessions enable row level security;
alter table public.journal_questions enable row level security;
alter table public.journal_entries enable row level security;
alter table public.journal_answers enable row level security;

-- Profiles
create policy "profiles_own" on public.profiles for all using (auth.uid() = id);

-- Habit lists
create policy "habit_lists_own" on public.habit_lists for all using (auth.uid() = user_id);

-- Habits
create policy "habits_own" on public.habits for all using (auth.uid() = user_id);

-- Habit completions
create policy "habit_completions_own" on public.habit_completions for all using (auth.uid() = user_id);

-- Journal sessions
create policy "journal_sessions_own" on public.journal_sessions for all using (auth.uid() = user_id);

-- Journal questions (via session ownership)
create policy "journal_questions_own" on public.journal_questions for all using (
  exists (
    select 1 from public.journal_sessions
    where id = journal_questions.session_id and user_id = auth.uid()
  )
);

-- Journal entries
create policy "journal_entries_own" on public.journal_entries for all using (auth.uid() = user_id);

-- Journal answers (via entry ownership)
create policy "journal_answers_own" on public.journal_answers for all using (
  exists (
    select 1 from public.journal_entries
    where id = journal_answers.entry_id and user_id = auth.uid()
  )
);

-- =====================
-- Auto-create profile on signup
-- =====================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
