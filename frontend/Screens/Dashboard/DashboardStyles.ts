import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../lib/theme';

export function makeStyles(c: ThemeColors) {
  return StyleSheet.create({
    // ─── Base ────────────────────────────────────────────────────────────────
    container: {
      flex: 1,
      backgroundColor: c.bg,
    },

    content: {
      paddingHorizontal: 20,
      paddingTop: 54,
      paddingBottom: 100,
    },

    // ─── Header ──────────────────────────────────────────────────────────────
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
    },

    headerTextContainer: { flex: 1 },

    greeting: {
      fontSize: 14,
      color: c.textSecondary,
      marginBottom: 4,
    },

    title: {
      fontSize: 26,
      fontWeight: '800',
      color: c.textPrimary,
    },

    notificationButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: c.surface,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: c.shadowOpacity,
      shadowRadius: 10,
      elevation: c.elevation,
    },

    // ─── Progress Card ────────────────────────────────────────────────────────
    progressCard: {
      backgroundColor: c.surface,
      borderRadius: 32,
      paddingVertical: 26,
      paddingHorizontal: 20,
      alignItems: 'center',
      marginBottom: 22,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: c.shadowOpacity + 0.01,
      shadowRadius: 16,
      elevation: c.elevation + 2,
    },

    sensorWarning: {
      fontSize: 12,
      color: '#F97316',
      textAlign: 'center',
      marginBottom: 10,
      paddingHorizontal: 16,
    },

    progressCircle: {
      width: 210,
      height: 210,
      borderRadius: 105,
      borderWidth: 16,
      borderColor: c.greenBorder,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: c.greenLight,
    },

    progressPercent: {
      position: 'absolute',
      top: 24,
      fontSize: 13,
      fontWeight: '700',
      color: c.greenDark,
    },

    stepsText: {
      fontSize: 14,
      fontWeight: '700',
      color: c.textPrimary,
      marginBottom: 4,
    },

    fitCoinsValue: {
      fontSize: 42,
      fontWeight: '900',
      color: c.textPrimary,
      marginTop: 2,
    },

    fitCoinsLabelContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },

    coinDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: c.gold,
      marginRight: 6,
    },

    fitCoinsLabel: {
      fontSize: 14,
      fontWeight: '700',
      color: c.textSecondary,
    },

    goalRow: {
      marginTop: 18,
      alignItems: 'center',
    },

    goalText: {
      fontSize: 13,
      color: c.textSecondary,
      fontWeight: '600',
      textAlign: 'center',
    },

    // ─── Stats ───────────────────────────────────────────────────────────────
    statsRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 26,
    },

    statCard: {
      flex: 1,
      backgroundColor: c.surface,
      borderRadius: 18,
      paddingVertical: 14,
      paddingHorizontal: 10,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: c.shadowOpacity,
      shadowRadius: 12,
      elevation: c.elevation,
    },

    statIcon: { marginBottom: 6 },

    statLabel: {
      fontSize: 11,
      color: c.textSecondary,
      marginBottom: 4,
    },

    statValue: {
      fontSize: 14,
      fontWeight: '800',
      color: c.textPrimary,
    },

    // ─── Sección ─────────────────────────────────────────────────────────────
    sectionTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: c.textPrimary,
      marginBottom: 14,
    },

    // ─── Quick Actions ────────────────────────────────────────────────────────
    quickActionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },

    quickActionCard: {
      width: '48%',
      backgroundColor: c.surface,
      borderRadius: 22,
      padding: 18,
      minHeight: 120,
      justifyContent: 'space-between',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: c.shadowOpacity,
      shadowRadius: 12,
      elevation: c.elevation,
    },

    quickActionIcon: { marginBottom: 12 },

    quickActionTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: c.textPrimary,
    },

    quickActionText: {
      fontSize: 12,
      color: c.textSecondary,
      marginTop: 4,
      lineHeight: 17,
    },

    // ─── Profile Tab ─────────────────────────────────────────────────────────
    profileContainer: {
      flex: 1,
      paddingTop: 54,
      paddingHorizontal: 24,
      paddingBottom: 100,
      backgroundColor: c.bg,
    },

    profileHeader: {
      alignItems: 'center',
      marginBottom: 32,
    },

    avatarCircle: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: c.green,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 14,
    },

    avatarInitial: {
      fontSize: 34,
      fontWeight: '900',
      color: '#FFFFFF',
    },

    profileName: {
      fontSize: 22,
      fontWeight: '800',
      color: c.textPrimary,
      marginBottom: 4,
    },

    profileRole: {
      fontSize: 13,
      color: c.textSecondary,
      fontWeight: '600',
    },

    settingsCard: {
      backgroundColor: c.surface,
      borderRadius: 22,
      marginBottom: 14,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: c.shadowOpacity,
      shadowRadius: 10,
      elevation: c.elevation,
      overflow: 'hidden',
    },

    settingsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      paddingHorizontal: 18,
    },

    settingsRowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },

    settingsRowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },

    settingsIconBox: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: c.surfaceAlt,
      justifyContent: 'center',
      alignItems: 'center',
    },

    settingsLabel: {
      fontSize: 15,
      fontWeight: '700',
      color: c.textPrimary,
    },

    settingsValue: {
      fontSize: 13,
      color: c.textSecondary,
      fontWeight: '600',
    },

    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.surface,
      borderRadius: 18,
      paddingVertical: 16,
      borderWidth: 1,
      borderColor: '#EF4444',
      marginTop: 8,
    },

    logoutButtonText: {
      color: '#EF4444',
      fontSize: 15,
      fontWeight: '800',
      marginLeft: 8,
    },

    // ─── Bottom Nav ───────────────────────────────────────────────────────────
    bottomNav: {
      position: 'absolute',
      left: 18,
      right: 18,
      bottom: 18,
      height: 70,
      backgroundColor: c.bottomNav,
      borderRadius: 26,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: c.shadowOpacity + 0.05,
      shadowRadius: 18,
      elevation: c.elevation + 6,
    },

    tabButton: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 3,
    },

    tabLabel: {
      fontSize: 10,
      color: c.textMuted,
      fontWeight: '600',
    },

    activeTabLabel: {
      color: c.green,
      fontWeight: '700',
    },
  });
}
