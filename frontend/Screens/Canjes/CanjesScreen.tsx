import React, { useMemo } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { makeStyles } from './CanjesStyles';
import { useTheme } from '../../lib/theme';
import {
  CANJES_ACTIVOS,
  CANJES_PASADOS,
  CanjeActivo,
  CanjePassado,
  useCanjes,
} from './useCanjes';

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  'a1': 'cafe-outline',
  'a2': 'restaurant-outline',
  'p1': 'barbell-outline',
  'p2': 'shirt-outline',
  'p3': 'cafe-outline',
};

function ActiveCard({ item, styles }: { item: CanjeActivo; styles: ReturnType<typeof makeStyles> }) {
  const icon = CATEGORY_ICONS[item.id] ?? 'gift-outline';

  return (
    <View style={styles.activeCard}>
      <View style={styles.activeCardTop}>
        <View style={[styles.activeEmojiBox, { backgroundColor: item.color + '22' }]}>
          <Ionicons name={icon} size={26} color={item.color} />
        </View>

        <View style={styles.activeInfo}>
          <Text style={styles.activeName}>{item.nombre}</Text>
          <Text style={styles.activeBusiness}>{item.negocio}</Text>
          <Text style={styles.activeDescription}>{item.descripcion}</Text>
        </View>
      </View>

      <View style={styles.codeBlock}>
        <View style={styles.codeLeft}>
          <Text style={styles.codeLabel}>Código de canje</Text>
          <Text style={styles.codeValue}>{item.codigo}</Text>
          <Text style={styles.codeExpiry}>Expira: {item.expira}</Text>
        </View>

        <View style={styles.codeIcon}>
          <Ionicons name="qr-code-outline" size={26} color="rgba(255,255,255,0.85)" />
        </View>
      </View>

      <View style={styles.activeCardFooter}>
        <View style={styles.activeBadge}>
          <Ionicons name="checkmark-circle" size={13} color="#16A34A" style={{ marginRight: 4 }} />
          <Text style={styles.activeBadgeText}>Activo</Text>
        </View>

        <View style={styles.activeCostBadge}>
          <Text style={styles.activeCostText}>{item.costo} FC</Text>
        </View>
      </View>
    </View>
  );
}

function PastCard({ item, styles }: { item: CanjePassado; styles: ReturnType<typeof makeStyles> }) {
  const icon = CATEGORY_ICONS[item.id] ?? 'gift-outline';

  return (
    <View style={styles.pastCard}>
      <View style={[styles.pastEmojiBox, { backgroundColor: item.color + '18' }]}>
        <Ionicons name={icon} size={24} color={item.color} style={{ opacity: 0.6 }} />
      </View>

      <View style={styles.pastInfo}>
        <Text style={styles.pastName}>{item.nombre}</Text>
        <Text style={styles.pastBusiness}>{item.negocio}</Text>

        <View style={styles.pastDateRow}>
          <Ionicons name="calendar-outline" size={12} color="#6B7280" />
          <Text style={styles.pastDate}>Canjeado el {item.fechaCanje}</Text>
        </View>
      </View>

      <View style={styles.pastRight}>
        <View style={styles.pastCostBadge}>
          <Text style={styles.pastCostText}>{item.costo} FC</Text>
        </View>
        <View style={styles.usedBadge}>
          <Text style={styles.usedBadgeText}>Usado</Text>
        </View>
      </View>
    </View>
  );
}

export default function CanjesScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { activeTab, setActiveTab } = useCanjes();

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={styles.pageTitle}>Mis canjes</Text>
          <Ionicons name="ticket-outline" size={26} color={colors.textPrimary} />
        </View>

        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, activeTab === 'activos' && styles.toggleButtonActive]}
            onPress={() => setActiveTab('activos')}
            activeOpacity={0.85}
          >
            <Text style={[styles.toggleText, activeTab === 'activos' && styles.toggleTextActive]}>
              Canjes activos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleButton, activeTab === 'pasados' && styles.toggleButtonActive]}
            onPress={() => setActiveTab('pasados')}
            activeOpacity={0.85}
          >
            <Text style={[styles.toggleText, activeTab === 'pasados' && styles.toggleTextActive]}>
              Canjes pasados
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'activos' && (
          <>
            {CANJES_ACTIVOS.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="ticket-outline" size={52} color={colors.border} style={{ marginBottom: 16 }} />
                <Text style={styles.emptyTitle}>Sin canjes activos</Text>
                <Text style={styles.emptyText}>
                  Aún no tienes canjes activos. Ve al Marketplace y canjea tus FitCoins.
                </Text>
              </View>
            ) : (
              CANJES_ACTIVOS.map((item) => <ActiveCard key={item.id} item={item} styles={styles} />)
            )}
          </>
        )}

        {activeTab === 'pasados' && (
          <>
            {CANJES_PASADOS.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="document-outline" size={52} color={colors.border} style={{ marginBottom: 16 }} />
                <Text style={styles.emptyTitle}>Sin historial</Text>
                <Text style={styles.emptyText}>
                  Aquí aparecerán los canjes que ya hayas utilizado.
                </Text>
              </View>
            ) : (
              CANJES_PASADOS.map((item) => <PastCard key={item.id} item={item} styles={styles} />)
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
