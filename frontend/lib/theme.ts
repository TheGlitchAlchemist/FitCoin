import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Appearance } from 'react-native';

const THEME_KEY = '@fitcoin_theme';

// ─── Paleta modo claro ────────────────────────────────────────────────────────
export const lightColors = {
  // Fondos
  bg:           '#F7F8FA',
  surface:      '#FFFFFF',
  surfaceAlt:   '#F3F4F6',

  // Texto
  textPrimary:   '#0B1324',
  textSecondary: '#6B7280',
  textMuted:     '#9CA3AF',

  // Bordes
  border: '#E5E7EB',

  // Marca
  navy:        '#0B1324',
  green:       '#22C55E',
  greenDark:   '#16A34A',
  greenLight:  '#F0FDF4',
  greenBorder: '#86EFAC',
  gold:        '#D4AF37',
  goldLight:   '#FFFBEB',
  goldBorder:  '#FDE68A',

  // Componentes
  bottomNav:  '#FFFFFF',
  inputBg:    '#F9FAFB',
  balanceBg:  '#0B1324',
  balanceCardText: '#9CA3AF',

  // Sombras
  shadowOpacity: 0.07 as number,
  elevation:     4     as number,
};

// ─── Paleta modo oscuro ───────────────────────────────────────────────────────
export const darkColors: typeof lightColors = {
  bg:           '#0B1324',
  surface:      '#1E2D45',
  surfaceAlt:   '#162236',

  textPrimary:   '#F9FAFB',
  textSecondary: '#9CA3AF',
  textMuted:     '#6B7280',

  border: '#2D3F58',

  navy:        '#0B1324',
  green:       '#22C55E',
  greenDark:   '#22C55E',
  greenLight:  '#052E16',
  greenBorder: '#166534',
  gold:        '#D4AF37',
  goldLight:   '#1C1500',
  goldBorder:  '#92400E',

  bottomNav:  '#111C2E',
  inputBg:    '#162236',
  balanceBg:  '#111C2E',
  balanceCardText: '#6B7280',

  shadowOpacity: 0.28,
  elevation:     8,
};

export type ThemeColors = typeof lightColors;

// ─── Context ──────────────────────────────────────────────────────────────────
type ThemeCtx = {
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeCtx>({
  isDark:      false,
  colors:      lightColors,
  toggleTheme: () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemDark = Appearance.getColorScheme() === 'dark';
  const [isDark, setIsDark] = useState(systemDark);

  // Si el usuario guardó preferencia explícita, úsala; si no, sigue el sistema
  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then(val => {
      if (val === 'dark') setIsDark(true);
      else if (val === 'light') setIsDark(false);
      // val === null → usar valor del sistema (ya inicializado)
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      AsyncStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
      return next;
    });
  }, []);

  const colors = useMemo(() => (isDark ? darkColors : lightColors), [isDark]);

  return React.createElement(
    ThemeContext.Provider,
    { value: { isDark, colors, toggleTheme } },
    children
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useTheme() {
  return useContext(ThemeContext);
}
