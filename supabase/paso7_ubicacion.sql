-- ═══════════════════════════════════════════════════════════════════════════
-- PASO 7 — Validación con ubicación + ocultar ofertas ya canjeadas
-- Ejecutar COMPLETO en Supabase → SQL Editor
--
-- Qué hace:
--   1. Guarda SOLO la última ubicación válida por día (2 columnas, sin rutas
--      ni historial — privacidad primero).
--   2. La RPC sync_daily_activity ahora recibe lat/lng opcionales y valida:
--      • Regla de ritmo (existente):  > 130 pasos/min  → sospechoso
--      • Regla de desplazamiento:     muchos pasos nuevos (≥250) pero casi
--        cero movimiento real según GPS → sospechoso
--      Si el usuario niega el permiso de ubicación, se valida solo por ritmo.
--   3. redeem_offer rechaza canjear dos veces la misma oferta, y el
--      Marketplace la oculta para ese usuario (solo para él).
-- ═══════════════════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Última ubicación válida del día (lo mínimo necesario, nada más)
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.activity_daily_summaries
  add column if not exists last_lat double precision,
  add column if not exists last_lng double precision;


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. RPC sync_daily_activity con validación de ritmo + desplazamiento
--    (se elimina la firma vieja para evitar ambigüedad de sobrecargas;
--     los APK anteriores siguen funcionando porque lat/lng tienen default)
-- ─────────────────────────────────────────────────────────────────────────────
drop function if exists public.sync_daily_activity(integer, date);

create or replace function public.sync_daily_activity(
  p_current_steps integer,
  p_activity_date date default (now() at time zone 'utc')::date,
  p_lat double precision default null,
  p_lng double precision default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  -- Reglas de ritmo
  c_max_steps_per_minute constant numeric := 130;
  c_min_window_minutes   constant numeric := 0.25;  -- piso 15 seg
  c_max_window_minutes   constant numeric := 30;
  -- Reglas de desplazamiento (GPS)
  c_geo_min_steps        constant integer := 250;   -- solo juzgar con suficientes pasos nuevos
  c_meters_per_step      constant numeric := 0.76;
  c_min_movement_ratio   constant numeric := 0.15;  -- exigir ≥15% de la distancia esperada
                                                    -- (tolera GPS impreciso e interiores)
  -- Reglas de monedas
  c_steps_per_coin       constant integer := 1000;
  c_daily_fc_cap         constant integer := 12;
  c_max_daily_steps      constant integer := 200000;

  v_user       uuid := auth.uid();
  v_rec        public.activity_daily_summaries%rowtype;
  v_delta      integer;
  v_minutes    numeric;
  v_rate       numeric;
  v_dist_m     numeric;
  v_required_m numeric;
  v_suspicious boolean := false;
  v_reason     text    := null;
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

  -- Registro diario: crear si no existe
  insert into public.activity_daily_summaries
    (user_id, activity_date, steps, last_valid_steps, last_synced_steps,
     fitcoins_earned, suspicious_attempts, last_sync_at)
  values
    (v_user, p_activity_date, 0, 0, 0, 0, 0, now())
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

  -- Sin pasos nuevos: actualizar timestamp y ubicación de referencia
  if v_delta <= 0 then
    update public.activity_daily_summaries
      set last_sync_at = now(),
          last_lat     = coalesce(p_lat, last_lat),
          last_lng     = coalesce(p_lng, last_lng)
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

  -- ── VALIDACIÓN 1: ritmo (pasos por minuto) ─────────────────────────────────
  v_minutes := least(
    greatest(extract(epoch from (now() - v_rec.last_sync_at)) / 60.0, c_min_window_minutes),
    c_max_window_minutes
  );
  v_rate := v_delta / v_minutes;

  if v_rate > c_max_steps_per_minute then
    v_suspicious := true;
    v_reason     := 'ritmo_imposible';
  end if;

  -- ── VALIDACIÓN 2: desplazamiento real (GPS) ────────────────────────────────
  -- Solo si el ritmo pasó, hay coordenadas actuales y previas, y el delta
  -- de pasos es suficiente para juzgar (evita falsos positivos con pocos pasos)
  if not v_suspicious
     and p_lat is not null and p_lng is not null
     and v_rec.last_lat is not null and v_rec.last_lng is not null
     and v_delta >= c_geo_min_steps
  then
    -- Distancia haversine en metros entre la última ubicación válida y la actual
    v_dist_m := 2 * 6371000 * asin( sqrt(
      power(sin(radians(p_lat - v_rec.last_lat) / 2), 2) +
      cos(radians(v_rec.last_lat)) * cos(radians(p_lat)) *
      power(sin(radians(p_lng - v_rec.last_lng) / 2), 2)
    ));

    v_required_m := v_delta * c_meters_per_step * c_min_movement_ratio;

    if v_dist_m < v_required_m then
      v_suspicious := true;
      v_reason     := 'sin_desplazamiento';
    end if;
  end if;

  -- ════════════ CASO SOSPECHOSO ════════════
  if v_suspicious then
    -- Absorber los pasos falsos y la ubicación actual como nueva base
    update public.activity_daily_summaries
      set last_synced_steps   = p_current_steps,
          suspicious_attempts = suspicious_attempts + 1,
          last_sync_at        = now(),
          last_lat            = coalesce(p_lat, last_lat),
          last_lng            = coalesce(p_lng, last_lng)
      where id = v_rec.id;

    if v_balance > 0 then
      v_penalty := true;
      update public.wallets
        set balance = balance - 1
        where user_id = v_user;
      v_balance := v_balance - 1;

      insert into public.coin_transactions (user_id, amount, balance_after, type, description)
      values (v_user, -1, v_balance, 'penalty_suspicious_activity',
              'Penalización por actividad sospechosa (' || v_reason || ')');
    end if;

    begin
      insert into public.audit_logs (user_id, action, details)
      values (v_user, 'suspicious_activity', jsonb_build_object(
        'activity_date',    p_activity_date,
        'reason',           v_reason,
        'delta_steps',      v_delta,
        'window_minutes',   round(v_minutes, 2),
        'steps_per_minute', round(v_rate, 1),
        'distance_meters',  round(coalesce(v_dist_m, -1), 1),
        'required_meters',  round(coalesce(v_required_m, -1), 1),
        'penalty_applied',  v_penalty
      ));
    exception when others then
      null;
    end;

    return jsonb_build_object(
      'suspicious',      true,
      'reason',          v_reason,
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
        last_sync_at      = now(),
        last_lat          = coalesce(p_lat, last_lat),
        last_lng          = coalesce(p_lng, last_lng)
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

revoke all on function public.sync_daily_activity(integer, date, double precision, double precision) from public, anon;
grant execute on function public.sync_daily_activity(integer, date, double precision, double precision) to authenticated;


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. redeem_offer: bloquear doble canje de la misma oferta
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.redeem_offer(p_offer_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user          uuid := auth.uid();
  v_offer         public.offers%rowtype;
  v_business_name text;
  v_balance       integer;
  v_new_balance   integer;
  v_code          text;
  v_expires       timestamptz;
  v_chars constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v_tries         integer := 0;
  i               integer;
begin
  if v_user is null then
    raise exception 'No autenticado';
  end if;

  -- Un usuario solo puede canjear cada oferta una vez
  if exists (
    select 1 from public.redemptions
    where user_id = v_user
      and offer_id = p_offer_id
      and status in ('issued', 'used')
  ) then
    raise exception 'Ya canjeaste esta oferta';
  end if;

  select * into v_offer
  from public.offers
  where id = p_offer_id
  for update;

  if not found then
    raise exception 'La oferta no existe';
  end if;
  if not coalesce(v_offer.active, false) then
    raise exception 'Esta oferta ya no está disponible';
  end if;
  if v_offer.starts_at is not null and v_offer.starts_at > now() then
    raise exception 'Esta oferta aún no comienza';
  end if;
  if v_offer.ends_at is not null and v_offer.ends_at < now() then
    raise exception 'Esta oferta ya expiró';
  end if;
  if v_offer.stock_available is not null and v_offer.stock_available <= 0 then
    raise exception 'Esta oferta está agotada';
  end if;

  select balance into v_balance
  from public.wallets
  where user_id = v_user
  for update;

  if v_balance is null then
    raise exception 'No se encontró tu wallet';
  end if;
  if v_balance < v_offer.fitcoin_price then
    raise exception 'Saldo insuficiente: tienes % FC y la oferta cuesta % FC',
      v_balance, v_offer.fitcoin_price;
  end if;

  loop
    v_code := 'FC-';
    for i in 1..6 loop
      v_code := v_code || substr(v_chars, 1 + floor(random() * length(v_chars))::int, 1);
    end loop;
    exit when not exists (
      select 1 from public.redemptions where redemption_code = v_code
    );
    v_tries := v_tries + 1;
    if v_tries > 30 then
      raise exception 'No se pudo generar un código único, intenta de nuevo';
    end if;
  end loop;

  v_expires := coalesce(v_offer.ends_at, now() + interval '30 days');

  insert into public.redemptions
    (user_id, offer_id, business_id, redemption_code, status,
     fitcoin_price_at_purchase, expires_at)
  values
    (v_user, v_offer.id, v_offer.business_id, v_code, 'issued',
     v_offer.fitcoin_price, v_expires);

  if v_offer.stock_available is not null then
    update public.offers
      set stock_available = stock_available - 1
      where id = v_offer.id;
  end if;

  v_new_balance := v_balance - v_offer.fitcoin_price;
  update public.wallets
    set balance = v_new_balance
    where user_id = v_user;

  insert into public.coin_transactions (user_id, amount, balance_after, type, description)
  values (v_user, -v_offer.fitcoin_price, v_new_balance, 'spent_redemption',
          format('Canje: %s (%s)', v_offer.title, v_code));

  select name into v_business_name
  from public.businesses
  where id = v_offer.business_id;

  return jsonb_build_object(
    'redemption_code', v_code,
    'new_balance',     v_new_balance,
    'offer_title',     v_offer.title,
    'business_name',   v_business_name,
    'fitcoin_price',   v_offer.fitcoin_price,
    'expires_at',      v_expires,
    'status',          'issued'
  );
end $$;

revoke all on function public.redeem_offer(uuid) from public, anon;
grant execute on function public.redeem_offer(uuid) to authenticated;
