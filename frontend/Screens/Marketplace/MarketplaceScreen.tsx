// ─────────────────────────────────────────────────────────────────────────────
// MarketplaceScreen — promociones reales desde Supabase (tabla offers)
//
// Flujo de canje:
//   1. Se listan las ofertas activas con su negocio (offers → businesses).
//   2. "Canjear" solo se habilita con saldo suficiente y stock disponible.
//   3. Al confirmar en el modal se llama a la RPC `redeem_offer`, que valida
//      todo en el servidor (saldo, stock, vigencia), genera el código único
//      FC-XXXXXX, crea el canje como 'issued' y descuenta las FitCoins.
//   4. El frontend nunca decide el saldo: solo muestra lo que responde la RPC.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../lib/theme';
import { makeStyles } from './MarketplaceStyles';

// Imagen predeterminada para todas las cards
const PROMO_IMAGE = require('../assets/img/promo1.png');

type Offer = {
  id: string;
  title: string;
  description: string | null;
  fitcoin_price: number;
  stock_available: number | null;
  businesses: { name: string } | null;
};

type RedeemResult = {
  redemption_code: string;
  new_balance: number;
  offer_title: string;
  business_name: string | null;
  fitcoin_price: number;
  expires_at: string;
};

type Props = {
  totalCoins: number;
  refreshing?: boolean;
  onRefresh?: () => void;
  /** Navega a la pestaña "Mis canjes" (la provee el Dashboard) */
  onGoToRedemptions?: () => void;
};

export default function MarketplaceScreen({
  totalCoins,
  refreshing = false,
  onRefresh,
  onGoToRedemptions,
}: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [offers, setOffers]     = useState<Offer[]>([]);
  const [loading, setLoading]   = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [redeeming, setRedeeming] = useState(false);
  const [successData, setSuccessData] = useState<RedeemResult | null>(null);

  // ── Leer ofertas reales desde Supabase ─────────────────────────────────────
  // Se ocultan las ofertas que ESTE usuario ya canjeó (para los demás siguen
  // visibles; la oferta no se toca en la base).
  const fetchOffers = useCallback(async () => {
    const nowIso = new Date().toISOString();

    const [offersRes, userRes] = await Promise.all([
      supabase
        .from('offers')
        .select('id, title, description, fitcoin_price, stock_available, businesses(name)')
        .eq('active', true)
        .or(`ends_at.is.null,ends_at.gt.${nowIso}`)
        .order('created_at', { ascending: false }),
      supabase.auth.getUser(),
    ]);

    if (offersRes.error) {
      setLoadError(offersRes.error.message);
      setLoading(false);
      return;
    }

    // Ofertas ya canjeadas por este usuario (canje vigente o ya usado)
    let redeemedIds = new Set<string>();
    const userId = userRes.data.user?.id;
    if (userId) {
      const { data: reds } = await supabase
        .from('redemptions')
        .select('offer_id')
        .eq('user_id', userId)
        .in('status', ['issued', 'used']);
      redeemedIds = new Set((reds ?? []).map(r => r.offer_id as string));
    }

    const visible = ((offersRes.data ?? []) as unknown as Offer[])
      .filter(o => !redeemedIds.has(o.id));

    setLoadError(null);
    setOffers(visible);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  // Pull-to-refresh: ofertas + saldo (el saldo lo refresca el Dashboard)
  const handleRefresh = useCallback(() => {
    fetchOffers();
    onRefresh?.();
  }, [fetchOffers, onRefresh]);

  // ── Canjear vía RPC ─────────────────────────────────────────────────────────
  const confirmRedeem = useCallback(async () => {
    if (!selectedOffer || redeeming) return;

    // Revalidación local antes de llamar (el servidor valida de nuevo)
    if (totalCoins < selectedOffer.fitcoin_price) {
      setSelectedOffer(null);
      Alert.alert('Saldo insuficiente', 'No tienes FitCoins suficientes para este canje.');
      return;
    }

    setRedeeming(true);
    try {
      const { data, error } = await supabase.rpc('redeem_offer', {
        p_offer_id: selectedOffer.id,
      });

      if (error) {
        Alert.alert('No se pudo canjear', error.message);
        return;
      }

      const r = data as RedeemResult;
      setSelectedOffer(null);
      setSuccessData(r); // abre el modal de éxito estilo FitCoin

      // Refrescar stock de ofertas y saldo del usuario
      fetchOffers();
      onRefresh?.();
    } catch (e) {
      Alert.alert('Error de red', 'No se pudo completar el canje. Revisa tu conexión e intenta de nuevo.');
    } finally {
      setRedeeming(false);
    }
  }, [selectedOffer, redeeming, totalCoins, fetchOffers, onRefresh]);

  // Cerrar el modal de éxito → mandar automáticamente a "Mis canjes"
  const closeSuccess = useCallback(() => {
    setSuccessData(null);
    onGoToRedemptions?.();
  }, [onGoToRedemptions]);

  // ── Card de oferta ──────────────────────────────────────────────────────────
  const renderOfferCard = (offer: Offer) => {
    const insufficient = totalCoins < offer.fitcoin_price;
    const outOfStock   = offer.stock_available !== null && offer.stock_available <= 0;
    const disabled     = insufficient || outOfStock;

    return (
      <ImageBackground
        key={offer.id}
        source={PROMO_IMAGE}
        style={styles.rewardCard}
        imageStyle={styles.rewardCardImage}
      >
        <View style={styles.rewardOverlay}>
          <View style={styles.rewardOverlayLeft}>
            <View style={styles.businessTag}>
              <Ionicons name="storefront" size={10} color="#FFFFFF" />
              <Text style={styles.businessTagText}>
                {offer.businesses?.name ?? 'Negocio'}
              </Text>
            </View>
            <Text style={styles.rewardCardName}>{offer.title}</Text>
            {!!offer.description && (
              <Text style={styles.rewardDescription} numberOfLines={2}>
                {offer.description}
              </Text>
            )}
            <View style={styles.rewardCostBadge}>
              <Text style={styles.rewardCostText}>{offer.fitcoin_price} FC</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.redeemButton, disabled && styles.redeemButtonDisabled]}
            disabled={disabled}
            onPress={() => setSelectedOffer(offer)}
            activeOpacity={0.85}
          >
            <Text style={[styles.redeemButtonText, disabled && styles.redeemButtonTextSmall]}>
              {outOfStock ? 'Agotado' : insufficient ? 'Saldo insuficiente' : 'Canjear'}
            </Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
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
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.pageTitle}>Marketplace</Text>
          <Ionicons name="storefront-outline" size={26} color={colors.textPrimary} />
        </View>

        {/* Balance */}
        <View style={styles.balanceBanner}>
          <View style={styles.balanceCoinCircle}>
            <Text style={styles.balanceCoinLabel}>FC</Text>
          </View>
          <View>
            <Text style={styles.balanceLabel}>Tu saldo disponible</Text>
            <Text style={styles.balanceAmount}>{totalCoins.toLocaleString()} FC</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Recompensas disponibles</Text>

        {loading && (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.green} />
          </View>
        )}

        {!loading && loadError && (
          <View style={styles.centerBox}>
            <Ionicons name="cloud-offline-outline" size={44} color={colors.border} />
            <Text style={styles.emptyText}>No se pudieron cargar las ofertas.{'\n'}{loadError}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchOffers} activeOpacity={0.85}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !loadError && offers.length === 0 && (
          <View style={styles.centerBox}>
            <Ionicons name="pricetags-outline" size={44} color={colors.border} />
            <Text style={styles.emptyText}>
              Por ahora no hay promociones disponibles.{'\n'}Vuelve pronto.
            </Text>
          </View>
        )}

        {!loading && !loadError && offers.map(renderOfferCard)}
      </ScrollView>

      {/* Modal de confirmación */}
      <Modal
        visible={selectedOffer !== null}
        transparent
        animationType="fade"
        onRequestClose={() => !redeeming && setSelectedOffer(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconWrap}>
              <Ionicons name="gift-outline" size={36} color={colors.green} />
            </View>
            <Text style={styles.modalTitle}>
              ¿Seguro que quieres canjear esta promoción?
            </Text>
            <Text style={styles.modalRewardName}>{selectedOffer?.title}</Text>
            <View style={styles.modalCostRow}>
              <View style={styles.rewardCostBadge}>
                <Text style={styles.rewardCostText}>{selectedOffer?.fitcoin_price} FC</Text>
              </View>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonNo}
                onPress={() => setSelectedOffer(null)}
                disabled={redeeming}
                activeOpacity={0.85}
              >
                <Text style={styles.modalButtonNoText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButtonYes, redeeming && styles.redeemButtonDisabled]}
                onPress={confirmRedeem}
                disabled={redeeming}
                activeOpacity={0.85}
              >
                {redeeming ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalButtonYesText}>Sí, canjear</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de éxito — estilo liquid glass FitCoin */}
      <Modal
        visible={successData !== null}
        transparent
        animationType="fade"
        onRequestClose={closeSuccess}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successIconWrap}>
              <Ionicons name="checkmark-circle" size={54} color={colors.green} />
            </View>

            <Text style={styles.successTitle}>¡Canje realizado!</Text>

            <Text style={styles.successOfferName}>{successData?.offer_title}</Text>
            {!!successData?.business_name && (
              <Text style={styles.successBusiness}>{successData.business_name}</Text>
            )}

            <View style={styles.successCodeBox}>
              <Text style={styles.successCodeLabel}>Tu código de canje</Text>
              <Text style={styles.successCodeValue}>{successData?.redemption_code}</Text>
              <Text style={styles.successCodeHint}>Muéstralo en el negocio para usarlo</Text>
            </View>

            <View style={styles.successBalanceRow}>
              <View style={styles.balanceCoinCircleSmall}>
                <Text style={styles.balanceCoinLabelSmall}>FC</Text>
              </View>
              <Text style={styles.successBalanceText}>
                Nuevo saldo: {successData?.new_balance} FC
              </Text>
            </View>

            <TouchableOpacity
              style={styles.successButton}
              onPress={closeSuccess}
              activeOpacity={0.85}
            >
              <Text style={styles.successButtonText}>Entendido</Text>
            </TouchableOpacity>

            <Text style={styles.successFootnote}>
              Lo encontrarás en “Mis canjes”
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}
