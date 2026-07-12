// ─────────────────────────────────────────────────────────────────────────────
// useActivity — pasos diarios + FitCoins con validación antifraude en el SERVIDOR
//
// Arquitectura:
//   • watchStepCount SOLO actualiza la UI (pasos en pantalla). Nunca genera FC.
//   • syncActivity() manda los pasos actuales a la RPC `sync_daily_activity`.
//   • Supabase valida la tasa (máx 180 pasos/min desde el último sync):
//       - Válido      → suma pasos, otorga FC (1000 pasos = 1 FC, máx 12/día)
//       - Sospechoso  → descarta el delta, -1 FC de penalización, alerta al usuario
//   • El frontend nunca decide cuántas monedas se guardan; solo pide sincronizar
//     y aplica la respuesta del servidor (fuente de verdad).
//   • Cada día tiene su propio registro (unique user_id + activity_date).
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AppState, AppStateStatus, Platform } from 'react-native';
import { Pedometer } from 'expo-sensors';
import * as Location from 'expo-location';
import { supabase } from '../lib/supabase';
import { clearActivitySync, registerActivitySync } from '../lib/activitySync';

// ─── Constantes de visualización (las reglas reales viven en la RPC) ─────────
const DAILY_STEP_GOAL = 12_000;
const DAILY_FC_CAP    = 12;
const STEP_LENGTH_M   = 0.762;
const KCAL_PER_STEP   = 0.04;

const SYNC_INTERVAL_MS = 20_000;
const HEALTH_POLL_MS   = 20_000;

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

type SyncResult = {
  suspicious: boolean;
  reason?: 'ritmo_imposible' | 'sin_desplazamiento' | null;
  steps: number;
  fitcoins_earned: number;
  coins_awarded: number;
  penalty_applied: boolean;
  new_balance: number;
};

function displayMetrics(steps: number) {
  return {
    distanceKm:  (steps * STEP_LENGTH_M) / 1000,
    calories:    Math.round(steps * KCAL_PER_STEP),
    progressPct: Math.min(100, Math.round((steps / DAILY_STEP_GOAL) * 100)),
    activeMin:   Math.round(steps / 100),
  };
}

// Fecha LOCAL del dispositivo (no UTC): en México (UTC-6), toISOString()
// devolvía la fecha de mañana después de las 6pm y el día se "reiniciaba" solo.
function todayStr() {
  const d = new Date();
  const m   = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function todayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return { start, end: new Date() };
}

// ─────────────────────────────────────────────────────────────────────────────

export function useActivity(baseSaldo: number = 0) {
  const [activity, setActivity]     = useState<ActivityData>(INITIAL);
  const [totalCoins, setTotalCoins] = useState(baseSaldo);
  const [refreshing, setRefreshing] = useState(false);

  const watchSub  = useRef<ReturnType<typeof Pedometer.watchStepCount> | null>(null);
  const isMounted = useRef(true);

  // Estado confirmado por el servidor (fuente de verdad)
  const serverSteps = useRef(0);   // pasos válidos del día
  const serverCoins = useRef(0);   // fitcoins_earned del día

  // Sesión del sensor: el pedómetro entrega un acumulador desde el subscribe.
  // La diferencia (latest - base) son los pasos PENDIENTES de validar.
  const sessionRawBase   = useRef(0);
  const sessionRawLatest = useRef(0);

  // iOS: pasos del día según HealthKit (ya es un total diario)
  const iosDailySteps = useRef(0);

  const dateRef  = useRef(todayStr());
  const syncBusy = useRef(false);

  // Ubicación: SOLO se consulta al momento de sincronizar (nunca en
  // segundo plano ni de forma continua). Se manda al servidor para
  // validar que hubo desplazamiento real, no se guarda ninguna ruta.
  const locationAllowed = useRef(false);

  const getCoords = useCallback(async (fresh: boolean): Promise<{ lat: number; lng: number } | null> => {
    if (!locationAllowed.current) return null;
    try {
      let pos: Location.LocationObject | null;
      if (fresh) {
        // Lectura fresca (abrir Dashboard / pull-to-refresh), con timeout
        pos = await Promise.race([
          Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
          new Promise<null>(resolve => setTimeout(() => resolve(null), 6000)),
        ]);
      } else {
        // Sync periódico: usar la última posición conocida (sin encender GPS)
        pos = await Location.getLastKnownPositionAsync();
      }
      if (!pos) return null;
      // Descartar lecturas muy imprecisas (evita falsos positivos)
      if (pos.coords.accuracy !== null && pos.coords.accuracy > 100) return null;
      return { lat: pos.coords.latitude, lng: pos.coords.longitude };
    } catch {
      return null;
    }
  }, []);

  // En un APK instalado nadie ve console.warn: el primer error de cada sesión
  // se muestra en un Alert para poder diagnosticar en el dispositivo.
  const errorAlertShown = useRef(false);
  const reportError = useCallback((contexto: string, mensaje: string) => {
    console.warn(`[useActivity] ${contexto}:`, mensaje);
    if (!errorAlertShown.current && isMounted.current) {
      errorAlertShown.current = true;
      Alert.alert('Error de sincronización', `${contexto}\n\n${mensaje}`);
    }
  }, []);

  // ── Pasos mostrados en pantalla (server + pendientes de la sesión) ────────
  const currentSteps = useCallback(() => {
    const pending = Math.max(0, sessionRawLatest.current - sessionRawBase.current);
    const local   = serverSteps.current + pending;
    return Platform.OS === 'ios'
      ? Math.max(local, iosDailySteps.current)
      : local;
  }, []);

  // ── Actualizar UI (nunca calcula monedas: usa lo confirmado por el server) ─
  const updateUI = useCallback((steps: number) => {
    if (!isMounted.current) return;
    setActivity(prev => ({
      ...prev,
      steps,
      ...displayMetrics(steps),
      coinsToday: serverCoins.current,
      isAvailable: true,
      isLoading: false,
      error: null,
    }));
  }, []);

  // ── Cambio de día: reiniciar contadores locales ────────────────────────────
  const checkDayChange = useCallback(() => {
    const today = todayStr();
    if (dateRef.current === today) return;
    dateRef.current = today;
    serverSteps.current = 0;
    serverCoins.current = 0;
    sessionRawBase.current = sessionRawLatest.current;
    iosDailySteps.current = 0;
    updateUI(0);
    // El registro del nuevo día lo crea la RPC en el siguiente sync
  }, [updateUI]);

  // ── Cargar TODO desde Supabase: saldo, pasos y FC del día ─────────────────
  const loadFromSupabase = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [recRes, walletRes, lastTxRes] = await Promise.all([
      supabase
        .from('activity_daily_summaries')
        .select('steps, fitcoins_earned')
        .eq('user_id', user.id)
        .eq('activity_date', todayStr())
        .maybeSingle(),
      supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .maybeSingle(),
      // Fallback por si el wallet aún no existe para este usuario
      supabase
        .from('coin_transactions')
        .select('balance_after')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    if (recRes.error)    reportError('Lectura de actividad diaria', recRes.error.message);
    if (walletRes.error) reportError('Lectura de wallet', walletRes.error.message);

    if (!isMounted.current) return;

    // Monedas: wallet → última transacción → mantener valor actual
    const balance = walletRes.data?.balance ?? lastTxRes.data?.balance_after;
    if (balance !== null && balance !== undefined) setTotalCoins(balance);

    if (recRes.data) {
      serverSteps.current = recRes.data.steps ?? 0;
      serverCoins.current = recRes.data.fitcoins_earned ?? 0;
    }
    updateUI(currentSteps());
  }, [currentSteps, reportError, updateUI]);

  // ── SYNC: la única vía para generar (o perder) FitCoins ───────────────────
  // freshLocation: true al abrir Dashboard y en pull-to-refresh (lectura GPS
  // fresca); false en el sync periódico (usa la última posición conocida).
  const syncActivity = useCallback(async (showAlert: boolean = true, freshLocation: boolean = false) => {
    if (syncBusy.current) return;
    syncBusy.current = true;
    try {
      checkDayChange();

      const steps  = currentSteps();
      const coords = await getCoords(freshLocation);

      const { data, error } = await supabase.rpc('sync_daily_activity', {
        p_current_steps: steps,
        p_activity_date: todayStr(),
        p_lat: coords?.lat ?? null,
        p_lng: coords?.lng ?? null,
      });

      if (error) {
        reportError('RPC sync_daily_activity', error.message);
        return;
      }

      const r = data as SyncResult;

      // Todo lo enviado queda absorbido como base (válido o descartado):
      // los pasos rechazados no se vuelven a enviar.
      sessionRawBase.current = sessionRawLatest.current;
      if (Platform.OS === 'ios') iosDailySteps.current = r.steps;

      serverSteps.current = r.steps;
      serverCoins.current = r.fitcoins_earned;

      if (isMounted.current) {
        setTotalCoins(r.new_balance);
        updateUI(r.steps); // si fue sospechoso, esto REVIERTE los pasos falsos en pantalla
      }

      if (r.suspicious && showAlert && isMounted.current) {
        const motivo = r.reason === 'sin_desplazamiento'
          ? 'Registraste muchos pasos sin moverte de lugar.'
          : 'Detectamos un aumento de pasos anormalmente rápido.';
        Alert.alert(
          '⚠️ Actividad sospechosa',
          r.penalty_applied
            ? `${motivo} Esos pasos no se contarán y se descontó 1 FitCoin de tu saldo.`
            : `${motivo} Esos pasos no se contarán.`,
          [{ text: 'Entendido' }],
        );
      }

      if (r.coins_awarded > 0) {
        console.log(`[useActivity] +${r.coins_awarded} FC → ${r.new_balance} FC`);
      }
    } catch (e) {
      reportError('Red (sync)', e instanceof Error ? e.message : String(e));
    } finally {
      syncBusy.current = false;
    }
  }, [checkDayChange, currentSteps, getCoords, reportError, updateUI]);

  // ── Pull-to-refresh: sync + relectura completa ─────────────────────────────
  const refreshData = useCallback(async () => {
    setRefreshing(true);
    try {
      await syncActivity(true, true); // con lectura de ubicación fresca
      await loadFromSupabase(); // cubre canjes hechos en otra pantalla/dispositivo
    } catch (e) {
      console.warn('[useActivity] Error en refresh:', e);
    } finally {
      if (isMounted.current) setRefreshing(false);
    }
  }, [syncActivity, loadFromSupabase]);

  // ── iOS: HealthKit ─────────────────────────────────────────────────────────
  const readIosHealth = useCallback(async (): Promise<number> => {
    try {
      const { start, end } = todayRange();
      const { steps } = await Pedometer.getStepCountAsync(start, end);
      return steps;
    } catch { return 0; }
  }, []);

  // ── Watch: SOLO actualiza la UI, jamás genera monedas ─────────────────────
  const startWatch = useCallback(() => {
    watchSub.current?.remove();
    watchSub.current = null;
    sessionRawBase.current   = 0;
    sessionRawLatest.current = 0;

    watchSub.current = Pedometer.watchStepCount(({ steps: rawSessionSteps }) => {
      if (!isMounted.current) return;
      sessionRawLatest.current = rawSessionSteps;
      updateUI(currentSteps());
    });
  }, [currentSteps, updateUI]);

  // ── Inicialización ─────────────────────────────────────────────────────────
  useEffect(() => {
    isMounted.current = true;
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let syncTimer: ReturnType<typeof setInterval> | null = null;

    const init = async () => {
      // 1) Datos del día + saldo (antes de pedir permisos: la UI carga rápido)
      try {
        await loadFromSupabase();
      } catch (e) {
        console.warn('[useActivity] Error init Supabase:', e);
      }

      // 2) Permisos de actividad física
      const { status } = await Pedometer.requestPermissionsAsync();

      // Permiso de ubicación (solo "mientras usas la app", nunca en background).
      // Si el usuario lo niega, la app sigue funcionando: el servidor
      // valida solo por ritmo de pasos.
      try {
        const loc = await Location.requestForegroundPermissionsAsync();
        locationAllowed.current = loc.status === 'granted';
      } catch {
        locationAllowed.current = false;
      }

      if (status !== 'granted') {
        if (isMounted.current) {
          setActivity(prev => ({
            ...prev, isAvailable: false, isLoading: false,
            error: 'Permiso de actividad física denegado.',
          }));
        }
        return;
      }

      // 3) Sensor
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

      // 4) Conteo
      if (Platform.OS === 'ios') {
        iosDailySteps.current = await readIosHealth();
        updateUI(currentSteps());
        pollTimer = setInterval(async () => {
          if (!isMounted.current) return;
          const fresh = await readIosHealth();
          if (fresh > iosDailySteps.current) {
            iosDailySteps.current = fresh;
            updateUI(currentSteps());
          }
        }, HEALTH_POLL_MS);
      } else {
        updateUI(currentSteps());
      }

      startWatch();

      // 5) SYNC DE LÍNEA BASE: marca last_sync_at = ahora y guarda la
      // ubicación de partida (con lectura GPS fresca al abrir el Dashboard).
      syncActivity(false, true);

      // 6) Sync periódico (aquí es donde el servidor valida y otorga FC)
      syncTimer = setInterval(() => {
        syncActivity(true);
      }, SYNC_INTERVAL_MS);

      // Sync forzado pre-logout (App.tsx llama flushActivitySync)
      registerActivitySync(() => syncActivity(false));
    };

    const onAppState = async (state: AppStateStatus) => {
      if (!isMounted.current) return;

      if (state === 'background' || state === 'inactive') {
        // Guardar pasos pendientes antes de que el SO suspenda la app
        await syncActivity(false);

      } else if (state === 'active') {
        checkDayChange();
        // Refrescar saldo y pasos del día automáticamente al volver
        try { await loadFromSupabase(); } catch {}

        if (Platform.OS === 'ios') {
          const fresh = await readIosHealth();
          if (fresh > iosDailySteps.current) {
            iosDailySteps.current = fresh;
            updateUI(currentSteps());
          }
        } else if (!watchSub.current) {
          startWatch();
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
  }, [checkDayChange, currentSteps, loadFromSupabase, readIosHealth, startWatch, syncActivity, updateUI]);

  return { activity, totalCoins, refreshing, refreshData };
}
