import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

type Props = {
  pct: number;           // 0-100
  steps: number;
  coins: number;
  size?: number;
  strokeWidth?: number;
  color: string;         // arco de progreso
  trackColor: string;    // pista gris de fondo
  textPrimary: string;
  textSecondary: string;
  gold: string;
};

export default function ProgressRing({
  pct,
  steps,
  coins,
  size = 220,
  strokeWidth = 18,
  color,
  trackColor,
  textPrimary,
  textSecondary,
  gold,
}: Props) {
  const radius       = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPct   = Math.min(100, Math.max(0, pct));
  const strokeOffset = circumference - (clampedPct / 100) * circumference;
  const center       = size / 2;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* SVG arc */}
      <Svg
        width={size}
        height={size}
        style={StyleSheet.absoluteFillObject}
      >
        <G rotation="-90" origin={`${center}, ${center}`}>
          {/* Pista de fondo */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Arco de progreso */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeOffset}
            strokeLinecap="round"
          />
        </G>
      </Svg>

      {/* Contenido central */}
      <View style={styles.inner}>
        <Text style={[styles.pct, { color: textSecondary }]}>
          {clampedPct}%
        </Text>
        <Text style={[styles.steps, { color: textPrimary }]}>
          {steps.toLocaleString()} pasos
        </Text>
        <Text style={[styles.coins, { color: textPrimary }]}>
          {coins}
        </Text>
        <View style={styles.coinLabel}>
          <View style={[styles.coinDot, { backgroundColor: gold }]} />
          <Text style={[styles.coinText, { color: textSecondary }]}>FitCoins</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inner: {
    alignItems: 'center',
  },
  pct: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  steps: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  coins: {
    fontSize: 42,
    fontWeight: '900',
    lineHeight: 46,
  },
  coinLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  coinDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  coinText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
