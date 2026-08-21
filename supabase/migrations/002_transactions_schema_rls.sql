-- ============================================================================
-- Migration: schema das tabelas transactions e recurring_transactions
-- com Row Level Security (RLS).
--
-- IMPORTANTE: revise antes de aplicar. Se as tabelas já existirem no seu
-- projeto Supabase, ajuste os comandos (ou remova os CREATE TABLE) — as
-- políticas usam DROP POLICY IF EXISTS para poderem ser reaplicadas.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- transactions
-- ---------------------------------------------------------------------------
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  amount numeric(12, 2) not null check (amount > 0),
  currency text not null default 'BRL',
  category text,
  description text,
  date date not null,
  is_recurring boolean not null default false,
  recurring_frequency text check (recurring_frequency in ('weekly', 'monthly')),
  created_at timestamptz not null default now()
);

create index if not exists idx_transactions_user_date
  on public.transactions (user_id, date desc);

alter table public.transactions enable row level security;

drop policy if exists "Usuário pode ver as próprias transações"
  on public.transactions;
create policy "Usuário pode ver as próprias transações"
  on public.transactions for select
  using (auth.uid() = user_id);

drop policy if exists "Usuário pode inserir as próprias transações"
  on public.transactions;
create policy "Usuário pode inserir as próprias transações"
  on public.transactions for insert
  with check (auth.uid() = user_id);

drop policy if exists "Usuário pode atualizar as próprias transações"
  on public.transactions;
create policy "Usuário pode atualizar as próprias transações"
  on public.transactions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Usuário pode excluir as próprias transações"
  on public.transactions;
create policy "Usuário pode excluir as próprias transações"
  on public.transactions for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- recurring_transactions
-- ---------------------------------------------------------------------------
create table if not exists public.recurring_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  amount numeric(12, 2) not null check (amount > 0),
  currency text not null default 'BRL',
  category text,
  description text,
  frequency text not null check (frequency in ('weekly', 'monthly')),
  next_date date not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.recurring_transactions enable row level security;

drop policy if exists "Usuário pode gerenciar as próprias recorrências"
  on public.recurring_transactions;
create policy "Usuário pode gerenciar as próprias recorrências"
  on public.recurring_transactions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
