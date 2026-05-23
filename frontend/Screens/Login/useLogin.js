import { useState } from 'react';
import { Alert } from 'react-native';

export const useLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor, llena todos los campos.');
      return;
    }
    
    setLoading(true);
    try {
      
      const API_URL = 'http://192.168.1.24:3000/api/auth/login';

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Cacha "Credenciales inválidas" del backend sin dar pistas de qué falló
        Alert.alert('Error de Login', data.error || 'Hubo un problema.');
        return;
      }

    
      const token = data.token;
      console.log('JWT recibido con éxito:', token);

      Alert.alert('¡Bienvenido!', `Hola de nuevo, ${data.user.name}. Tu saldo es de ${data.user.saldo} FitCoins.`);
      
    } catch (error) {
      console.error(error);
      Alert.alert('Error de Conexión', 'No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return { email, setEmail, password, setPassword, loading, handleLogin };
};