import React, { useState } from 'react';
import LoginScreen from './Screens/Login/LoginScreen';
import RegisterScreen from './Screens/Register/RegisterScreen';

export default function App() {
  // 'login' o 'register'
  const [currentScreen, setCurrentScreen] = useState('login'); 

  if (currentScreen === 'login') {
    return (
      <LoginScreen onNavigateToRegister={() => setCurrentScreen('register')} />
    );
  }

  if (currentScreen === 'register') {
    return (
      <RegisterScreen onNavigateToLogin={() => setCurrentScreen('login')} />
    );
  }
}