import React, { useMemo } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme';
import { makeStyles } from './HomeStyle';

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

const TUTORIAL_STEPS = [
  {
    icon: 'person-add-outline' as const,
    title: 'Crea tu cuenta',
    text: 'Regístrate en segundos con tu correo. Es gratis.',
  },
  {
    icon: 'walk-outline' as const,
    title: 'Actívate y camina',
    text: 'La app detecta tus pasos y kilómetros en tiempo real, como Strava.',
  },
  {
    icon: 'trophy-outline' as const,
    title: 'Acumula FitCoins',
    text: 'Cada kilómetro recorrido te da 5 FC. Más actividad = más recompensas.',
  },
  {
    icon: 'gift-outline' as const,
    title: 'Canjea en el Marketplace',
    text: 'Elige entre café, gym, comida saludable y más. Muestra tu QR y listo.',
  },
];

export default function HomeScreen({
  onNavigateToLogin,
  onNavigateToRegister,
}: HomeScreenProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <View style={styles.hero}>
          {/* Navbar */}
          <View style={styles.header}>
            <View style={styles.logoGroup}>
              <View style={styles.logoContainer}>
                <Image
                  source={require('../assets/img/logo_Fitcoin.png')}
                  style={styles.logoImage}
                  resizeMode="cover"
                />
              </View>
              <View>
                <Text style={styles.brandName}>FitCoin</Text>
                <Text style={styles.brandSubtitle}>Fitness Rewards</Text>
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

          {/* Tagline */}
          <View style={styles.heroContent}>
            <View style={styles.heroEyebrow}>
              <View style={styles.heroEyebrowDot} />
              <Text style={styles.heroEyebrowText}>Activo ahora</Text>
            </View>

            <Text style={styles.heroTitle}>
              Muévete.{'\n'}
              <Text style={styles.heroTitleAccent}>Gana.</Text> Canjea.
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
                <Ionicons name="rocket-outline" size={18} color="#FFF" />
                <Text style={styles.primaryButtonText}>Empezar gratis</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                activeOpacity={0.85}
                onPress={onNavigateToLogin}
              >
                <Text style={styles.secondaryButtonText}>Ya tengo cuenta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Banda de stats ────────────────────────────────────────────────── */}
        <View style={styles.statsBand}>
          <View style={styles.statBandItem}>
            <Text style={styles.statBandValue}>5 FC</Text>
            <Text style={styles.statBandLabel}>por km</Text>
          </View>
          <View style={styles.statBandDivider} />
          <View style={styles.statBandItem}>
            <Text style={styles.statBandValue}>Real</Text>
            <Text style={styles.statBandLabel}>GPS + sensores</Text>
          </View>
          <View style={styles.statBandDivider} />
          <View style={styles.statBandItem}>
            <Text style={styles.statBandValue}>Gratis</Text>
            <Text style={styles.statBandLabel}>sin suscripción</Text>
          </View>
        </View>

        {/* ── Contenido principal ───────────────────────────────────────────── */}
        <View style={styles.content}>

          {/* Gana FitCoins */}
          <Text style={styles.sectionLabel}>Cómo ganar</Text>
          <Text style={styles.sectionTitle}>Cada paso cuenta</Text>

          <View style={styles.earnGrid}>
            <View style={styles.earnCard}>
              <View style={styles.earnIconBox}>
                <Ionicons name="footsteps-outline" size={22} color={colors.greenDark} />
              </View>
              <Text style={styles.earnTitle}>Pasos diarios</Text>
              <Text style={styles.earnDesc}>Camina y suma progreso sin esfuerzo extra.</Text>
              <View style={styles.earnBadge}>
                <Text style={styles.earnBadgeText}>+5 FC / km</Text>
              </View>
            </View>

            <View style={styles.earnCard}>
              <View style={styles.earnIconBox}>
                <Ionicons name="map-outline" size={22} color={colors.greenDark} />
              </View>
              <Text style={styles.earnTitle}>Distancia</Text>
              <Text style={styles.earnDesc}>Cada kilómetro recorrido genera recompensas.</Text>
              <View style={styles.earnBadge}>
                <Text style={styles.earnBadgeText}>automático</Text>
              </View>
            </View>
          </View>

          <View style={styles.earnCardWide}>
            <View style={styles.earnIconBox}>
              <Ionicons name="time-outline" size={22} color={colors.greenDark} />
            </View>
            <View style={styles.earnCardWideInfo}>
              <Text style={styles.earnCardWideTitle}>Minutos activos</Text>
              <Text style={styles.earnCardWideDesc}>
                Mantén rachas de actividad y desbloquea bonificaciones especiales.
              </Text>
            </View>
            <View style={styles.earnBadge}>
              <Text style={styles.earnBadgeText}>+bonus</Text>
            </View>
          </View>

          {/* Marketplace banner */}
          <View style={styles.marketplaceBanner}>
            <View style={styles.marketplaceBannerLeft}>
              <Text style={styles.marketplaceLabel}>Marketplace</Text>
              <Text style={styles.marketplaceTitle}>Recompensas cerca de ti</Text>
              <Text style={styles.marketplaceSubtitle}>
                Café, gym, comida saludable y más.
              </Text>
            </View>
            <View style={{ width: 16 }} />
            <TouchableOpacity
              style={styles.marketplaceButton}
              activeOpacity={0.85}
              onPress={onNavigateToRegister}
            >
              <Ionicons name="storefront-outline" size={22} color="#FFF" />
              <Text style={[styles.marketplaceButtonText, { marginTop: 4 }]}>Ver</Text>
            </TouchableOpacity>
          </View>

          {/* Tutorial */}
          <Text style={styles.sectionLabel}>Tutorial</Text>
          <Text style={styles.sectionTitle}>4 pasos para empezar</Text>

          <View style={styles.tutorialCard}>
            {TUTORIAL_STEPS.map((step, i) => {
              const isLast = i === TUTORIAL_STEPS.length - 1;
              return (
                <View key={i} style={isLast ? styles.tutorialStepLast : styles.tutorialStep}>
                  <View style={styles.tutorialStepLeft}>
                    <View style={styles.tutorialStepNum}>
                      <Ionicons name={step.icon} size={20} color={colors.greenDark} />
                    </View>
                    {!isLast && <View style={styles.tutorialConnector} />}
                  </View>
                  <View style={styles.tutorialStepContent}>
                    <Text style={styles.tutorialStepTitle}>{step.title}</Text>
                    <Text style={styles.tutorialStepText}>{step.text}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
