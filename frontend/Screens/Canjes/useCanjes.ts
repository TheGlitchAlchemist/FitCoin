// ─────────────────────────────────────────────────────────────────────────────
// useCanjes — canjes reales del usuario desde Supabase (tabla redemptions)
//
// Estados del enum redemption_status:
//   issued    → canje ACTIVO (la app lo muestra como "Activo")
//   used      → validado por el negocio desde el dashboard web → historial
//   expired   → venció sin usarse → historial
//   cancelled → cancelado → historial
//
// Un canje 'issued' cuya fecha expires_at ya pasó se muestra en el
// historial como "Expirado" aunque la web aún no cambie su estado.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export type CanjesTab = 'activos' | 'pasados';

export type RedemptionStatus = 'issued' | 'used' | 'expired' | 'cancelled';

export type Canje = {
  id: string;
  nombre: string;       // título de la oferta
  negocio: string;      // nombre del negocio
  descripcion: string;
  color: string;        // color decorativo de la card
  codigo: string;       // FC-XXXXXX
  costo: number;        // fitcoin_price_at_purchase
  status: RedemptionStatus;
  fechaCanje: string;   // created_at legible
  expira: string;       // expires_at legible
  isActive: boolean;
};

const CARD_COLORS = ['#22C55E', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#38B2AC'];

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-MX', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export function useCanjes() {
  const [activeTab, setActiveTab] = useState<CanjesTab>('activos');
  const [canjes, setCanjes]   = useState<Canje[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetchCanjes = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('redemptions')
      .select(
        'id, redemption_code, status, fitcoin_price_at_purchase, created_at, expires_at, ' +
        'offers(title, description), businesses(name)'
      )
      .order('created_at', { ascending: false });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    const now = Date.now();
    const mapped: Canje[] = (data ?? []).map((r: any, idx: number) => {
      const expired  = r.expires_at ? new Date(r.expires_at).getTime() < now : false;
      const isActive = r.status === 'issued' && !expired;
      // issued pero vencido → mostrarlo como expirado en el historial
      const status: RedemptionStatus =
        r.status === 'issued' && expired ? 'expired' : r.status;

      return {
        id:          r.id,
        nombre:      r.offers?.title ?? 'Promoción',
        negocio:     r.businesses?.name ?? 'Negocio',
        descripcion: r.offers?.description ?? '',
        color:       CARD_COLORS[idx % CARD_COLORS.length],
        codigo:      r.redemption_code,
        costo:       r.fitcoin_price_at_purchase ?? 0,
        status,
        fechaCanje:  formatDate(r.created_at),
        expira:      formatDate(r.expires_at),
        isActive,
      };
    });

    setError(null);
    setCanjes(mapped);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCanjes();
  }, [fetchCanjes]);

  const activos = canjes.filter(c => c.isActive);
  const pasados = canjes.filter(c => !c.isActive);

  return { activeTab, setActiveTab, activos, pasados, loading, error, refetch: fetchCanjes };
}
