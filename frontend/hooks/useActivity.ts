// ─────────────────────────────────────────────────────────────────────────────
// ARCHIVO: hooks/useActivity.ts
//
// FIXES EN ESTA VERSIÓN:
//   1. Android restaura los pasos del día desde Supabase al re-login.
//      watchStepCount empieza en 0 pero se suma a los pasos ya guardados.
//   2. Sync forzado al ir al background (usuario sale de la app o cierra sesión).
//   3. Sync forzado antes del logout via activitySync.flushActivitySync().
//   4. Intervalo de sync reducido a 30s para minimizar pérdida de datos.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { Pedometer } from 'expo-sensors';
import { supabase } from '../lib/supabase';
import { clearActivitySync, registerActivitySync } from '../lib/activitySync';

// ─── Configuración ────────────────────────────────────────────────────────────
const COINS_PER_KM       = 5;
const DAILY_STEP_GOAL    = 10_000;
const STEP_LENGTH_M      = 0.762;
const KCAL_PER_STEP      = 0.04;
const SYNC_INTERVAL_MS   = 30_000;  // cada 30s (antes era 60s)
const MIN_NEW_STEPS_SYNC = 20;
const HEALTH_POLL_MS     = 30_000;  // solo iOS

// ─── Enums verificados de Supabase ───────────────────────────────────────────
const PROVIDER_IOS      = 'apple_healthkit';
const PROVIDER_ANDROID  = 'google_health_connect';
const STATUS_SYNCED     = 'approved';
const TX_TYPE_EARN      = 'earn_activity';

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
  const coinsToday  = Math.floor(distanceKm * COINS_PER_KM);
  const calories    = Math.round(steps * KCAL_PER_STEP);
  const progressPct = Math.min(100, Math.round((steps / DAILY_STEP_GOAL) * 100));
  const activeMin   = Math.round(steps / 100);
  return { distanceKm, coinsToday, calories, progressPct, activeMin };
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

  const watchSub    = useRef<ReturnType<typeof Pedometer.watchStepCount> | null>(null);
  const isMounted   = useRef(true);

  // iOS: pasos históricos de HealthKit al abrir
  const iosBase     = useRef(0);

  // Android: pasos ya guardados en Supabase (base para restaurar al re-login)
  // + pasos nuevos de esta sesión que aún no están en Supabase
  const androidSyncedBase   = useRef(0); // pasos guardados en Supabase hoy
  const androidSessionDelta = useRef(0); // pasos nuevos desde que inició la sesión

  // Sync tracking
  const lastSyncedSteps  = useRef(0);
  const lastSyncedCoins  = useRef(0);
  const syncedBalance    = useRef(baseSaldo);

  // Referencia a los pasos actuales (para sync forzado)
  const currentStepsRef  = useRef(0);

  // ── Aplicar pasos al estado ────────────────────────────────────────────────
  const applySteps = useCallback((steps: number) => {
    if (!isMounted.current) return;
    currentStepsRef.current = steps;
    const m = computeMetrics(steps);
    setActivity(prev => ({
      ...prev, steps, ...m,
      isAvailable: true, isLoading: false, error: null,
    }));
    const newCoins = Math.max(0, m.coinsToday - lastSyncedCoins.current);
    setTotalCoins(syncedBalance.current + newCoins);
  }, []);

  // ── iOS: leer HealthKit ────────────────────────────────────────────────────
  const readIosHealth = useCallback(async (): Promise<number> => {
    try {
      const { start, end } = todayRange();
      const { steps } = await Pedometer.getStepCountAsync(start, end);
      return steps;
    } catch {
      return 0;
    }
  }, []);

  // ── Sync a Supabase ────────────────────────────────────────────────────────
  const syncToSupabase = useCallback(async (steps: number): Promise<void> => {
    if (steps - lastSyncedSteps.current < MIN_NEW_STEPS_SYNC) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const m     = computeMetrics(steps);
      const today = new Date().toISOString().split('T')[0];

      const { data: result, error } = await supabase.rpc('sync_step_activity', {
        p_user_id:          user.id,
        p_provider:         getProvider(),
        p_date:             today,
        p_steps:            steps,
        p_distance_meters:  Math.round(m.distanceKm * 1000),
        p_calories:         m.calories,
        p_active_minutes:   m.activeMin,
        p_coins_calculated: m.coinsToday,
        p_raw_data_hash:    `${today}-${steps}`,
        p_status:           STATUS_SYNCED,
        p_transaction_type: TX_TYPE_EARN,
      });

      if (error) {
        console.warn('[useActivity] RPC error:', error.message);
        return;
      }

      if (result) {
        const { new_balance, coins_awarded } = result as {
          new_balance: number;
          coins_awarded: number;
        };
        lastSyncedSteps.current = steps;
        lastSyncedCoins.current = m.coinsToday;
        syncedBalance.current   = new_balance;
        // Actualizar androidSyncedBase para que el próximo re-login tenga la base correcta
        if (Platform.OS === 'android') {
          androidSyncedBase.current = steps;
        }
        setTotalCoins(new_balance);
        if (coins_awarded > 0) {
          console.log(`[useActivity] +${coins_awarded} FC → saldo: ${new_balance} FC`);
        }
      }
    } catch (e) {
      console.warn('[useActivity] Error de red:', e);
    }
  }, []);

  // ── Sync forzado (para logout y background) ───────────────────────────────
  const forceSyncNow = useCallback(async (): Promise<void> => {
    await syncToSupabase(currentStepsRef.current);
  }, [syncToSupabase]);

  // ── Iniciar suscripción watchStepCount ────────────────────────────────────
  const startWatch = useCallback(() => {
    watchSub.current?.remove();
    watchSub.current = null;

    watchSub.current = Pedometer.watchStepCount(({ steps: sessionSteps }) => {
      if (!isMounted.current) return;

      if (Platform.OS === 'ios') {
        // iOS: sessionSteps = pasos desde que inició el watch
        // Se suma a los pasos históricos de HealthKit
        applySteps(iosBase.current + sessionSteps);
      } else {
        // Android: sessionSteps = pasos desde que inició el watch (empieza en 0)
        // Se suma a los pasos ya guardados en Supabase (para restaurar tras re-login)
        androidSessionDelta.current = sessionSteps;
        applySteps(androidSyncedBase.current + sessionSteps);
      }
    });
  }, [applySteps]);

  // ── Inicialización ────────────────────────────────────────────────────────
  useEffect(() => {
    isMounted.current = true;
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let syncTimer: ReturnType<typeof setInterval> | null = null;

    const init = async () => {
      // 1. Pedir permiso (crítico en Android 10+)
      const { status } = await Pedometer.requestPermissionsAsync();
      if (status !== 'granted') {
        if (isMounted.current) {
          setActivity(prev => ({
            ...prev,
            isAvailable: false,
            isLoading: false,
            error: 'Permiso de actividad física denegado.\nVe a Ajustes → Apps → FitCoin → Permisos → Actividad física.',
          }));
        }
        return;
      }

      // 2. Verificar sensor de hardware
      const available = await Pedometer.isAvailableAsync();
      if (!available) {
        if (isMounted.current) {
          setActivity(prev => ({
            ...prev,
            isAvailable: false,
            isLoading: false,
            error: 'Tu dispositivo no tiene sensor de pasos.',
          }));
        }
        return;
      }

      // 3. Leer datos de hoy desde Supabase
      //    CRÍTICO: esto restaura los pasos y monedas del día si el usuario
      //    cerró sesión y volvió a entrar.
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const today = new Date().toISOString().split('T')[0];

          const { data: rec } = await supabase
            .from('activity_daily_summaries')
            .select('steps, coins_awarded')
            .eq('user_id', user.id)
            .eq('provider', getProvider())
            .eq('activity_date', today)
            .maybeSingle();

          if (rec && rec.steps > 0) {
            // Hay pasos guardados de hoy → restaurar como base
            lastSyncedSteps.current = rec.steps;
            lastSyncedCoins.current = rec.coins_awarded ?? 0;

            if (Platform.OS === 'android') {
              // Android: los pasos de Supabase son la base
              // watchStepCount sumará pasos NUEVOS de esta sesión encima
              androidSyncedBase.current = rec.steps;
              applySteps(rec.steps); // mostrar inmediatamente los pasos restaurados
            }
          }

          // Leer saldo actual de coin_transactions
          const { data: lastTx } = await supabase
            .from('coin_transactions')
            .select('balance_after')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (lastTx) {
            syncedBalance.current = lastTx.balance_after ?? 0;
            setTotalCoins(lastTx.balance_after ?? 0);
          }
        }
      } catch (e) {
        console.warn('[useActivity] Error leyendo Supabase al init:', e);
      }

      // 4. iOS: leer historial de HealthKit
      if (Platform.OS === 'ios') {
        const historical = await readIosHealth();
        iosBase.current = historical;
        applySteps(historical);

        // Polling iOS cada 30s
        pollTimer = setInterval(async () => {
          if (!isMounted.current) return;
          const fresh = await readIosHealth();
          if (fresh > 0) {
            iosBase.current = fresh;
            applySteps(fresh);
          }
        }, HEALTH_POLL_MS);

      } else {
        // Android: mostrar estado listo (watchStepCount hará el trabajo)
        if (isMounted.current) {
          setActivity(prev => ({
            ...prev,
            isAvailable: true,
            isLoading: false,
          }));
        }
      }

      // 5. Iniciar watch en tiempo real
      startWatch();

      // 6. Sync periódico (cada 30s)
      syncTimer = setInterval(() => {
        syncToSupabase(currentStepsRef.current);
      }, SYNC_INTERVAL_MS);

      // 7. Registrar función de sync forzado para el logout
      registerActivitySync(forceSyncNow);
    };

    // 8. Manejar cambios de estado de la app
    const onAppState = async (state: AppStateStatus) => {
      if (!isMounted.current) return;

      if (state === 'background' || state === 'inactive') {
        // SYNC FORZADO al ir al background (antes de que el SO suspenda la app)
        // Esto evita perder pasos cuando el usuario cierra sesión o minimiza la app
        await syncToSupabase(currentStepsRef.current);

      } else if (state === 'active') {
        if (Platform.OS === 'ios') {
          const fresh = await readIosHealth();
          if (fresh > 0) {
            iosBase.current = fresh;
            applySteps(fresh);
          }
        } else {
          // Android: reiniciar watch si fue cancelado por el SO
          if (!watchSub.current) {
            startWatch();
          }
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
      if (syncTimer) clearInterval(syncTimer);
    };
  }, [applySteps, forceSyncNow, readIosHealth, startWatch, syncToSupabase]);

  return { activity, totalCoins };
}
