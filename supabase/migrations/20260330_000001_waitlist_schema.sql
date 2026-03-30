create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.waitlist_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  first_name text,
  referral_code text not null unique,
  referred_by_user_id uuid references public.waitlist_users(id) on delete set null,
  referral_count integer not null default 0 check (referral_count >= 0),
  status text not null default 'waiting' check (status in ('waiting', 'early_access', 'invited', 'archived')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_user_id uuid not null references public.waitlist_users(id) on delete cascade,
  referred_user_id uuid not null unique references public.waitlist_users(id) on delete cascade,
  referral_code_used text not null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint referrer_not_referred check (referrer_user_id <> referred_user_id)
);

create table if not exists public.admin_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique,
  email text not null unique,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists waitlist_users_referral_count_idx
  on public.waitlist_users (referral_count desc, created_at asc);

create index if not exists waitlist_users_referred_by_idx
  on public.waitlist_users (referred_by_user_id);

create index if not exists referrals_referrer_idx
  on public.referrals (referrer_user_id);

create trigger set_waitlist_users_updated_at
before update on public.waitlist_users
for each row
execute function public.set_updated_at();

create trigger set_admin_profiles_updated_at
before update on public.admin_profiles
for each row
execute function public.set_updated_at();

alter table public.waitlist_users enable row level security;
alter table public.referrals enable row level security;
alter table public.admin_profiles enable row level security;
