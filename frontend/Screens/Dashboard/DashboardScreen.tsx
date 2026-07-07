import React, { useMemo } from 'react';
import { RefreshControl, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import CanjesScreen from '../Canjes/CanjesScreen';
import MarketplaceScreen from '../Marketplace/MarketplaceScreen';
import ProgressRing from '../../components/ProgressRing';
import { makeStyles } from './DashboardStyles';
import { DashboardTab, useDashboard } from './useDashboard';
import { useActivity } from '../../hooks/useActivity';
import { useTheme } from '../../lib/theme';

type UserData = {
  nombre?: string;
  name?: string;
  saldo?: number;
  [key: string]: unknown;
};

type DashboardScreenProps = {
  userData: UserData | null;
  onLogout: () => void;
};

const TAB_ICONS: Record<
  DashboardTab,
  { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }
> = {
  home:        { active: 'home',       inactive: 'home-outline' },
  marketplace: { active: 'storefront', inactive: 'storefront-outline' },
  redemptions: { active: 'ticket',     inactive: 'ticket-outline' },
  profile:     { active: 'person',     inactive: 'person-outline' },
};

const TAB_LABELS: Record<DashboardTab, string> = {
  home:        'Inicio',
  marketplace: 'Tienda',
  redemptions: 'Mis canjes',
  profile:     'Perfil',
};

type QuickAction = {
  tab?: DashboardTab;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  text: string;
};

const QUICK_ACTIONS: QuickAction[] = [
  { tab: 'marketplace', icon: 'storefront-outline', title: 'Marketplace',  text: 'Canjea tus FitCoins por recompensas.' },
  { tab: 'redemptions', icon: 'ticket-outline',     title: 'Mis canjes',   text: 'Consulta tus recompensas canjeadas.' },
  { tab: 'profile',     icon: 'person-outline',     title: 'Perfil',       text: 'Revisa tus datos y configuración.' },
  {                     icon: 'walk-outline',        title: 'Actividad',    text: 'Visualiza tu progreso diario.' },
];

function formatMinutes(min: number): string {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export default function DashboardScreen({ userData, onLogout }: DashboardScreenProps) {
  const { colors, isDark, toggleTheme } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { activeTab, setActiveTab } = useDashboard();

  const userName  = userData?.nombre || userData?.name || 'Usuario';
  const baseSaldo = userData?.saldo ?? 0;
  const { activity, totalCoins, refreshing, refreshData } = useActivity(baseSaldo);

  const initial = userName.charAt(0).toUpperCase();

  // ─── Home ──────────────────────────────────────────────────────────────────
  const renderHomeTab = () => (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refreshData}
          colors={[colors.green]}
          tintColor={colors.green}
          progressBackgroundColor={colors.surface}
        />
      }
    >
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.greeting}>Hola, {userName}</Text>
          <Text style={styles.title}>Dashboard</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton} activeOpacity={0.8}>
          <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.progressCard}>
        {!activity.isAvailable && !activity.isLoading && activity.error && (
          <Text style={styles.sensorWarning}>{activity.error}</Text>
        )}
        <ProgressRing
          pct={activity.progressPct}
          steps={activity.steps}
          coins={totalCoins}
          color={colors.green}
          trackColor={colors.greenBorder}
          textPrimary={colors.textPrimary}
          textSecondary={colors.textSecondary}
          gold={colors.gold}
        />
        <View style={styles.goalRow}>
          <Text style={styles.goalText}>
            Meta: 12,000 pasos · {activity.coinsToday}/12 FC hoy
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="flame-outline" size={18} color="#F97316" style={styles.statIcon} />
          <Text style={styles.statLabel}>Calorías</Text>
          <Text style={styles.statValue}>{activity.calories} cal</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="map-outline" size={18} color="#3B82F6" style={styles.statIcon} />
          <Text style={styles.statLabel}>Distancia</Text>
          <Text style={styles.statValue}>{formatDistance(activity.distanceKm)}</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="time-outline" size={18} color="#8B5CF6" style={styles.statIcon} />
          <Text style={styles.statLabel}>Activo</Text>
          <Text style={styles.statValue}>{formatMinutes(activity.activeMin)}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Accesos rápidos</Text>
      <View style={styles.quickActionsGrid}>
        {QUICK_ACTIONS.map((action) => (
          <TouchableOpacity
            key={action.title}
            style={styles.quickActionCard}
            activeOpacity={0.85}
            onPress={action.tab ? () => setActiveTab(action.tab!) : undefined}
          >
            <Ionicons name={action.icon} size={26} color={colors.textPrimary} style={styles.quickActionIcon} />
            <Text style={styles.quickActionTitle}>{action.title}</Text>
            <Text style={styles.quickActionText}>{action.text}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  // ─── Profile ───────────────────────────────────────────────────────────────
  const renderProfileTab = () => (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.profileContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refreshData}
          colors={[colors.green]}
          tintColor={colors.green}
          progressBackgroundColor={colors.surface}
        />
      }
    >
      <View style={styles.profileHeader}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitial}>{initial}</Text>
        </View>
        <Text style={styles.profileName}>{userName}</Text>
        <Text style={styles.profileRole}>Miembro FitCoin</Text>
      </View>

      <View style={styles.settingsCard}>
        <View style={[styles.settingsRow, styles.settingsRowBorder]}>
          <View style={styles.settingsRowLeft}>
            <View style={styles.settingsIconBox}>
              <Ionicons
                name={isDark ? 'moon' : 'sunny'}
                size={18}
                color={isDark ? '#818CF8' : '#F59E0B'}
              />
            </View>
            <Text style={styles.settingsLabel}>
              {isDark ? 'Modo oscuro' : 'Modo claro'}
            </Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.green }}
            thumbColor={isDark ? colors.green : '#FFFFFF'}
          />
        </View>

        <View style={[styles.settingsRow, styles.settingsRowBorder]}>
          <View style={styles.settingsRowLeft}>
            <View style={styles.settingsIconBox}>
              <Ionicons name="notifications-outline" size={18} color={colors.textSecondary} />
            </View>
            <Text style={styles.settingsLabel}>Notificaciones</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </View>

        <View style={styles.settingsRow}>
          <View style={styles.settingsRowLeft}>
            <View style={styles.settingsIconBox}>
              <Ionicons name="watch-outline" size={18} color={colors.textSecondary} />
            </View>
            <Text style={styles.settingsLabel}>Wearables</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </View>
      </View>

      <View style={styles.settingsCard}>
        <View style={[styles.settingsRow, styles.settingsRowBorder]}>
          <View style={styles.settingsRowLeft}>
            <View style={styles.settingsIconBox}>
              <Ionicons name="footsteps-outline" size={18} color={colors.green} />
            </View>
            <Text style={styles.settingsLabel}>Pasos hoy</Text>
          </View>
          <Text style={styles.settingsValue}>{activity.steps.toLocaleString()}</Text>
        </View>

        <View style={[styles.settingsRow, styles.settingsRowBorder]}>
          <View style={styles.settingsRowLeft}>
            <View style={styles.settingsIconBox}>
              <Ionicons name="trophy-outline" size={18} color={colors.gold} />
            </View>
            <Text style={styles.settingsLabel}>FitCoins totales</Text>
          </View>
          <Text style={styles.settingsValue}>{totalCoins} FC</Text>
        </View>

        <View style={[styles.settingsRow, styles.settingsRowBorder]}>
          <View style={styles.settingsRowLeft}>
            <View style={styles.settingsIconBox}>
              <Ionicons name="map-outline" size={18} color="#3B82F6" />
            </View>
            <Text style={styles.settingsLabel}>Distancia hoy</Text>
          </View>
          <Text style={styles.settingsValue}>{formatDistance(activity.distanceKm)}</Text>
        </View>

        <View style={styles.settingsRow}>
          <View style={styles.settingsRowLeft}>
            <View style={styles.settingsIconBox}>
              <Ionicons name="shield-checkmark-outline" size={18} color={colors.textSecondary} />
            </View>
            <Text style={styles.settingsLabel}>Tipo de cuenta</Text>
          </View>
          <Text style={styles.settingsValue}>Normal · máx 12 FC/día</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={onLogout} activeOpacity={0.85}>
        <Ionicons name="log-out-outline" size={18} color="#EF4444" />
        <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderContent = () => {
    if (activeTab === 'marketplace') {
      return (
        <MarketplaceScreen
          totalCoins={totalCoins}
          refreshing={refreshing}
          onRefresh={refreshData}
        />
      );
    }
    if (activeTab === 'redemptions') {
      return (
        <CanjesScreen
          refreshing={refreshing}
          onRefresh={refreshData}
        />
      );
    }
    if (activeTab === 'profile') return renderProfileTab();
    return renderHomeTab();
  };

  // ─── Bottom nav ────────────────────────────────────────────────────────────
  const renderTabButton = (tab: DashboardTab) => {
    const isActive = activeTab === tab;
    const iconName = isActive ? TAB_ICONS[tab].active : TAB_ICONS[tab].inactive;
    return (
      <TouchableOpacity
        key={tab}
        style={styles.tabButton}
        onPress={() => setActiveTab(tab)}
        activeOpacity={0.8}
      >
        <Ionicons name={iconName} size={22} color={isActive ? colors.green : colors.textMuted} />
        <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
          {TAB_LABELS[tab]}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {renderContent()}
      <View style={styles.bottomNav}>
        {renderTabButton('home')}
        {renderTabButton('marketplace')}
        {renderTabButton('redemptions')}
        {renderTabButton('profile')}
      </View>
    </View>
  );
}
