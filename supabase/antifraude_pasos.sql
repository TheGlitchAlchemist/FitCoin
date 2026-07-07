-- ═══════════════════════════════════════════════════════════════════════════
-- FitCoin — Sistema antifraude de pasos (server-side)
-- Ejecutar COMPLETO en Supabase → SQL Editor
--
-- Qué hace:
--   1. Agrega columnas de control diario a activity_daily_summaries
--   2. Garantiza un solo registro por usuario por día (unique user_id + fecha)
--   3. Agrega tipo de transacción a coin_transactions
--   4. Crea la RPC sync_daily_activity con validación de pasos/minuto (máx 180)
--   5. Penaliza -1 FC la actividad sospechosa (sin permitir saldo negativo)
--   6. RLS: cada usuario solo ve sus propios datos
--   7. Elimina la RPC vieja sync_step_activity (el cliente ya no decide monedas)
-- ═══════════════════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────────────────────
-- 1. COLUMNAS NUEVAS EN activity_daily_summaries
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.activity_daily_summaries
  add column if not exists last_valid_steps    integer      not null default 0,
  add column if not exists last_synced_steps   integer      not null default 0,
  add column if not exists distance_km         numeric(8,3) not null default 0,
  add column if not exists active_minutes      integer      not null default 0,
  add column if not exists fitcoins_earned     integer      not null default 0,
  add column if not exists suspicious_attempts integer      not null default 0,
  add column if not exists last_sync_at        timestamptz  not null default now(),
  add column if not exists created_at          timestamptz  not null default now(),
  add column if not exists updated_at          timestamptz  not null default now();

-- Cualquier columna NOT NULL sin default que tenga la tabla (p. ej. provider,
-- distance_meters, calories de versiones anteriores) recibe un default seguro
-- para que la RPC pueda insertar sin conocerlas.
do $$
declare col record;
begin
  for col in
    select column_name, data_type
    from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'activity_daily_summaries'
      and is_nullable  = 'NO'
      and column_default is null
      and column_name not in ('id', 'user_id', 'activity_date')
  loop
    if col.data_type in ('integer','bigint','smallint','numeric','double precision','real') then
      execute format('alter table public.activity_daily_summaries alter column %I set default 0', col.column_name);
    elsif col.data_type in ('text','character varying') then
      execute format('alter table public.activity_daily_summaries alter column %I set default %L', col.column_name, 'mobile');
    elsif col.data_type like 'timestamp%' then
      execute format('alter table public.activity_daily_summaries alter column %I set default now()', col.column_name);
    elsif col.data_type = 'boolean' then
      execute format('alter table public.activity_daily_summaries alter column %I set default false', col.column_name);
    end if;
  end loop;
end $$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. UN SOLO REGISTRO POR USUARIO POR DÍA
-- ─────────────────────────────────────────────────────────────────────────────
-- Quitar constraints únicos viejos que incluían provider
do $$
declare r record;
begin
  for r in
    select conname
    from pg_constraint
    where conrelid = 'public.activity_daily_summaries'::regclass
      and contype = 'u'
  loop
    execute format('alter table public.activity_daily_summaries drop constraint %I', r.conname);
  end loop;
end $$;

-- Deduplicar: si había varios registros el mismo día (uno por provider),
-- conservar el que tenga más pasos
delete from public.activity_daily_summaries a
using public.activity_daily_summaries b
where a.user_id       = b.user_id
  and a.activity_date = b.activity_date
  and a.id           <> b.id
  and (a.steps < b.steps or (a.steps = b.steps and a.id < b.id));

create unique index if not exists activity_daily_user_date_uq
  on public.activity_daily_summaries (user_id, activity_date);

create index if not exists activity_daily_user_idx
  on public.activity_daily_summaries (user_id, activity_date desc);


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. coin_transactions: tipo de movimiento
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.coin_transactions
  add column if not exists amount      integer,
  add column if not exists description text,
  add column if not exists type        text not null default 'earned_activity';

-- Normalizar tipos viejos antes de aplicar el check
update public.coin_transactions
set type = 'earned_activity'
where type is null
   or type not in ('earned_activity', 'penalty_suspicious_activity', 'spent_redemption');

alter table public.coin_transactions
  drop constraint if exists coin_transactions_type_check;
alter table public.coin_transactions
  add constraint coin_transactions_type_check
  check (type in ('earned_activity', 'penalty_suspicious_activity', 'spent_redemption'));

-- Defaults seguros para columnas NOT NULL sin default (igual que arriba)
do $$
declare col record;
begin
  for col in
    select column_name, data_type
    from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'coin_transactions'
      and is_nullable  = 'NO'
      and column_default is null
      and column_name not in ('id', 'user_id')
  loop
    if col.data_type in ('integer','bigint','smallint','numeric') then
      execute format('alter table public.coin_transactions alter column %I set default 0', col.column_name);
    elsif col.data_type in ('text','character varying') then
      execute format('alter table public.coin_transactions alter column %I set default %L', col.column_name, '');
    elsif col.data_type like 'timestamp%' then
      execute format('alter table public.coin_transactions alter column %I set default now()', col.column_name);
    end if;
  end loop;
end $$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. wallets: nunca saldo negativo
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.wallets
  add column if not exists updated_at timestamptz not null default now();

alter table public.wallets
  drop constraint if exists wallets_balance_nonnegative;
alter table public.wallets
  add constraint wallets_balance_nonnegative check (balance >= 0);


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. audit_logs: columnas mínimas para registrar eventos sospechosos
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.audit_logs
  add column if not exists user_id    uuid,
  add column if not exists action     text,
  add column if not exists details    jsonb,
  add column if not exists created_at timestamptz not null default now();

do $$
declare col record;
begin
  for col in
    select column_name, data_type
    from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'audit_logs'
      and is_nullable  = 'NO'
      and column_default is null
      and column_name not in ('id')
  loop
    if col.data_type in ('integer','bigint','smallint','numeric') then
      execute format('alter table public.audit_logs alter column %I set default 0', col.column_name);
    elsif col.data_type in ('text','character varying') then
      execute format('alter table public.audit_logs alter column %I set default %L', col.column_name, '');
    elsif col.data_type like 'timestamp%' then
      execute format('alter table public.audit_logs alter column %I set default now()', col.column_name);
    elsif col.data_type = 'jsonb' then
      execute format('alter table public.audit_logs alter column %I set default %L::jsonb', col.column_name, '{}');
    elsif col.data_type = 'uuid' then
      null; -- se llena en el insert
    end if;
  end loop;
end $$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Trigger updated_at
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists set_updated_at on public.activity_daily_summaries;
create trigger set_updated_at
  before update on public.activity_daily_summaries
  for each row execute function public.tg_set_updated_at();

drop trigger if exists set_updated_at on public.wallets;
create trigger set_updated_at
  before update on public.wallets
  for each row execute function public.tg_set_updated_at();


-- ─────────────────────────────────────────────────────────────────────────────
-- 7. RPC PRINCIPAL: sync_daily_activity
--    El frontend SOLO manda pasos actuales; el servidor valida y decide todo.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.sync_daily_activity(
  p_current_steps integer,
  p_activity_date date default (now() at time zone 'utc')::date
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  -- Reglas
  c_max_steps_per_minute constant numeric := 180;   -- caminar rápido/correr ≈ 120-180
  c_steps_per_coin       constant integer := 1000;  -- 1000 pasos = 1 FC
  c_daily_fc_cap         constant integer := 12;    -- máx 12 FC/día
  c_min_window_minutes   constant numeric := 0.5;   -- ventana mínima anti div/0
  c_max_daily_steps      constant integer := 200000;

  v_user       uuid := auth.uid();
  v_rec        public.activity_daily_summaries%rowtype;
  v_delta      integer;
  v_minutes    numeric;
  v_rate       numeric;
  v_new_steps  integer;
  v_total_fc   integer;
  v_new_fc     integer := 0;
  v_balance    integer;
  v_penalty    boolean := false;
begin
  if v_user is null then
    raise exception 'No autenticado';
  end if;
  if p_current_steps is null or p_current_steps < 0 or p_current_steps > c_max_daily_steps then
    raise exception 'Cantidad de pasos inválida';
  end if;

  -- Registro diario: crear si no existe.
  -- last_sync_at inicia a MEDIANOCHE para que el primer sync del día
  -- tenga una ventana de tiempo real (pasos desde que empezó el día).
  insert into public.activity_daily_summaries
    (user_id, activity_date, steps, last_valid_steps, last_synced_steps,
     fitcoins_earned, suspicious_attempts, last_sync_at)
  values
    (v_user, p_activity_date, 0, 0, 0, 0, 0, p_activity_date::timestamptz)
  on conflict (user_id, activity_date) do nothing;

  select * into v_rec
  from public.activity_daily_summaries
  where user_id = v_user and activity_date = p_activity_date
  for update;

  -- Wallet (crear si no existe) y bloquear la fila
  select balance into v_balance
  from public.wallets where user_id = v_user for update;

  if v_balance is null then
    insert into public.wallets (user_id, balance)
    values (v_user, 0)
    on conflict (user_id) do nothing;

    select balance into v_balance
    from public.wallets where user_id = v_user for update;
  end if;

  v_delta := p_current_steps - v_rec.last_synced_steps;

  -- Sin pasos nuevos: solo actualizar timestamp
  if v_delta <= 0 then
    update public.activity_daily_summaries
      set last_sync_at = now()
      where id = v_rec.id;

    return jsonb_build_object(
      'suspicious',      false,
      'steps',           v_rec.steps,
      'fitcoins_earned', v_rec.fitcoins_earned,
      'coins_awarded',   0,
      'penalty_applied', false,
      'new_balance',     v_balance
    );
  end if;

  v_minutes := greatest(
    extract(epoch from (now() - v_rec.last_sync_at)) / 60.0,
    c_min_window_minutes
  );
  v_rate := v_delta / v_minutes;

  -- ════════════ CASO SOSPECHOSO ════════════
  if v_rate > c_max_steps_per_minute then
    -- Absorber los pasos falsos como nueva base: NO cuentan ahora
    -- y tampoco podrán contar en el siguiente sync.
    update public.activity_daily_summaries
      set last_synced_steps   = p_current_steps,
          suspicious_attempts = suspicious_attempts + 1,
          last_sync_at        = now()
      where id = v_rec.id;

    -- Penalización: -1 FC solo si hay saldo
    if v_balance > 0 then
      v_penalty := true;
      update public.wallets
        set balance = balance - 1
        where user_id = v_user;
      v_balance := v_balance - 1;

      insert into public.coin_transactions (user_id, amount, balance_after, type, description)
      values (v_user, -1, v_balance, 'penalty_suspicious_activity',
              'Penalización por actividad sospechosa');
    end if;

    -- Registrar el evento
    begin
      insert into public.audit_logs (user_id, action, details)
      values (v_user, 'suspicious_activity', jsonb_build_object(
        'activity_date',    p_activity_date,
        'delta_steps',      v_delta,
        'window_minutes',   round(v_minutes, 2),
        'steps_per_minute', round(v_rate, 1),
        'penalty_applied',  v_penalty
      ));
    exception when others then
      null; -- el log nunca debe tumbar la transacción principal
    end;

    return jsonb_build_object(
      'suspicious',      true,
      'steps',           v_rec.steps,
      'fitcoins_earned', v_rec.fitcoins_earned,
      'coins_awarded',   0,
      'penalty_applied', v_penalty,
      'new_balance',     v_balance
    );
  end if;

  -- ════════════ CASO VÁLIDO ════════════
  v_new_steps := v_rec.steps + v_delta;
  v_total_fc  := least(c_daily_fc_cap, v_new_steps / c_steps_per_coin);
  v_new_fc    := greatest(0, v_total_fc - v_rec.fitcoins_earned);

  update public.activity_daily_summaries
    set steps             = v_new_steps,
        last_valid_steps  = v_new_steps,
        last_synced_steps = p_current_steps,
        distance_km       = round(v_new_steps * 0.762 / 1000.0, 3),
        active_minutes    = v_new_steps / 100,
        fitcoins_earned   = v_rec.fitcoins_earned + v_new_fc,
        last_sync_at      = now()
    where id = v_rec.id;

  if v_new_fc > 0 then
    update public.wallets
      set balance = balance + v_new_fc
      where user_id = v_user;
    v_balance := v_balance + v_new_fc;

    insert into public.coin_transactions (user_id, amount, balance_after, type, description)
    values (v_user, v_new_fc, v_balance, 'earned_activity',
            format('%s FC por %s pasos válidos', v_new_fc, v_new_steps));
  end if;

  return jsonb_build_object(
    'suspicious',      false,
    'steps',           v_new_steps,
    'fitcoins_earned', v_rec.fitcoins_earned + v_new_fc,
    'coins_awarded',   v_new_fc,
    'penalty_applied', false,
    'new_balance',     v_balance
  );
end $$;

revoke all on function public.sync_daily_activity(integer, date) from public, anon;
grant execute on function public.sync_daily_activity(integer, date) to authenticated;


-- ─────────────────────────────────────────────────────────────────────────────
-- 8. Eliminar la RPC vieja (permitía que el cliente decidiera las monedas —
--    un atacante podría llamarla directo y acuñar FC sin caminar)
-- ─────────────────────────────────────────────────────────────────────────────
do $$
declare r record;
begin
  for r in
    select oid::regprocedure as sig
    from pg_proc
    where proname = 'sync_step_activity'
      and pronamespace = 'public'::regnamespace
  loop
    execute 'drop function ' || r.sig;
  end loop;
end $$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 9. RLS: cada usuario solo lee lo suyo; escrituras SOLO vía RPC
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.activity_daily_summaries enable row level security;
alter table public.coin_transactions        enable row level security;
alter table public.wallets                  enable row level security;

drop policy if exists "own_activity_select" on public.activity_daily_summaries;
create policy "own_activity_select" on public.activity_daily_summaries
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "own_transactions_select" on public.coin_transactions;
create policy "own_transactions_select" on public.coin_transactions
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "own_wallet_select" on public.wallets;
create policy "own_wallet_select" on public.wallets
  for select to authenticated using (auth.uid() = user_id);

-- Sin políticas de INSERT/UPDATE/DELETE para clientes:
-- solo la RPC (security definer) puede escribir.
