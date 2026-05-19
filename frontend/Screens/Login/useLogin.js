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
      // Aquí irá la conexión HTTP segura a tu backend
      console.log('Enviando datos de forma segura:', { email, password });
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    handleLogin,
  };
};