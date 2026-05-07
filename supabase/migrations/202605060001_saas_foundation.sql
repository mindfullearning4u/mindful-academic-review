create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  subscription_tier text not null default 'premium'
    check (subscription_tier in ('basic', 'premium', 'graduate_research')),
  subscription_status text not null default 'active'
    check (subscription_status in ('active', 'trialing', 'past_due', 'canceled', 'inactive')),
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  course_level text not null,
  service_tier text not null default 'Premium',
  assignment_type text not null,
  assignment_prompt text not null,
  assignment_requirements text not null,
  rubric text,
  citation_style text not null default 'APA',
  feedback_focus text[] not null default '{}',
  instructor_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, course_level, name)
);

create table if not exists public.assignment_prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  template_id uuid references public.templates(id) on delete set null,
  name text not null,
  course_level text not null,
  assignment_type text not null,
  assignment_prompt text not null,
  assignment_requirements text not null,
  rubric text,
  citation_style text not null default 'APA',
  feedback_focus text[] not null default '{}',
  service_tier text not null default 'Premium',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, course_level, name)
);

create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  event_type text not null,
  service_tier text,
  assignment_type text,
  citation_style text,
  prompt_char_count integer not null default 0,
  requirements_char_count integer not null default 0,
  rubric_char_count integer not null default 0,
  submission_char_count integer not null default 0,
  feedback_focus text[] not null default '{}',
  success boolean not null default true,
  error_code text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists templates_user_course_idx
  on public.templates(user_id, course_level, name);

create index if not exists assignment_prompts_user_course_idx
  on public.assignment_prompts(user_id, course_level, name);

create index if not exists usage_events_user_created_idx
  on public.usage_events(user_id, created_at desc);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_templates_updated_at on public.templates;
create trigger set_templates_updated_at
before update on public.templates
for each row execute function public.set_updated_at();

drop trigger if exists set_assignment_prompts_updated_at on public.assignment_prompts;
create trigger set_assignment_prompts_updated_at
before update on public.assignment_prompts
for each row execute function public.set_updated_at();

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
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.templates enable row level security;
alter table public.assignment_prompts enable row level security;
alter table public.usage_events enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can read their own templates" on public.templates;
create policy "Users can read their own templates"
on public.templates for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own templates" on public.templates;
create policy "Users can insert their own templates"
on public.templates for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own templates" on public.templates;
create policy "Users can update their own templates"
on public.templates for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own templates" on public.templates;
create policy "Users can delete their own templates"
on public.templates for delete
using (auth.uid() = user_id);

drop policy if exists "Users can read their own assignment prompts" on public.assignment_prompts;
create policy "Users can read their own assignment prompts"
on public.assignment_prompts for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own assignment prompts" on public.assignment_prompts;
create policy "Users can insert their own assignment prompts"
on public.assignment_prompts for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own assignment prompts" on public.assignment_prompts;
create policy "Users can update their own assignment prompts"
on public.assignment_prompts for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own assignment prompts" on public.assignment_prompts;
create policy "Users can delete their own assignment prompts"
on public.assignment_prompts for delete
using (auth.uid() = user_id);

drop policy if exists "Users can read their own usage events" on public.usage_events;
create policy "Users can read their own usage events"
on public.usage_events for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own usage events" on public.usage_events;
create policy "Users can insert their own usage events"
on public.usage_events for insert
with check (auth.uid() = user_id);
