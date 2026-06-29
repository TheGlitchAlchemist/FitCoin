import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../lib/theme';

export function makeStyles(c: ThemeColors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: c.navy,
    },

    scroll: {
      flex: 1,
    },

    // ─── Hero (fondo oscuro) ──────────────────────────────────────────────────
    hero: {
      backgroundColor: c.navy,
      paddingTop: 52,
      paddingHorizontal: 22,
      paddingBottom: 44,
    },

    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 38,
    },

    logoGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },

    // Logo cuadrado sin partes blancas visibles
    logoContainer: {
      width: 52,
      height: 52,
      borderRadius: 14,
      backgroundColor: c.navy,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      overflow: 'hidden',
    },

    logoImage: {
      width: 52,
      height: 52,
    },

    brandName: {
      color: '#FFFFFF',
      fontSize: 22,
      fontWeight: '900',
    },

    brandSubtitle: {
      color: '#64748B',
      fontSize: 12,
      marginTop: 2,
    },

    authButtons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },

    loginButton: {
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.25)',
    },

    loginButtonText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '800',
    },

    registerButton: {
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 999,
      backgroundColor: c.green,
    },

    registerButtonText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '800',
    },

    // ─── Hero content ─────────────────────────────────────────────────────────
    heroContent: {},

    heroEyebrow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 14,
    },

    heroEyebrowDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: c.green,
    },

    heroEyebrowText: {
      color: c.green,
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 1.2,
      textTransform: 'uppercase',
    },

    heroTitle: {
      color: '#FFFFFF',
      fontSize: 44,
      fontWeight: '900',
      lineHeight: 50,
      marginBottom: 16,
    },

    heroTitleAccent: {
      color: c.green,
    },

    heroSubtitle: {
      color: '#94A3B8',
      fontSize: 16,
      lineHeight: 25,
      marginBottom: 32,
    },

    heroActions: {
      flexDirection: 'row',
      gap: 12,
    },

    primaryButton: {
      flex: 1,
      backgroundColor: c.green,
      paddingVertical: 16,
      borderRadius: 18,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
    },

    primaryButtonText: {
      color: '#FFFFFF',
      fontWeight: '900',
      fontSize: 15,
    },

    secondaryButton: {
      flex: 1,
      backgroundColor: 'rgba(255,255,255,0.07)',
      paddingVertical: 16,
      borderRadius: 18,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.15)',
    },

    secondaryButtonText: {
      color: '#FFFFFF',
      fontWeight: '800',
      fontSize: 15,
    },

    // ─── Stats band ───────────────────────────────────────────────────────────
    statsBand: {
      flexDirection: 'row',
      backgroundColor: 'rgba(255,255,255,0.05)',
      marginHorizontal: 22,
      marginTop: -14,
      marginBottom: 0,
      borderRadius: 22,
      paddingVertical: 18,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.08)',
    },

    statBandItem: {
      flex: 1,
      alignItems: 'center',
    },

    statBandDivider: {
      width: 1,
      backgroundColor: 'rgba(255,255,255,0.1)',
      marginVertical: 4,
    },

    statBandValue: {
      color: '#FFFFFF',
      fontSize: 20,
      fontWeight: '900',
    },

    statBandLabel: {
      color: '#64748B',
      fontSize: 11,
      fontWeight: '600',
      marginTop: 2,
    },

    // ─── Content section (fondo claro / oscuro según tema) ───────────────────
    content: {
      backgroundColor: c.bg,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      marginTop: 24,
      paddingHorizontal: 22,
      paddingTop: 32,
      paddingBottom: 48,
    },

    // ─── Sección "Gana coins" ─────────────────────────────────────────────────
    sectionLabel: {
      fontSize: 11,
      fontWeight: '800',
      color: c.green,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      marginBottom: 6,
    },

    sectionTitle: {
      fontSize: 24,
      fontWeight: '900',
      color: c.textPrimary,
      marginBottom: 20,
    },

    earnGrid: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 14,
    },

    earnCard: {
      flex: 1,
      backgroundColor: c.surface,
      borderRadius: 22,
      padding: 18,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: c.shadowOpacity,
      shadowRadius: 12,
      elevation: c.elevation,
    },

    earnIconBox: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: c.greenLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },

    earnTitle: {
      color: c.textPrimary,
      fontSize: 15,
      fontWeight: '900',
      marginBottom: 4,
    },

    earnDesc: {
      color: c.textSecondary,
      fontSize: 12,
      lineHeight: 17,
      marginBottom: 10,
    },

    earnBadge: {
      backgroundColor: c.greenLight,
      borderRadius: 8,
      paddingVertical: 3,
      paddingHorizontal: 10,
      alignSelf: 'flex-start',
      borderWidth: 1,
      borderColor: c.greenBorder,
    },

    earnBadgeText: {
      color: c.greenDark,
      fontSize: 13,
      fontWeight: '900',
    },

    earnCardWide: {
      backgroundColor: c.surface,
      borderRadius: 22,
      padding: 18,
      marginBottom: 30,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: c.shadowOpacity,
      shadowRadius: 12,
      elevation: c.elevation,
    },

    earnCardWideInfo: {
      flex: 1,
    },

    earnCardWideTitle: {
      color: c.textPrimary,
      fontSize: 16,
      fontWeight: '900',
      marginBottom: 4,
    },

    earnCardWideDesc: {
      color: c.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },

    // ─── Marketplace banner ───────────────────────────────────────────────────
    marketplaceBanner: {
      backgroundColor: c.navy,
      borderRadius: 26,
      padding: 22,
      marginBottom: 32,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 14,
      elevation: 8,
    },

    marketplaceBannerLeft: {
      flex: 1,
    },

    marketplaceLabel: {
      color: c.gold,
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      marginBottom: 6,
    },

    marketplaceTitle: {
      color: '#FFFFFF',
      fontSize: 20,
      fontWeight: '900',
      marginBottom: 6,
    },

    marketplaceSubtitle: {
      color: '#64748B',
      fontSize: 13,
      lineHeight: 19,
    },

    marketplaceButton: {
      backgroundColor: c.green,
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },

    marketplaceButtonText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '900',
    },

    // ─── Tutorial ─────────────────────────────────────────────────────────────
    tutorialCard: {
      backgroundColor: c.surface,
      borderRadius: 26,
      padding: 22,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: c.shadowOpacity,
      shadowRadius: 14,
      elevation: c.elevation,
    },

    tutorialStep: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 22,
      gap: 16,
    },

    tutorialStepLast: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 16,
    },

    tutorialStepLeft: {
      alignItems: 'center',
    },

    tutorialStepNum: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: c.greenLight,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: c.greenBorder,
    },

    tutorialStepNumText: {
      fontSize: 18,
      fontWeight: '900',
      color: c.greenDark,
    },

    tutorialConnector: {
      width: 2,
      flex: 1,
      backgroundColor: c.greenBorder,
      marginTop: 4,
      marginBottom: -6,
      alignSelf: 'center',
      minHeight: 18,
    },

    tutorialStepContent: {
      flex: 1,
      paddingTop: 4,
    },

    tutorialStepTitle: {
      color: c.textPrimary,
      fontSize: 16,
      fontWeight: '900',
      marginBottom: 4,
    },

    tutorialStepText: {
      color: c.textSecondary,
      fontSize: 13,
      lineHeight: 19,
    },
  });
}
