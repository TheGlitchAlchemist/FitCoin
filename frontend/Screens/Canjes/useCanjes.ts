import { useState } from 'react';

export type CanjesTab = 'activos' | 'pasados';

export type CanjeActivo = {
  id: string;
  nombre: string;
  negocio: string;
  descripcion: string;
  emoji: string;
  color: string;
  codigo: string;
  expira: string;
  costo: number;
};

export type CanjePassado = {
  id: string;
  nombre: string;
  negocio: string;
  emoji: string;
  color: string;
  fechaCanje: string;
  costo: number;
};

export const CANJES_ACTIVOS: CanjeActivo[] = [
  {
    id: 'a1',
    nombre: 'Café Fit',
    negocio: 'Local FitCafé',
    descripcion: 'Bebida saludable para después de entrenar.',
    emoji: '☕',
    color: '#FF8C69',
    codigo: 'FC-2024-A1B2',
    expira: '30 Jun 2025',
    costo: 500,
  },
  {
    id: 'a2',
    nombre: 'Bowl saludable',
    negocio: 'Green Eats',
    descripcion: 'Bowl nutritivo con proteína y vegetales.',
    emoji: '🥗',
    color: '#38B2AC',
    codigo: 'FC-2024-C3D4',
    expira: '15 Jul 2025',
    costo: 1000,
  },
];

export const CANJES_PASADOS: CanjePassado[] = [
  {
    id: 'p1',
    nombre: 'Pase de gimnasio',
    negocio: 'The Gym',
    emoji: '🏋️',
    color: '#7C72E5',
    fechaCanje: '12 May 2025',
    costo: 750,
  },
  {
    id: 'p2',
    nombre: 'Descuento deportivo',
    negocio: 'SportZone',
    emoji: '👟',
    color: '#F6AD55',
    fechaCanje: '3 Abr 2025',
    costo: 650,
  },
  {
    id: 'p3',
    nombre: 'Café Fit',
    negocio: 'Local FitCafé',
    emoji: '☕',
    color: '#FF8C69',
    fechaCanje: '20 Mar 2025',
    costo: 500,
  },
];

export function useCanjes() {
  const [activeTab, setActiveTab] = useState<CanjesTab>('activos');
  return { activeTab, setActiveTab };
}
