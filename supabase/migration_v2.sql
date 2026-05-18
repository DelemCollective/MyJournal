-- Migration v2: Add display_name to profiles
-- Run this in Supabase SQL Editor

-- 1. Add display_name column
alter table public.profiles add column if not exists display_name text;

-- 2. Update trigger to capture name from signup metadata
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'display_name'
  )
  on conflict (id) do update set
    email = excluded.email,
    display_name = coalesce(profiles.display_name, excluded.display_name);
  return new;
end;
$$;

-- 3. Set your name (run once)
update public.profiles set display_name = 'Ilias' where email = 'hi@iliasdelem.com';
