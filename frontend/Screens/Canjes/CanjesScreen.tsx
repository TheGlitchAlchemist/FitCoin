import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { makeStyles } from './CanjesStyles';
import { useTheme } from '../../lib/theme';
import { Canje, useCanjes } from './useCanjes';

const STATUS_LABELS: Record<string, string> = {
  used:      'Usado',
  expired:   'Expirado',
  cancelled: 'Cancelado',
};

function ActiveCard({ item, styles }: { item: Canje; styles: ReturnType<typeof makeStyles> }) {
  return (
    <View style={styles.activeCard}>
      <View style={styles.activeCardTop}>
        <View style={[styles.activeEmojiBox, { backgroundColor: item.color + '22' }]}>
          <Ionicons name="gift-outline" size={26} color={item.color} />
        </View>

        <View style={styles.activeInfo}>
          <Text style={styles.activeName}>{item.nombre}</Text>
          <Text style={styles.activeBusiness}>{item.negocio}</Text>
          {!!item.descripcion && (
            <Text style={styles.activeDescription}>{item.descripcion}</Text>
          )}
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

function PastCard({ item, styles }: { item: Canje; styles: ReturnType<typeof makeStyles> }) {
  return (
    <View style={styles.pastCard}>
      <View style={[styles.pastEmojiBox, { backgroundColor: item.color + '18' }]}>
        <Ionicons name="gift-outline" size={24} color={item.color} style={{ opacity: 0.6 }} />
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
          <Text style={styles.usedBadgeText}>
            {STATUS_LABELS[item.status] ?? 'Usado'}
          </Text>
        </View>
      </View>
    </View>
  );
}

type CanjesScreenProps = {
  refreshing?: boolean;
  onRefresh?: () => void;
};

export default function CanjesScreen({ refreshing = false, onRefresh }: CanjesScreenProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { activeTab, setActiveTab, activos, pasados, loading, error, refetch } = useCanjes();

  // Pull-to-refresh: recarga los canjes y el saldo (vía Dashboard)
  const handleRefresh = useCallback(() => {
    refetch();
    onRefresh?.();
  }, [refetch, onRefresh]);

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.green]}
            tintColor={colors.green}
            progressBackgroundColor={colors.surface}
          />
        }
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

        {loading && (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color={colors.green} />
          </View>
        )}

        {!loading && error && (
          <View style={styles.emptyContainer}>
            <Ionicons name="cloud-offline-outline" size={52} color={colors.border} style={{ marginBottom: 16 }} />
            <Text style={styles.emptyTitle}>No se pudieron cargar tus canjes</Text>
            <Text style={styles.emptyText}>{error}</Text>
          </View>
        )}

        {!loading && !error && activeTab === 'activos' && (
          <>
            {activos.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="ticket-outline" size={52} color={colors.border} style={{ marginBottom: 16 }} />
                <Text style={styles.emptyTitle}>Sin canjes activos</Text>
                <Text style={styles.emptyText}>
                  Aún no tienes canjes activos. Ve al Marketplace y canjea tus FitCoins.
                </Text>
              </View>
            ) : (
              activos.map((item) => <ActiveCard key={item.id} item={item} styles={styles} />)
            )}
          </>
        )}

        {!loading && !error && activeTab === 'pasados' && (
          <>
            {pasados.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="document-outline" size={52} color={colors.border} style={{ marginBottom: 16 }} />
                <Text style={styles.emptyTitle}>Sin historial</Text>
                <Text style={styles.emptyText}>
                  Aquí aparecerán los canjes que ya hayas utilizado.
                </Text>
              </View>
            ) : (
              pasados.map((item) => <PastCard key={item.id} item={item} styles={styles} />)
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
