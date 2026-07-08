import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../lib/theme';

export function makeStyles(c: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.bg,
    },

    content: {
      paddingHorizontal: 20,
      paddingTop: 54,
      paddingBottom: 100,
    },

    // ─── Header ───────────────────────────────────────────────────────────────
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },

    pageTitle: {
      fontSize: 28,
      fontWeight: '800',
      color: c.textPrimary,
    },

    // ─── Balance banner ───────────────────────────────────────────────────────
    balanceBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.balanceBg,
      borderRadius: 22,
      paddingVertical: 20,
      paddingHorizontal: 22,
      marginBottom: 28,
      gap: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: c.shadowOpacity + 0.1,
      shadowRadius: 14,
      elevation: c.elevation + 2,
    },

    balanceCoinCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: c.gold,
      justifyContent: 'center',
      alignItems: 'center',
    },

    balanceCoinLabel: {
      fontSize: 14,
      fontWeight: '900',
      color: '#FFFFFF',
    },

    balanceLabel: {
      fontSize: 13,
      color: c.balanceCardText,
      fontWeight: '600',
      marginBottom: 2,
    },

    balanceAmount: {
      fontSize: 26,
      fontWeight: '900',
      color: c.gold,
    },

    // ─── Section title ────────────────────────────────────────────────────────
    sectionTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: c.textPrimary,
      marginBottom: 14,
    },

    // ─── Reward cards (foto de fondo) ─────────────────────────────────────────
    rewardCard: {
      height: 190,
      borderRadius: 22,
      marginBottom: 16,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: c.shadowOpacity + 0.1,
      shadowRadius: 16,
      elevation: c.elevation + 4,
      justifyContent: 'flex-end',
    },

    rewardCardImage: {
      borderRadius: 22,
    },

    rewardOverlay: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: 'rgba(0,0,0,0.65)',
      paddingVertical: 16,
      paddingHorizontal: 18,
      gap: 12,
    },

    rewardOverlayLeft: {
      flex: 1,
      gap: 4,
    },

    rewardCardBusiness: {
      fontSize: 11,
      fontWeight: '600',
      color: 'rgba(255,255,255,0.75)',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },

    // Etiqueta del negocio (pill con color distinto)
    businessTag: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(59,130,246,0.9)',
      borderRadius: 8,
      paddingVertical: 3,
      paddingHorizontal: 8,
      gap: 4,
      marginBottom: 2,
    },

    businessTagText: {
      fontSize: 10,
      fontWeight: '800',
      color: '#FFFFFF',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },

    rewardDescription: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.85)',
      lineHeight: 16,
    },

    rewardCardName: {
      fontSize: 17,
      fontWeight: '800',
      color: '#FFFFFF',
    },

    rewardCostBadge: {
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(212,175,55,0.22)',
      borderRadius: 8,
      paddingVertical: 3,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: c.gold,
      marginTop: 2,
    },

    rewardCostText: {
      fontSize: 12,
      fontWeight: '800',
      color: c.gold,
    },

    redeemButton: {
      backgroundColor: c.green,
      borderRadius: 14,
      paddingVertical: 12,
      paddingHorizontal: 20,
    },

    redeemButtonDisabled: {
      backgroundColor: 'rgba(100,100,100,0.5)',
    },

    redeemButtonText: {
      fontSize: 14,
      fontWeight: '800',
      color: '#FFFFFF',
    },

    redeemButtonTextSmall: {
      fontSize: 11,
    },

    // ─── Estados: cargando / vacío / error ────────────────────────────────────
    centerBox: {
      alignItems: 'center',
      paddingVertical: 40,
      gap: 12,
    },

    emptyText: {
      fontSize: 14,
      color: c.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },

    retryButton: {
      backgroundColor: c.green,
      borderRadius: 14,
      paddingVertical: 10,
      paddingHorizontal: 24,
      marginTop: 4,
    },

    retryButtonText: {
      fontSize: 14,
      fontWeight: '800',
      color: '#FFFFFF',
    },

    // ─── Modal ────────────────────────────────────────────────────────────────
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
    },

    modalCard: {
      backgroundColor: c.surface,
      borderRadius: 28,
      padding: 28,
      width: '100%',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.2,
      shadowRadius: 30,
      elevation: 16,
    },

    modalIconWrap: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: c.greenLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 18,
    },

    modalTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: c.textPrimary,
      textAlign: 'center',
      lineHeight: 26,
      marginBottom: 10,
    },

    modalRewardName: {
      fontSize: 17,
      fontWeight: '700',
      color: c.green,
      textAlign: 'center',
      marginBottom: 16,
    },

    modalCostRow: {
      marginBottom: 26,
    },

    modalButtons: {
      flexDirection: 'row',
      gap: 12,
      width: '100%',
    },

    modalButtonNo: {
      flex: 1,
      backgroundColor: c.surfaceAlt,
      borderRadius: 16,
      paddingVertical: 15,
      alignItems: 'center',
    },

    modalButtonNoText: {
      fontSize: 15,
      fontWeight: '800',
      color: c.textSecondary,
    },

    modalButtonYes: {
      flex: 1,
      backgroundColor: c.green,
      borderRadius: 16,
      paddingVertical: 15,
      alignItems: 'center',
    },

    modalButtonYesText: {
      fontSize: 15,
      fontWeight: '800',
      color: '#FFFFFF',
    },
  });
}
