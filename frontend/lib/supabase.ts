// ─────────────────────────────────────────────────────────────────────────────
// ARCHIVO: lib/supabase.ts
// PROPÓSITO: Inicializa el cliente de Supabase que usan todos los hooks.
//
// ⚠️  ANTES DE USAR ESTE ARCHIVO:
//   1. Crea el archivo frontend/.env con tus credenciales (ver .env).
//   2. Instala las dependencias:
//        npm install @supabase/supabase-js
//        npx expo install @react-native-async-storage/async-storage react-native-url-polyfill
// ─────────────────────────────────────────────────────────────────────────────

// Polyfill necesario para que el cliente de Supabase funcione en React Native
import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// MODIFICAR AQUÍ: estas variables vienen de frontend/.env
// Expo las expone automáticamente porque empiezan con EXPO_PUBLIC_
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

// Validación en tiempo de ejecución — te avisará si olvidaste llenar el .env
if (!SUPABASE_URL || SUPABASE_URL === 'PEGAR_AQUI_MI_SUPABASE_URL') {
  throw new Error(
    '[Supabase] EXPO_PUBLIC_SUPABASE_URL no está configurada.\n' +
    'Abre frontend/.env y pega tu Project URL.'
  );
}
if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === 'PEGAR_AQUI_MI_SUPABASE_ANON_KEY') {
  throw new Error(
    '[Supabase] EXPO_PUBLIC_SUPABASE_ANON_KEY no está configurada.\n' +
    'Abre frontend/.env y pega tu anon public key.'
  );
}

// AQUÍ SE CREA EL CLIENTE GLOBAL DE SUPABASE
// - storage: AsyncStorage guarda la sesión entre reinicios de la app
// - autoRefreshToken: renueva el JWT automáticamente antes de que expire
// - persistSession: mantiene la sesión aunque el usuario cierre la app
// - detectSessionInUrl: false porque en React Native no hay URL de redirección
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
