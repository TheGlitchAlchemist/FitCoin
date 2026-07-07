-- ═══════════════════════════════════════════════════════════════════════════
-- PASO 4 — Aumentar sensibilidad del antifraude
-- Ejecutar COMPLETO en Supabase → SQL Editor
--
-- Cambios respecto a paso 3:
--   • Umbral: 180 → 130 pasos/minuto.
--     Caminar rápido real ≈ 100-120/min, así que 130 no castiga uso legítimo,
--     pero sí atrapa el shake (que llega a ~150-400/min por ventana).
--   • Ventana mínima: 30 seg → 15 seg. El piso anterior diluía la tasa de
--     los syncs de 20 segundos (130 pasos en 20 s se calculaban como si
--     hubieran tomado 30 s).
-- ═══════════════════════════════════════════════════════════════════════════

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
  c_max_steps_per_minute constant numeric := 130;   -- caminar rápido ≈ 100-120/min
  c_steps_per_coin       constant integer := 1000;  -- 1000 pasos = 1 FC
  c_daily_fc_cap         constant integer := 12;    -- máx 12 FC/día
  c_min_window_minutes   constant numeric := 0.25;  -- piso de 15 seg
  c_max_window_minutes   constant numeric := 30;    -- techo de 30 min
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

  -- Sin pasos nuevos: solo actualizar timestamp (sync de línea base)
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

  -- Ventana acotada: mínimo 15 seg, máximo 30 min
  v_minutes := least(
    greatest(extract(epoch from (now() - v_rec.last_sync_at)) / 60.0, c_min_window_minutes),
    c_max_window_minutes
  );
  v_rate := v_delta / v_minutes;

  -- ════════════ CASO SOSPECHOSO ════════════
  if v_rate > c_max_steps_per_minute then
    update public.activity_daily_summaries
      set last_synced_steps   = p_current_steps,
          suspicious_attempts = suspicious_attempts + 1,
          last_sync_at        = now()
      where id = v_rec.id;

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
      null;
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
