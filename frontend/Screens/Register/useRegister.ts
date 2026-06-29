// ─────────────────────────────────────────────────────────────────────────────
// ARCHIVO: Screens/Register/useRegister.ts
// PROPÓSITO: Maneja el registro de nuevos usuarios con Supabase Auth.
//
// FLUJO:
//   1. Valida los campos del formulario en el dispositivo.
//   2. Llama a supabase.auth.signUp → crea el usuario en auth.users.
//   3. El trigger SQL handle_new_user() crea automáticamente el perfil
//      en public.profiles (debes crear ese trigger en Supabase, ver abajo).
//   4. Muestra un mensaje pidiendo confirmar el correo.
//
// ⚠️  IMPORTANTE SOBRE CONFIRMACIÓN DE CORREO:
//   Por defecto Supabase envía un email de confirmación.
//   Si quieres desactivarlo durante desarrollo:
//     Supabase Dashboard → Authentication → Settings →
//     desactiva "Enable email confirmations".
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { Alert } from 'react-native';

// AQUÍ SE IMPORTA EL CLIENTE DE SUPABASE
import { supabase } from '../../lib/supabase';

export const useRegister = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // AQUÍ SE VALIDA LA CONTRASEÑA — puedes ajustar estas reglas si lo necesitas
  const isValidPassword = (pass: string): boolean => {
    if (pass.length < 10) return false;
    if (!/[A-Z]/.test(pass)) return false;
    if (!/[a-z]/.test(pass)) return false;
    if (!/[0-9]/.test(pass)) return false;
    if (!/[^A-Za-z0-9]/.test(pass)) return false;
    if (/(.)\1{3,}/.test(pass)) return false;
    return true;
  };

  const handleRegister = async () => {
    // ── Validaciones locales ──────────────────────────────────────────────────
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Por favor, llena todos los campos.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    if (!isValidPassword(password)) {
      Alert.alert(
        'Contraseña Débil',
        'Tu contraseña debe tener mínimo 10 caracteres, una mayúscula, una minúscula, un número, un carácter especial y no repetir un carácter más de 3 veces seguidas.'
      );
      return;
    }

    setLoading(true);

    try {
      // AQUÍ SE LLAMA A SUPABASE AUTH PARA REGISTRAR AL USUARIO
      // - email y password van directo a auth.users
      // - data.full_name se guarda en raw_user_meta_data, que el trigger SQL
      //   usa para rellenar public.profiles.full_name automáticamente
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            // MODIFICAR AQUÍ si quieres enviar campos extra al perfil
            full_name: name.trim(),
          },
        },
      });

      if (error) {
        // AQUÍ SE MANEJAN ERRORES DE SUPABASE AUTH
        // Errores comunes:
        //   "User already registered"  → el correo ya existe
        //   "Password should be at least 6 characters" → mínimo de Supabase
        Alert.alert('Error de registro', error.message);
        return;
      }

      // AQUÍ SE VERIFICA SI EL USUARIO FUE CREADO CORRECTAMENTE
      if (data.user) {
        // Si Supabase tiene confirmación de correo activada, session será null
        // y el usuario debe verificar su email antes de iniciar sesión.
        if (data.session === null) {
          Alert.alert(
            '¡Registro exitoso!',
            'Te enviamos un correo de confirmación. Revisa tu bandeja de entrada y confirma tu cuenta antes de iniciar sesión.'
          );
        } else {
          // Si la confirmación de correo está desactivada, la sesión ya existe
          Alert.alert(
            '¡Bienvenido a FitCoin!',
            'Tu cuenta fue creada correctamente. Ya puedes iniciar sesión.'
          );
        }
      }
    } catch (error) {
      // AQUÍ SE MANEJAN ERRORES DE RED U OTROS INESPERADOS
      console.error('[useRegister] Error inesperado:', error);
      Alert.alert('Error', 'Ocurrió un problema inesperado. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    handleRegister,
  };
};
