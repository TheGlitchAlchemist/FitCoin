// ─────────────────────────────────────────────────────────────────────────────
// ARCHIVO: App.tsx
// PROPÓSITO: Punto de entrada de la app. Maneja toda la navegación manual
//            y el estado de sesión con Supabase Auth.
//
// FLUJO AL ABRIR LA APP:
//   1. Se ejecuta supabase.auth.getSession() para ver si ya hay sesión guardada.
//   2. Si hay sesión → consulta el perfil → navega al Dashboard.
//   3. Si no hay sesión → navega al Home.
//
// FLUJO DE LOGOUT:
//   1. Se llama a supabase.auth.signOut().
//   2. Supabase borra la sesión de AsyncStorage automáticamente.
//   3. La app navega de vuelta al Home.
//
// NOTA SOBRE onAuthStateChange:
//   Supabase dispara este evento cada vez que la sesión cambia
//   (login, logout, token renovado). Lo usamos como fuente de verdad principal.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';

import LoginScreen from './Screens/Login/LoginScreen';
import RegisterScreen from './Screens/Register/RegisterScreen';
import HomeScreen from './Screens/Home';
import DashboardScreen from './Screens/Dashboard';

import { supabase } from './lib/supabase';
import { flushActivitySync } from './lib/activitySync';
import { ThemeProvider, useTheme } from './lib/theme';

type CurrentScreen = 'home' | 'login' | 'register' | 'dashboard';

type UserData = {
  nombre?: string;
  name?: string;
  email?: string;
  saldo?: number;
  [key: string]: unknown;
};

// Mensaje de seguridad para disuadir ataques de ingeniería social en consola
console.log('¡DETENTE!');
console.log(
  'Esta sección está diseñada exclusivamente para desarrolladores. Si alguien te pidió que copiaras y pegaras código aquí para ganar FitCoins, es una ESTAFA y tendrán acceso completo a tu cuenta y tokens.'
);

function AppContent() {
  const { isDark } = useTheme();
  const [currentScreen, setCurrentScreen] = useState<CurrentScreen>('home');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  // Ocultar barra de navegación de Android (botones inicio/atrás/recientes)
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync('hidden');
      NavigationBar.setBehaviorAsync('overlay-swipe');
    }
  }, []);

  // ── AQUÍ SE CONSULTA EL PERFIL Y EL SALDO REAL DEL USUARIO ─────────────────
  // Perfil → public.profiles
  // Saldo  → último balance_after de coin_transactions (saldo real acumulado)
  const fetchProfile = async (userId: string, userEmail?: string): Promise<UserData> => {
    // Consultar perfil
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url, role, status')
      .eq('id', userId)
      .single();

    // AQUÍ SE OBTIENE EL SALDO REAL DESDE coin_transactions
    // balance_after del último registro = saldo total acumulado del usuario
    const { data: lastTx } = await supabase
      .from('coin_transactions')
      .select('balance_after')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const saldo = lastTx?.balance_after ?? 0;

    return {
      name:   profile?.full_name ?? userEmail ?? 'Usuario',
      nombre: profile?.full_name ?? userEmail ?? 'Usuario',
      email:  profile?.email     ?? userEmail,
      saldo,
    };
  };

  useEffect(() => {
    // ── PASO 1: Verificar si hay sesión activa guardada en el dispositivo ───────
    // Esto corre una sola vez al montar la app.
    const verificarSesionExistente = async () => {
      try {
        // AQUÍ SE OBTIENE LA SESIÓN GUARDADA EN ASYNCSTORAGE
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.warn('[App] Error al obtener sesión:', error.message);
          setCurrentScreen('home');
          return;
        }

        if (session?.user) {
          // AQUÍ SE NAVEGA AL DASHBOARD SI YA HABÍA SESIÓN GUARDADA
          const profile = await fetchProfile(session.user.id, session.user.email);
          setUserData(profile);
          setCurrentScreen('dashboard');
        } else {
          setCurrentScreen('home');
        }
      } catch (error) {
        console.error('[App] Error inesperado al verificar sesión:', error);
        setCurrentScreen('home');
      } finally {
        setCheckingAuth(false);
      }
    };

    verificarSesionExistente();

    // ── PASO 2: Escuchar cambios de sesión en tiempo real ────────────────────
    // onAuthStateChange detecta: login, logout, token renovado, etc.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // AQUÍ SE DETECTAN CAMBIOS DE SESIÓN AUTOMÁTICAMENTE
        // event puede ser: SIGNED_IN | SIGNED_OUT | TOKEN_REFRESHED | etc.
        if (event === 'SIGNED_OUT' || !session) {
          setUserData(null);
          setCurrentScreen('home');
        }
        // SIGNED_IN se maneja vía handleLoginSuccess para tener control explícito
      }
    );

    // Limpia la suscripción cuando el componente se desmonte
    return () => {
      subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── AQUÍ SE MANDA AL DASHBOARD DESPUÉS DEL LOGIN ───────────────────────────
  // Este callback lo llama useLogin cuando el login + consulta de perfil son exitosos.
  const handleLoginSuccess = (userResponse: UserData) => {
    setUserData(userResponse);
    setCurrentScreen('dashboard');
  };

  // ── AQUÍ SE CIERRA LA SESIÓN ────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      // SYNC FORZADO antes de cerrar sesión
      // Guarda los pasos y monedas pendientes en Supabase antes de desconectar
      await flushActivitySync();
    } catch (e) {
      console.warn('[App] Error en flush pre-logout:', e);
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('[App] Error al cerrar sesión:', error.message);
      }
    } catch (error) {
      console.error('[App] Error inesperado al cerrar sesión:', error);
    }

    // Aunque falle signOut, limpiamos el estado local
    setUserData(null);
    setCurrentScreen('home');
  };

  const goToHome = () => setCurrentScreen('home');
  const goToLogin = () => setCurrentScreen('login');
  const goToRegister = () => setCurrentScreen('register');

  // ── Pantalla de carga mientras se verifica la sesión ─────────────────────
  const renderScreen = () => {
    if (checkingAuth) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#22C55E" />
        </View>
      );
    }

    if (currentScreen === 'login') {
      return (
        <LoginScreen
          onNavigateToRegister={goToRegister}
          onLoginSuccess={handleLoginSuccess}
          onCancel={goToHome}
        />
      );
    }

    if (currentScreen === 'register') {
      return (
        <RegisterScreen
          onNavigateToLogin={goToLogin}
          onCancel={goToHome}
        />
      );
    }

    if (currentScreen === 'dashboard') {
      return (
        <DashboardScreen
          userData={userData}
          onLogout={handleLogout}
        />
      );
    }

    return (
      <HomeScreen
        route={{
          params: {
            name: userData?.nombre || userData?.name || 'Usuario',
            saldo: userData?.saldo ?? 0,
          },
        }}
        onLogout={handleLogout}
        onNavigateToLogin={goToLogin}
        onNavigateToRegister={goToRegister}
      />
    );
  };

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} translucent />
      {renderScreen()}
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0B1324',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
