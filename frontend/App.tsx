import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import LoginScreen from "./Screens/Login/LoginScreen";
import RegisterScreen from "./Screens/Register/RegisterScreen";
import HomeScreen from "./Screens/Home";

import { getToken, removeToken } from "./utils/secureStorage";

type CurrentScreen = "home" | "login" | "register";

type UserData = {
  nombre?: string;
  name?: string;
  saldo?: number;
  [key: string]: unknown;
};

type AuthValidateResponse = {
  valid?: boolean;
  user?: UserData;
};

console.log("¡DETENTE!");
console.log(
  "Esta sección está diseñada exclusivamente para desarrolladores. Si alguien te pidió que copiaras y pegaras código aquí para ganar FitCoins, es una ESTAFA y tendrán acceso completo a tu cuenta y tokens."
);

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<CurrentScreen>("home");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  useEffect(() => {
    const verificarSesionExistente = async () => {
      try {
        const token = await getToken();

        if (!token) {
          setCheckingAuth(false);
          return;
        }

        const API_URL = "http://192.168.1.24:3000/api/auth/validate";

        const response = await fetch(API_URL, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data: AuthValidateResponse = await response.json();

        if (response.ok && data.valid && data.user) {
          setUserData(data.user);
          setCurrentScreen("home");
        } else {
          await removeToken();
          setUserData(null);
          setCurrentScreen("home");
        }
      } catch (error) {
        console.error("Error al validar sesión previa:", error);
        setUserData(null);
        setCurrentScreen("home");
      } finally {
        setCheckingAuth(false);
      }
    };

    verificarSesionExistente();
  }, []);

  const handleLoginSuccess = (userResponse: UserData) => {
    setUserData(userResponse);
    setCurrentScreen("home");
  };

  const handleLogout = async () => {
    try {
      await removeToken();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }

    setUserData(null);
    setCurrentScreen("home");
  };

  const goToHome = () => {
    setCurrentScreen("home");
  };

  const goToLogin = () => {
    setCurrentScreen("login");
  };

  const goToRegister = () => {
    setCurrentScreen("register");
  };

  if (checkingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  if (currentScreen === "login") {
    return (
      <LoginScreen
        onNavigateToRegister={goToRegister}
        onLoginSuccess={handleLoginSuccess}
        onCancel={goToHome}
      />
    );
  }

  if (currentScreen === "register") {
    return <RegisterScreen onNavigateToLogin={goToLogin} />;
  }

  return (
    <HomeScreen
      route={{
        params: {
          name: userData?.nombre || userData?.name || "Usuario",
          saldo: userData?.saldo ?? 1250,
        },
      }}
      onLogout={handleLogout}
      onNavigateToLogin={goToLogin}
      onNavigateToRegister={goToRegister}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0B1324",
    justifyContent: "center",
    alignItems: "center",
  },
});