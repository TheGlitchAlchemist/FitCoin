import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import LoginScreen from './Screens/Login/LoginScreen';
import RegisterScreen from './Screens/Register/RegisterScreen';
import HomeScreen from './Screens/Home';
import { getToken, removeToken } from './utils/secureStorage'; 


console.log(
  "¡DETENTE!", 
);
console.log(
  "Esta sección está diseñada exclusivamente para desarrolladores. Si alguien te pidió que copiaras y pegaras código aquí para ganar FitCoins, es una ESTAFA y tendrán acceso completo a tu cuenta y tokens.", 
);

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('login'); 
  const [userData, setUserData] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true); 

  useEffect(() => {
    const verificarSesionExistente = async () => {
      try {
        const token = await getToken(); 
        
        if (!token) {
          setCheckingAuth(false);
          return; 
        }

        const API_URL = 'http://192.168.1.24:3000/api/auth/validate';
        const response = await fetch(API_URL, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (response.ok && data.valid) {
          
          setUserData(data.user); 
          setCurrentScreen('home'); 
        } else {
        
          await removeToken();
        }
      } catch (error) {
        console.error('Error al validar sesión previa con el Middleware:', error);
      } finally {
        setCheckingAuth(false); 
      }
    };

    verificarSesionExistente();
  }, []);

  const handleLoginSuccess = (userResponse) => {
    setUserData(userResponse);
    setCurrentScreen('home');
  };

  const handleLogout = async () => {
    try {
      await removeToken(); 
    } catch (e) {
      console.error(e);
    }
    setUserData(null);
    setCurrentScreen('login');
  };

  if (checkingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#34d399" />
      </View>
    );
  }

  if (currentScreen === 'login') {
    return (
      <LoginScreen 
        onNavigateToRegister={() => setCurrentScreen('register')} 
        onLoginSuccess={handleLoginSuccess} 
      />
    );
  }

  if (currentScreen === 'register') {
    return (
      <RegisterScreen 
        onNavigateToLogin={() => setCurrentScreen('login')} 
      />
    );
  }

  if (currentScreen === 'home') {
    return (
      <HomeScreen 
        route={{ 
          params: { 
            name: userData?.nombre || userData?.name,
            saldo: userData?.saldo
          } 
        }} 
        onLogout={handleLogout} 
      />
    );
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
});