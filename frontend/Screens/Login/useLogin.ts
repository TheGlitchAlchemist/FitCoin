// ─────────────────────────────────────────────────────────────────────────────
// ARCHIVO: Screens/Login/useLogin.ts
//
// FLUJO:
//   1. signInWithPassword → autentica al usuario.
//   2. Consulta profiles → obtiene nombre y datos del perfil.
//   3. Consulta coin_transactions → obtiene saldo real (balance_after del último tx).
//   4. Arma userData y lo manda a App.tsx → navega al Dashboard.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../../lib/supabase';

type LoginSuccessData = {
  nombre?: string;
  name?: string;
  email?: string;
  saldo?: number;
  [key: string]: unknown;
};

type UseLoginProps = (userData: LoginSuccessData) => void;

export const useLogin = (onLoginSuccess?: UseLoginProps) => {
  const [email, setEmail]       = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading]   = useState<boolean>(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor, llena todos los campos.');
      return;
    }

    setLoading(true);

    try {
      // AQUÍ SE AUTENTICA EL USUARIO CON SUPABASE
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (authError) {
        Alert.alert('Error de inicio de sesión', authError.message);
        return;
      }

      const user = authData.user;
      if (!user) {
        Alert.alert('Error', 'No se pudo obtener la información del usuario.');
        return;
      }

      // AQUÍ SE CONSULTA EL PERFIL DEL USUARIO EN public.profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, role, status')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.warn('[useLogin] Perfil no encontrado:', profileError.message);
      }

      // AQUÍ SE OBTIENE EL SALDO REAL DEL USUARIO DESDE wallets
      const { data: wallet } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .maybeSingle();

      const saldo = wallet?.balance ?? 0;

      // AQUÍ SE MANDA AL DASHBOARD DESPUÉS DEL LOGIN
      if (onLoginSuccess) {
        onLoginSuccess({
          name:   profile?.full_name ?? user.email ?? 'Usuario',
          nombre: profile?.full_name ?? user.email ?? 'Usuario',
          email:  profile?.email     ?? user.email,
          saldo,
        });
      }
    } catch (error) {
      console.error('[useLogin] Error inesperado:', error);
      Alert.alert('Error', 'Ocurrió un problema inesperado. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return { email, setEmail, password, setPassword, loading, handleLogin };
};
