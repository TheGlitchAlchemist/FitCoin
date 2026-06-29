import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../lib/theme';

export function makeStyles(c: ThemeColors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: c.bg,
    },

    scroll: { flex: 1 },

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
      marginBottom: 24,
    },

    pageTitle: {
      fontSize: 28,
      fontWeight: '800',
      color: c.textPrimary,
    },

    // ─── Toggle ───────────────────────────────────────────────────────────────
    toggleContainer: {
      flexDirection: 'row',
      backgroundColor: c.surfaceAlt,
      borderRadius: 18,
      padding: 4,
      marginBottom: 24,
    },

    toggleButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 14,
      alignItems: 'center',
    },

    toggleButtonActive: {
      backgroundColor: c.navy,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: c.shadowOpacity,
      shadowRadius: 8,
      elevation: c.elevation,
    },

    toggleText: {
      fontSize: 14,
      fontWeight: '700',
      color: c.textMuted,
    },

    toggleTextActive: {
      color: '#FFFFFF',
    },

    // ─── Empty ────────────────────────────────────────────────────────────────
    emptyContainer: {
      alignItems: 'center',
      paddingTop: 48,
    },

    emptyTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: c.textPrimary,
      marginBottom: 8,
    },

    emptyText: {
      fontSize: 14,
      color: c.textMuted,
      textAlign: 'center',
      lineHeight: 20,
    },

    // ─── Active card ──────────────────────────────────────────────────────────
    activeCard: {
      backgroundColor: c.surface,
      borderRadius: 24,
      marginBottom: 16,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: c.shadowOpacity,
      shadowRadius: 12,
      elevation: c.elevation,
    },

    activeCardTop: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      gap: 14,
    },

    activeEmojiBox: {
      width: 60,
      height: 60,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
    },

    activeInfo: { flex: 1 },

    activeName: {
      fontSize: 16,
      fontWeight: '800',
      color: c.textPrimary,
      marginBottom: 2,
    },

    activeBusiness: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textSecondary,
      marginBottom: 4,
    },

    activeDescription: {
      fontSize: 12,
      color: c.textMuted,
      lineHeight: 17,
    },

    // ─── Code block ───────────────────────────────────────────────────────────
    codeBlock: {
      backgroundColor: c.navy,
      marginHorizontal: 16,
      marginBottom: 16,
      borderRadius: 18,
      paddingVertical: 18,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    codeLeft: { flex: 1 },

    codeLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: c.textMuted,
      marginBottom: 6,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },

    codeValue: {
      fontSize: 22,
      fontWeight: '900',
      color: '#FFFFFF',
      letterSpacing: 2,
    },

    codeExpiry: {
      fontSize: 12,
      color: c.textMuted,
      marginTop: 6,
    },

    codeIcon: {
      width: 52,
      height: 52,
      borderRadius: 14,
      backgroundColor: 'rgba(255,255,255,0.08)',
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 12,
    },

    // ─── Active card footer ───────────────────────────────────────────────────
    activeCardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingBottom: 16,
    },

    activeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.greenLight,
      borderRadius: 10,
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: c.greenBorder,
      alignSelf: 'flex-start',
    },

    activeBadgeText: {
      fontSize: 11,
      fontWeight: '800',
      color: c.greenDark,
    },

    activeCostBadge: {
      backgroundColor: c.goldLight,
      borderRadius: 10,
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: c.goldBorder,
    },

    activeCostText: {
      fontSize: 12,
      fontWeight: '800',
      color: c.gold,
    },

    // ─── Past card ────────────────────────────────────────────────────────────
    pastCard: {
      backgroundColor: c.surface,
      borderRadius: 24,
      marginBottom: 14,
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      gap: 14,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: c.shadowOpacity,
      shadowRadius: 12,
      elevation: c.elevation,
    },

    pastEmojiBox: {
      width: 56,
      height: 56,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },

    pastInfo: { flex: 1 },

    pastName: {
      fontSize: 15,
      fontWeight: '800',
      color: c.textSecondary,
      marginBottom: 2,
    },

    pastBusiness: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textMuted,
      marginBottom: 6,
    },

    pastDateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },

    pastDate: {
      fontSize: 12,
      color: c.textSecondary,
      fontWeight: '600',
    },

    pastRight: {
      alignItems: 'flex-end',
      gap: 8,
    },

    pastCostBadge: {
      backgroundColor: c.surfaceAlt,
      borderRadius: 10,
      paddingVertical: 4,
      paddingHorizontal: 10,
    },

    pastCostText: {
      fontSize: 12,
      fontWeight: '800',
      color: c.textPrimary,
    },

    usedBadge: {
      backgroundColor: c.surfaceAlt,
      borderRadius: 10,
      paddingVertical: 4,
      paddingHorizontal: 10,
    },

    usedBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: c.textMuted,
    },
  });
}
