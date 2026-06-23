import React from "react";

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";

import { styles } from "./HomeStyle";

type HomeScreenProps = {
  route?: {
    params?: {
      name?: string;
      saldo?: number;
    };
  };
  onLogout?: () => void;
  onNavigateToLogin?: () => void;
  onNavigateToRegister?: () => void;
};

export default function HomeScreen({
  route,
  onNavigateToLogin,
  onNavigateToRegister,
}: HomeScreenProps) {
  const balance = route?.params?.saldo ?? 1250;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1324" />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.header}>
            <View style={styles.logoGroup}>
              <View style={styles.logoContainer}>
                <Image
                  source={require("../assets/img/logo_Fitcoin.png")}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>

              <View>
                <Text style={styles.brandName}>FitCoin</Text>
                <Text style={styles.brandSubtitle}>
                  Fitness Rewards
                </Text>
              </View>
            </View>

            <View style={styles.authButtons}>
              <TouchableOpacity
                style={styles.loginButton}
                activeOpacity={0.8}
                onPress={onNavigateToLogin}
              >
                <Text style={styles.loginButtonText}>Iniciar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.registerButton}
                activeOpacity={0.8}
                onPress={onNavigateToRegister}
              >
                <Text style={styles.registerButtonText}>Registro</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>
              Muévete.{"\n"}Gana. Canjea.
            </Text>

            <Text style={styles.heroSubtitle}>
              Convierte tu actividad física real en FitCoins y cámbialos por
              recompensas en negocios afiliados.
            </Text>

            <View style={styles.heroActions}>
              <TouchableOpacity
                style={styles.primaryButton}
                activeOpacity={0.85}
                onPress={onNavigateToRegister}
              >
                <Text style={styles.primaryButtonText}>
                  Empezar ahora
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                activeOpacity={0.85}
                onPress={onNavigateToLogin}
              >
                <Text style={styles.secondaryButtonText}>
                  Ya tengo cuenta
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.balanceCard}>
            <View style={styles.balanceTop}>
              <View>
                <Text style={styles.cardLabel}>Balance demo</Text>
                <Text style={styles.balanceText}>{balance} FC</Text>
              </View>

              <View style={styles.coinCircle}>
                <Text style={styles.coinEmoji}>🪙</Text>
              </View>
            </View>

            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
            </View>

            <Text style={styles.progressText}>
              Avance estimado hacia tu siguiente recompensa
            </Text>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Gana FitCoins con tu actividad
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>👟</Text>
              <Text style={styles.statTitle}>1000 pasos</Text>
              <Text style={styles.statDescription}>
                Camina y suma progreso diario.
              </Text>
              <Text style={styles.statReward}>+5 FC</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🏃</Text>
              <Text style={styles.statTitle}>1 km</Text>
              <Text style={styles.statDescription}>
                Cada kilómetro también cuenta.
              </Text>
              <Text style={styles.statReward}>+10 FC</Text>
            </View>
          </View>

          <View style={styles.activeCard}>
            <View style={styles.activeInfo}>
              <Text style={styles.statIcon}>⏱️</Text>
              <Text style={styles.activeTitle}>30 minutos activos</Text>
              <Text style={styles.activeSubtitle}>
                Cumple metas, mantén rachas y desbloquea nuevas recompensas.
              </Text>
            </View>

            <View style={styles.activeRewardBadge}>
              <Text style={styles.activeRewardText}>+20 FC</Text>
            </View>
          </View>

          <View style={styles.marketplaceCard}>
            <View>
              <Text style={styles.marketplaceLabel}>
                Marketplace
              </Text>
              <Text style={styles.marketplaceTitle}>
                Recompensas cerca de ti
              </Text>
              <Text style={styles.marketplaceSubtitle}>
                Café, gimnasio, comida saludable y más beneficios.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.marketplaceButton}
              activeOpacity={0.85}
            >
              <Text style={styles.marketplaceButtonText}>
                Explorar
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>¿Cómo funciona?</Text>
          </View>

          <View style={styles.stepsCard}>
            <View style={styles.step}>
              <View style={styles.stepIconBox}>
                <Text style={styles.stepIcon}>📲</Text>
              </View>

              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>
                  Conecta tu actividad
                </Text>
                <Text style={styles.stepText}>
                  Usa datos reales de salud y ejercicio desde tu dispositivo.
                </Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepIconBox}>
                <Text style={styles.stepIcon}>⚡</Text>
              </View>

              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>
                  Acumula FitCoins
                </Text>
                <Text style={styles.stepText}>
                  Tus pasos, kilómetros y minutos activos generan recompensas.
                </Text>
              </View>
            </View>

            <View style={styles.stepLast}>
              <View style={styles.stepIconBox}>
                <Text style={styles.stepIcon}>🎁</Text>
              </View>

              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>
                  Canjea recompensas
                </Text>
                <Text style={styles.stepText}>
                  Elige una oferta, genera tu cupón o QR y úsalo en el negocio.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}