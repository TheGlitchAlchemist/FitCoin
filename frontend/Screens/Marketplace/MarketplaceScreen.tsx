import React, { useMemo, useState } from 'react';
import {
  Alert,
  ImageBackground,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme';
import { makeStyles } from './MarketplaceStyles';

type Reward = {
  id: string;
  name: string;
  business: string;
  cost: number;
  imageUrl: string;
};

const REWARDS: Reward[] = [
  {
    id: '1',
    name: 'Café Fit',
    business: 'Local FitCafé',
    cost: 500,
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=700&q=80',
  },
  {
    id: '2',
    name: 'Pase de gimnasio',
    business: 'The Gym',
    cost: 750,
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=700&q=80',
  },
  {
    id: '3',
    name: 'Bowl saludable',
    business: 'Green Eats',
    cost: 1000,
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=700&q=80',
  },
  {
    id: '4',
    name: 'Descuento deportivo',
    business: 'SportZone',
    cost: 650,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&q=80',
  },
];

type Props = {
  totalCoins: number;
};

export default function MarketplaceScreen({ totalCoins }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
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

        {REWARDS.map((reward) => (
          <ImageBackground
            key={reward.id}
            source={{ uri: reward.imageUrl }}
            style={styles.rewardCard}
            imageStyle={styles.rewardCardImage}
          >
            <View style={styles.rewardOverlay}>
              <View style={styles.rewardOverlayLeft}>
                <Text style={styles.rewardCardBusiness}>{reward.business}</Text>
                <Text style={styles.rewardCardName}>{reward.name}</Text>
                <View style={styles.rewardCostBadge}>
                  <Text style={styles.rewardCostText}>{reward.cost} FC</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.redeemButton,
                  totalCoins < reward.cost && styles.redeemButtonDisabled,
                ]}
                onPress={() => {
                  if (totalCoins < reward.cost) {
                    Alert.alert(
                      'Saldo insuficiente',
                      `Necesitas ${reward.cost} FC. Tienes ${totalCoins} FC.\nTe faltan ${reward.cost - totalCoins} FC — ¡sigue caminando!`
                    );
                    return;
                  }
                  setSelectedReward(reward);
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.redeemButtonText}>Canjear</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        ))}
      </ScrollView>

      {/* Modal confirmación */}
      <Modal
        visible={selectedReward !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedReward(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconWrap}>
              <Ionicons name="gift-outline" size={36} color={colors.green} />
            </View>
            <Text style={styles.modalTitle}>
              ¿Seguro que quieres canjear esta recompensa?
            </Text>
            <Text style={styles.modalRewardName}>{selectedReward?.name}</Text>
            <View style={styles.modalCostRow}>
              <View style={styles.rewardCostBadge}>
                <Text style={styles.rewardCostText}>{selectedReward?.cost} FC</Text>
              </View>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonNo}
                onPress={() => setSelectedReward(null)}
                activeOpacity={0.85}
              >
                <Text style={styles.modalButtonNoText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonYes}
                onPress={() => {
                  const name = selectedReward?.name;
                  setSelectedReward(null);
                  Alert.alert('¡Canje realizado!', `Has canjeado: ${name}`);
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.modalButtonYesText}>Sí, canjear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
