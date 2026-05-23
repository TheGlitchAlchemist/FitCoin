import { useState } from 'react';
import { Alert } from 'react-native';

export const useRegister = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isValidPassword = (pass) => {
    if (pass.length < 10) return false;
    if (!/[A-Z]/.test(pass)) return false;
    if (!/[a-z]/.test(pass)) return false;
    if (!/[0-9]/.test(pass)) return false;
    if (!/[^A-Za-z0-9]/.test(pass)) return false;
    if (/(.)\1{3,}/.test(pass)) return false;
    return true;
  };

  const handleRegister = async () => {
    // 1. Validación básica de campos vacíos
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Por favor, llena todos los campos.');
      return;
    }

    // 2. Regla de negocio básica: Contraseñas idénticas
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
      const API_URL = 'http://192.168.1.24:3000/api/auth/register'; 

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Cacha los errores de validación del backend (Email repetido, clave débil, etc.)
        Alert.alert('Error de Registro', data.error || 'Hubo un problema.');
        return;
      }

      Alert.alert('¡Éxito!', 'Usuario creado correctamente en la Base de Datos.');

    } catch (error) {
      console.error(error);
      Alert.alert('Error de Conexión', 'No se pudo conectar con el servidor FitCoin.');
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