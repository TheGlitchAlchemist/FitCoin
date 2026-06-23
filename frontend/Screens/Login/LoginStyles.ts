import { StyleSheet } from "react-native";


const COLORS = {
  navy: "#0B1324",
  green: "#22C55E",
  greenDark: "#16A34A",
  gold: "#D4AF37",
  background: "#F7F8FA",
  white: "#FFFFFF",
  gray: "#6B7280",
  grayDark: "#374151",
  grayLight: "#E5E7EB",
  inputBg: "#F9FAFB",
  mint: "#E8F9F1",
};

const CARD_SHADOW = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.1,
  shadowRadius: 14,
  elevation: 6,
};

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.navy,
  },

  scrollContent: {
    flexGrow: 1,
    backgroundColor: COLORS.navy,
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 32,
  },

  header: {
    alignItems: "center",
    marginBottom: 28,
  },

  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    overflow: "hidden",
    ...CARD_SHADOW,
  },

  logoImage: {
    width: 86,
    height: 86,
  },

  brandName: {
    color: COLORS.white,
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  tagline: {
    color: "#CBD5E1",
    fontSize: 14,
    marginTop: 6,
    textAlign: "center",
  },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 32,
    paddingHorizontal: 22,
    paddingVertical: 26,
    ...CARD_SHADOW,
  },

  title: {
    color: COLORS.navy,
    fontSize: 30,
    fontWeight: "900",
    marginBottom: 8,
  },

  subtitle: {
    color: COLORS.gray,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 26,
  },

  formGroup: {
    marginBottom: 18,
  },

  label: {
    color: COLORS.grayDark,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 8,
  },

  input: {
    height: 54,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    borderRadius: 18,
    paddingHorizontal: 16,
    color: COLORS.navy,
    fontSize: 15,
    fontWeight: "600",
  },

  passwordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  forgotText: {
    color: COLORS.greenDark,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 8,
  },

  button: {
    height: 56,
    backgroundColor: COLORS.green,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    marginBottom: 12,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "900",
  },

  cancelButton: {
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    backgroundColor: COLORS.white,
    marginBottom: 20,
  },

  cancelButtonText: {
    color: COLORS.grayDark,
    fontSize: 15,
    fontWeight: "900",
  },

  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  registerText: {
    color: COLORS.gray,
    fontSize: 14,
    fontWeight: "600",
  },

  registerLink: {
    color: COLORS.greenDark,
    fontSize: 14,
    fontWeight: "900",
  },

  footerText: {
    color: "#CBD5E1",
    textAlign: "center",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 24,
    paddingHorizontal: 18,
  },
});