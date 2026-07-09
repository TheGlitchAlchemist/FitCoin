-- ═══════════════════════════════════════════════════════════════════════════
-- PASO 6 — Fix del canje: guardar el precio al momento de la compra
-- Ejecutar COMPLETO en Supabase → SQL Editor
--
-- La tabla redemptions tiene la columna fitcoin_price_at_purchase con un
-- check (> 0) que la versión anterior de la RPC no llenaba. Ahora se guarda
-- el precio real de la oferta al momento del canje (histórico correcto
-- aunque el negocio cambie el precio después).
-- ═══════════════════════════════════════════════════════════════════════════

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
  -- Alfabeto sin caracteres confusos (sin 0/O, 1/I/L)
  v_chars constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v_tries         integer := 0;
  i               integer;
begin
  if v_user is null then
    raise exception 'No autenticado';
  end if;

  -- 1) Oferta con lock (protege el stock contra canjes simultáneos)
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

  -- 2) Wallet con lock y validación de saldo
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

  -- 3) Código único FC-XXXXXX
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

  -- El cupón expira cuando termina la oferta (o en 30 días si no tiene fin)
  v_expires := coalesce(v_offer.ends_at, now() + interval '30 days');

  -- 4) Crear el canje como 'issued' con el precio al momento de la compra
  insert into public.redemptions
    (user_id, offer_id, business_id, redemption_code, status,
     fitcoin_price_at_purchase, expires_at)
  values
    (v_user, v_offer.id, v_offer.business_id, v_code, 'issued',
     v_offer.fitcoin_price, v_expires);

  -- 5) Descontar stock si la oferta lo maneja
  if v_offer.stock_available is not null then
    update public.offers
      set stock_available = stock_available - 1
      where id = v_offer.id;
  end if;

  -- 6) Descontar FitCoins
  v_new_balance := v_balance - v_offer.fitcoin_price;
  update public.wallets
    set balance = v_new_balance
    where user_id = v_user;

  -- 7) Movimiento en el historial
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
