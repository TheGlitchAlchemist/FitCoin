-- ═══════════════════════════════════════════════════════════════════════════
-- PASO 8 — Blindaje de la economía FitCoin
-- Ejecutar COMPLETO en Supabase → SQL Editor
--
-- Objetivo: que sea IMPOSIBLE crear/modificar monedas desde la app, scripts,
-- Postman o la API REST. Toda moneda debe nacer de una RPC validada:
--   • sync_daily_activity  → gana FC caminando (con antifraude)
--   • redeem_offer         → gasta FC canjeando
--
-- Defensa en 3 capas sobre wallets, coin_transactions,
-- activity_daily_summaries y redemptions:
--   1. REVOKE de INSERT/UPDATE/DELETE para los roles de cliente
--   2. Eliminación de TODA política RLS de escritura que exista
--   3. Constraints de integridad a nivel de tabla
--
-- Las RPC no se ven afectadas: son SECURITY DEFINER (corren como el dueño
-- de la base, que conserva todos los permisos).
-- ═══════════════════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────────────────────
-- 1. CAPA 1: revocar TODO permiso de escritura a los roles de cliente
--    (anon = sin sesión, authenticated = usuario logueado en la app)
-- ─────────────────────────────────────────────────────────────────────────────
revoke insert, update, delete, truncate
  on public.wallets,
     public.coin_transactions,
     public.activity_daily_summaries,
     public.redemptions
  from public, anon, authenticated;

-- La app solo necesita LEER (y solo lo suyo, filtrado por RLS)
grant select on public.wallets                  to authenticated;
grant select on public.coin_transactions        to authenticated;
grant select on public.activity_daily_summaries to authenticated;
grant select on public.redemptions              to authenticated;

-- anon (sin sesión) no tiene nada que hacer en estas tablas
revoke select on public.wallets,
                 public.coin_transactions,
                 public.activity_daily_summaries,
                 public.redemptions
  from anon;


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. CAPA 2: eliminar toda política RLS de escritura en las tablas del dinero
--    (por ejemplo la vieja "wallets_update_own", que permitía a un usuario
--     ponerse el saldo que quisiera con una llamada a la API)
-- ─────────────────────────────────────────────────────────────────────────────
do $$
declare pol record;
begin
  for pol in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('wallets', 'coin_transactions',
                        'activity_daily_summaries', 'redemptions')
      and cmd <> 'SELECT'   -- conservar solo las políticas de lectura
  loop
    execute format('drop policy %I on %I.%I',
                   pol.policyname, pol.schemaname, pol.tablename);
    raise notice 'Política de escritura eliminada: % en %', pol.policyname, pol.tablename;
  end loop;
end $$;

-- Asegurar que RLS esté activo en las 4 tablas
alter table public.wallets                  enable row level security;
alter table public.coin_transactions        enable row level security;
alter table public.activity_daily_summaries enable row level security;
alter table public.redemptions              enable row level security;


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. CAPA 3: constraints de integridad (ni un bug en las RPC puede romperlas)
--    NOT VALID = aplican a filas nuevas sin fallar por datos históricos
-- ─────────────────────────────────────────────────────────────────────────────

-- El saldo jamás puede ser negativo (re-asegurar por si no existe)
do $$ begin
  alter table public.wallets
    add constraint wallets_balance_nonnegative check (balance >= 0);
exception when duplicate_object then null;
end $$;

-- Máximo 12 FC ganados por día por caminar
do $$ begin
  alter table public.activity_daily_summaries
    add constraint activity_daily_fc_cap
    check (fitcoins_earned >= 0 and fitcoins_earned <= 12) not valid;
exception when duplicate_object then null;
end $$;

-- Pasos diarios dentro de un rango humano
do $$ begin
  alter table public.activity_daily_summaries
    add constraint activity_daily_steps_range
    check (steps >= 0 and steps <= 200000) not valid;
exception when duplicate_object then null;
end $$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Re-asegurar que solo usuarios logueados pueden ejecutar las RPC
-- ─────────────────────────────────────────────────────────────────────────────
do $$
declare r record;
begin
  for r in
    select oid::regprocedure as sig
    from pg_proc
    where proname in ('sync_daily_activity', 'redeem_offer')
      and pronamespace = 'public'::regnamespace
  loop
    execute format('revoke all on function %s from public, anon', r.sig);
    execute format('grant execute on function %s to authenticated', r.sig);
  end loop;
end $$;


-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFICACIÓN (ejecutar después; resultados esperados en los comentarios)
-- ═══════════════════════════════════════════════════════════════════════════

-- A) Permisos de los roles de cliente sobre las tablas del dinero.
--    Esperado: SOLO filas con privilege_type = 'SELECT' y grantee = 'authenticated'
select table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('wallets', 'coin_transactions',
                     'activity_daily_summaries', 'redemptions')
  and grantee in ('anon', 'authenticated')
order by table_name, grantee, privilege_type;

-- B) Políticas RLS restantes.
--    Esperado: SOLO políticas con cmd = 'SELECT'
select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('wallets', 'coin_transactions',
                    'activity_daily_summaries', 'redemptions')
order by tablename;
