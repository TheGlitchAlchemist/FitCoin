import React from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useLogin } from "./useLogin";
import { styles } from "./LoginStyles";

type UserData = {
  nombre?: string;
  name?: string;
  email?: string;
  saldo?: number;
  [key: string]: unknown;
};

type LoginScreenProps = {
  onNavigateToRegister?: () => void;
  onLoginSuccess?: (userResponse: UserData) => void;
  onCancel?: () => void;
};

export default function LoginScreen({
  onNavigateToRegister,
  onLoginSuccess,
  onCancel,
}: LoginScreenProps) {
  const { email, setEmail, password, setPassword, loading, handleLogin } =
    useLogin(onLoginSuccess);

  return (
    <KeyboardAvoidingView
      style={styles.safeArea}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/img/logo_Fitcoin.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.brandName}>FitCoin</Text>
          <Text style={styles.tagline}>Tu esfuerzo tiene recompensa</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Iniciar sesión</Text>

          <Text style={styles.subtitle}>
            Entra a tu cuenta para seguir acumulando FitCoins.
          </Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Correo electrónico</Text>

            <TextInput
              style={styles.input}
              placeholder="ejemplo@correo.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.formGroup}>
            <View style={styles.passwordHeader}>
              <Text style={styles.label}>Contraseña</Text>

              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.forgotText}>¿Olvidaste?</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Ingresa tu contraseña"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Ingresar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            activeOpacity={0.85}
          >
            <Text style={styles.cancelButtonText}>Volver al inicio</Text>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>¿No tienes cuenta?</Text>

            <TouchableOpacity
              onPress={onNavigateToRegister}
              activeOpacity={0.7}
            >
              <Text style={styles.registerLink}> Regístrate</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.footerText}>
          Conecta tu actividad, gana FitCoins y canjea recompensas.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}