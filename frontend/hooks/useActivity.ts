import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { Pedometer } from 'expo-sensors';
import { supabase } from '../lib/supabase';
import { clearActivitySync, registerActivitySync } from '../lib/activitySync';

// ─── Fórmula de monedas ───────────────────────────────────────────────────────
const STEPS_PER_COIN  = 1_000;
const DAILY_FC_CAP    = 12;
const DAILY_STEP_GOAL = 12_000;
const STEP_LENGTH_M   = 0.762;
const KCAL_PER_STEP   = 0.04;

// ─── Sync ─────────────────────────────────────────────────────────────────────
const SYNC_INTERVAL_MS = 30_000;
const HEALTH_POLL_MS   = 30_000;

// ─── Anti-shake ───────────────────────────────────────────────────────────────
// Caminar normal: ~1.5 pasos/seg. Correr rápido: ~2.5 pasos/seg.
// Agitar genera 20-100 pasos en < 500 ms → siempre rechazado con estos límites.
const MAX_STEPS_PER_SECOND = 1.5;
// Si el callback llega en menos de este tiempo, solo se permite 1 paso máximo.
// Ningún movimiento físico real genera pasos en < 300 ms.
const MIN_ELAPSED_MS = 300;

const PROVIDER_IOS     = 'apple_healthkit';
const PROVIDER_ANDROID = 'google_health_connect';

// ─────────────────────────────────────────────────────────────────────────────

export type ActivityData = {
  steps: number;
  distanceKm: number;
  coinsToday: number;
  calories: number;
  progressPct: number;
  activeMin: number;
  isAvailable: boolean;
  isLoading: boolean;
  error: string | null;
};

const INITIAL: ActivityData = {
  steps: 0, distanceKm: 0, coinsToday: 0,
  calories: 0, progressPct: 0, activeMin: 0,
  isAvailable: false, isLoading: true, error: null,
};

function computeMetrics(steps: number) {
  const distanceKm  = (steps * STEP_LENGTH_M) / 1000;
  const coinsToday  = Math.min(DAILY_FC_CAP, Math.floor(steps / STEPS_PER_COIN));
  const calories    = Math.round(steps * KCAL_PER_STEP);
  const progressPct = Math.min(100, Math.round((steps / DAILY_STEP_GOAL) * 100));
  const activeMin   = Math.round(steps / 100);
  return { distanceKm, coinsToday, calories, progressPct, activeMin };
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function todayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return { start, end: new Date() };
}

function getProvider() {
  return Platform.OS === 'ios' ? PROVIDER_IOS : PROVIDER_ANDROID;
}

// ─────────────────────────────────────────────────────────────────────────────

export function useActivity(baseSaldo: number = 0) {
  const [activity, setActivity]     = useState<ActivityData>(INITIAL);
  const [totalCoins, setTotalCoins] = useState(baseSaldo);
  const [refreshing, setRefreshing] = useState(false);

  const watchSub  = useRef<ReturnType<typeof Pedometer.watchStepCount> | null>(null);
  const isMounted = useRef(true);

  const iosBase           = useRef(0);
  const androidSyncedBase = useRef(0);

  const lastSyncedSteps = useRef(0);
  const lastSyncedCoins = useRef(0);
  const syncedBalance   = useRef(baseSaldo);
  const currentStepsRef = useRef(0);

  // ── Anti-shake: contador propio (independiente del acumulador del pedómetro)
  const validatedSessionSteps = useRef(0);
  const lastRawSessionSteps   = useRef(0);
  const lastWatchCallbackTime = useRef(Date.now());

  // ── applySteps ────────────────────────────────────────────────────────────
  const applySteps = useCallback((steps: number) => {
    if (!isMounted.current) return;
    currentStepsRef.current = steps;
    const m = computeMetrics(steps);
    setActivity(prev => ({
      ...prev, steps, ...m,
      isAvailable: true, isLoading: false, error: null,
    }));
    const pendingCoins = Math.max(0, m.coinsToday - lastSyncedCoins.current);
    setTotalCoins(syncedBalance.current + pendingCoins);
  }, []);

  // ── iOS: HealthKit ────────────────────────────────────────────────────────
  const readIosHealth = useCallback(async (): Promise<number> => {
    try {
      const { start, end } = todayRange();
      const { steps } = await Pedometer.getStepCountAsync(start, end);
      return steps;
    } catch { return 0; }
  }, []);

  // ── Leer wallet + actividad del día desde Supabase ────────────────────────
  const fetchSupabaseData = useCallback(async (userId: string) => {
    const [{ data: rec }, { data: wallet }] = await Promise.all([
      supabase
        .from('activity_daily_summaries')
        .select('steps, coins_awarded')
        .eq('user_id', userId)
        .eq('provider', getProvider())
        .eq('activity_date', todayStr())
        .maybeSingle(),
      supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', userId)
        .maybeSingle(),
    ]);
    return { rec, wallet };
  }, []);

  // ── Aplicar datos de Supabase al estado local ─────────────────────────────
  const applySupabaseData = useCallback((
    rec:    { steps: number; coins_awarded: number | null } | null,
    wallet: { balance: number | null } | null,
  ) => {
    if (wallet) {
      const bal = wallet.balance ?? 0;
      syncedBalance.current = bal;
      if (isMounted.current) setTotalCoins(bal);
    }
    if (rec && rec.steps > 0) {
      lastSyncedSteps.current = rec.steps;
      lastSyncedCoins.current = rec.coins_awarded ?? 0;
      if (Platform.OS === 'android') {
        androidSyncedBase.current   = rec.steps;
        validatedSessionSteps.current = 0; // reiniciar delta de sesión
      }
      applySteps(rec.steps);
    }
  }, [applySteps]);

  // ── Sync a Supabase (con threshold mínimo) ────────────────────────────────
  const syncToSupabase = useCallback(async (steps: number, force = false): Promise<void> => {
    const delta = steps - lastSyncedSteps.current;
    if (!force && delta < 30) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const m = computeMetrics(steps);
      const { data: result, error } = await supabase.rpc('sync_step_activity', {
        p_provider:        getProvider(),
        p_date:            todayStr(),
        p_steps:           steps,
        p_distance_meters: Math.round(m.distanceKm * 1000),
        p_calories:        m.calories,
        p_active_minutes:  m.activeMin,
        p_coins:           m.coinsToday,
        p_hash:            `${todayStr()}-${steps}`,
      });
      if (error) { console.warn('[useActivity] RPC error:', error.message); return; }
      if (result) {
        const { new_balance, coins_awarded } = result as { new_balance: number; coins_awarded: number };
        lastSyncedSteps.current = steps;
        lastSyncedCoins.current = m.coinsToday;
        syncedBalance.current   = new_balance;
        if (Platform.OS === 'android') androidSyncedBase.current = steps;
        if (isMounted.current) setTotalCoins(new_balance);
        if (coins_awarded > 0) console.log(`[useActivity] +${coins_awarded} FC → ${new_balance} FC`);
      }
    } catch (e) { console.warn('[useActivity] Error de red:', e); }
  }, []);

  const forceSyncNow = useCallback(async () => {
    await syncToSupabase(currentStepsRef.current, true);
  }, [syncToSupabase]);

  // ── Refresh manual (pull-to-refresh) ─────────────────────────────────────
  // 1. Sincroniza pasos pendientes aunque no lleguen al mínimo
  // 2. Lee los valores actualizados de Supabase
  const refreshData = useCallback(async () => {
    setRefreshing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Forzar sync primero para que wallet tenga el saldo más reciente
      await syncToSupabase(currentStepsRef.current, true);

      // Leer valores frescos
      const { rec, wallet } = await fetchSupabaseData(user.id);
      applySupabaseData(rec, wallet);
    } catch (e) {
      console.warn('[useActivity] Error en refresh:', e);
    } finally {
      if (isMounted.current) setRefreshing(false);
    }
  }, [applySupabaseData, fetchSupabaseData, syncToSupabase]);

  // ── Watch con anti-shake mejorado ─────────────────────────────────────────
  const startWatch = useCallback(() => {
    watchSub.current?.remove();
    watchSub.current = null;

    validatedSessionSteps.current = 0;
    lastRawSessionSteps.current   = 0;
    lastWatchCallbackTime.current = Date.now();

    watchSub.current = Pedometer.watchStepCount(({ steps: rawSessionSteps }) => {
      if (!isMounted.current) return;

      const now       = Date.now();
      const elapsedMs = Math.max(1, now - lastWatchCallbackTime.current);
      const rawDelta  = rawSessionSteps - lastRawSessionSteps.current;

      lastWatchCallbackTime.current = now;
      lastRawSessionSteps.current   = rawSessionSteps;

      if (rawDelta <= 0) return;

      // Si el callback llegó en < MIN_ELAPSED_MS solo se permite 1 paso.
      // Caminar no produce pasos en 300 ms. Shake siempre llega más rápido.
      const maxAllowed = elapsedMs < MIN_ELAPSED_MS
        ? 1
        : Math.ceil((elapsedMs / 1000) * MAX_STEPS_PER_SECOND);

      if (rawDelta > maxAllowed) {
        // Spike — descartado completamente, NO se acumula
        return;
      }

      validatedSessionSteps.current += rawDelta;

      if (Platform.OS === 'ios') {
        applySteps(iosBase.current + validatedSessionSteps.current);
      } else {
        applySteps(androidSyncedBase.current + validatedSessionSteps.current);
      }
    });
  }, [applySteps]);

  // ── Inicialización ────────────────────────────────────────────────────────
  useEffect(() => {
    isMounted.current = true;
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let syncTimer:  ReturnType<typeof setInterval> | null = null;

    const init = async () => {
      // Paso 0: leer saldo e historial ANTES de pedir permisos
      // El usuario ve los FC correctos en < 400 ms desde que abre la app.
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { rec, wallet } = await fetchSupabaseData(user.id);
          applySupabaseData(rec, wallet);
        }
      } catch (e) {
        console.warn('[useActivity] Error init Supabase:', e);
      }

      // Paso 1: permisos
      const { status } = await Pedometer.requestPermissionsAsync();
      if (status !== 'granted') {
        if (isMounted.current) {
          setActivity(prev => ({
            ...prev, isAvailable: false, isLoading: false,
            error: 'Permiso de actividad física denegado.',
          }));
        }
        return;
      }

      // Paso 2: sensor
      const available = await Pedometer.isAvailableAsync();
      if (!available) {
        if (isMounted.current) {
          setActivity(prev => ({
            ...prev, isAvailable: false, isLoading: false,
            error: 'Tu dispositivo no tiene sensor de pasos.',
          }));
        }
        return;
      }

      // Paso 3: conteo
      if (Platform.OS === 'ios') {
        const historical = await readIosHealth();
        iosBase.current = historical;
        applySteps(historical);
        pollTimer = setInterval(async () => {
          if (!isMounted.current) return;
          const fresh = await readIosHealth();
          if (fresh > 0) { iosBase.current = fresh; applySteps(fresh); }
        }, HEALTH_POLL_MS);
      } else {
        if (isMounted.current) {
          setActivity(prev => ({ ...prev, isAvailable: true, isLoading: false }));
        }
      }

      startWatch();

      syncTimer = setInterval(() => {
        syncToSupabase(currentStepsRef.current);
      }, SYNC_INTERVAL_MS);

      registerActivitySync(forceSyncNow);
    };

    // ── AppState: sync al ir al fondo, refrescar wallet al volver ────────────
    const onAppState = async (state: AppStateStatus) => {
      if (!isMounted.current) return;

      if (state === 'background' || state === 'inactive') {
        // Guardar pasos antes de que el SO suspenda la app
        await syncToSupabase(currentStepsRef.current, true);

      } else if (state === 'active') {
        // Al volver a la app: re-leer saldo y pasos desde Supabase automáticamente
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { rec, wallet } = await fetchSupabaseData(user.id);
            applySupabaseData(rec, wallet);
          }
        } catch {}

        if (Platform.OS === 'ios') {
          const fresh = await readIosHealth();
          if (fresh > 0) { iosBase.current = fresh; applySteps(fresh); }
        } else {
          if (!watchSub.current) startWatch();
        }
      }
    };

    const appStateSub = AppState.addEventListener('change', onAppState);
    init();

    return () => {
      isMounted.current = false;
      watchSub.current?.remove();
      watchSub.current = null;
      appStateSub.remove();
      clearActivitySync();
      if (pollTimer) clearInterval(pollTimer);
      if (syncTimer)  clearInterval(syncTimer);
    };
  }, [applySteps, applySupabaseData, fetchSupabaseData, forceSyncNow, readIosHealth, startWatch, syncToSupabase]);

  return { activity, totalCoins, refreshing, refreshData };
}
