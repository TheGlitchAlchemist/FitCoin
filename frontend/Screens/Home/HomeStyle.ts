import { StyleSheet } from "react-native";


const COLORS = {
  navy: "#0B1324",
  green: "#22C55E",
  greenDark: "#16A34A",
  gold: "#D4AF37",
  background: "#F7F8FA",
  white: "#FFFFFF",
  gray: "#6B7280",
  grayLight: "#E5E7EB",
  mint: "#E8F9F1",
};

const CARD_SHADOW = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.1,
  shadowRadius: 14,
  elevation: 5,
};

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scroll: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  hero: {
    backgroundColor: COLORS.navy,
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 36,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 34,
  },

  logoGroup: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  logoContainer: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    overflow: "hidden",
  },

  logoImage: {
    width: 46,
    height: 46,
  },

  brandName: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "900",
  },

  brandSubtitle: {
    color: "#CBD5E1",
    fontSize: 12,
    marginTop: 2,
  },

  authButtons: {
    flexDirection: "row",
    alignItems: "center",
  },

  loginButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    marginRight: 8,
  },

  loginButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "800",
  },

  registerButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.green,
  },

  registerButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "800",
  },

  heroContent: {
    marginTop: 4,
  },

  heroTitle: {
    color: COLORS.white,
    fontSize: 42,
    fontWeight: "900",
    lineHeight: 48,
  },

  heroSubtitle: {
    color: "#CBD5E1",
    fontSize: 16,
    lineHeight: 24,
    marginTop: 16,
  },

  heroActions: {
    flexDirection: "row",
    marginTop: 28,
  },

  primaryButton: {
    backgroundColor: COLORS.green,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 18,
    marginRight: 12,
  },

  primaryButtonText: {
    color: COLORS.white,
    fontWeight: "900",
    fontSize: 14,
  },

  secondaryButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },

  secondaryButtonText: {
    color: COLORS.white,
    fontWeight: "800",
    fontSize: 14,
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  balanceCard: {
    backgroundColor: COLORS.white,
    borderRadius: 28,
    padding: 22,
    marginTop: -24,
    marginBottom: 30,
    ...CARD_SHADOW,
  },

  balanceTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardLabel: {
    color: COLORS.gray,
    fontSize: 13,
    fontWeight: "800",
  },

  balanceText: {
    color: COLORS.navy,
    fontSize: 40,
    fontWeight: "900",
    marginTop: 6,
  },

  coinCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: COLORS.mint,
    justifyContent: "center",
    alignItems: "center",
  },

  coinEmoji: {
    fontSize: 30,
  },

  progressBar: {
    height: 12,
    backgroundColor: COLORS.mint,
    borderRadius: 999,
    marginTop: 22,
    overflow: "hidden",
  },

  progressFill: {
    width: "72%",
    height: "100%",
    backgroundColor: COLORS.green,
    borderRadius: 999,
  },

  progressText: {
    color: COLORS.gray,
    fontSize: 12,
    marginTop: 10,
  },

  sectionHeader: {
    marginBottom: 16,
  },

  sectionTitle: {
    color: COLORS.navy,
    fontSize: 23,
    fontWeight: "900",
  },

  statsRow: {
    flexDirection: "row",
    marginBottom: 14,
  },

  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 18,
    marginRight: 10,
    ...CARD_SHADOW,
  },

  statIcon: {
    fontSize: 30,
    marginBottom: 10,
  },

  statTitle: {
    color: COLORS.navy,
    fontSize: 17,
    fontWeight: "900",
  },

  statDescription: {
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },

  statReward: {
    color: COLORS.green,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 8,
  },

  activeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...CARD_SHADOW,
  },

  activeInfo: {
    flex: 1,
    paddingRight: 16,
  },

  activeTitle: {
    color: COLORS.navy,
    fontSize: 19,
    fontWeight: "900",
  },

  activeSubtitle: {
    color: COLORS.gray,
    marginTop: 4,
    lineHeight: 20,
  },

  activeRewardBadge: {
    backgroundColor: COLORS.mint,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },

  activeRewardText: {
    color: COLORS.greenDark,
    fontSize: 16,
    fontWeight: "900",
  },

  marketplaceCard: {
    backgroundColor: COLORS.navy,
    borderRadius: 28,
    padding: 22,
    marginBottom: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...CARD_SHADOW,
  },

  marketplaceLabel: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 5,
  },

  marketplaceTitle: {
    color: COLORS.white,
    fontSize: 21,
    fontWeight: "900",
    maxWidth: 210,
  },

  marketplaceSubtitle: {
    color: "#CBD5E1",
    marginTop: 6,
    lineHeight: 20,
    maxWidth: 210,
  },

  marketplaceButton: {
    backgroundColor: COLORS.green,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 999,
  },

  marketplaceButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "900",
  },

  stepsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 28,
    padding: 20,
    ...CARD_SHADOW,
  },

  step: {
    flexDirection: "row",
    marginBottom: 22,
  },

  stepLast: {
    flexDirection: "row",
  },

  stepIconBox: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: COLORS.mint,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  stepIcon: {
    fontSize: 24,
  },

  stepContent: {
    flex: 1,
  },

  stepTitle: {
    color: COLORS.navy,
    fontSize: 16,
    fontWeight: "900",
  },

  stepText: {
    color: COLORS.gray,
    marginTop: 4,
    lineHeight: 20,
  },
});