import { useState } from 'react';

export type DashboardTab = 'home' | 'marketplace' | 'redemptions' | 'profile';

export const useDashboard = () => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('home');

  const goToHome = () => {
    setActiveTab('home');
  };

  const goToMarketplace = () => {
    setActiveTab('marketplace');
  };

  const goToRedemptions = () => {
    setActiveTab('redemptions');
  };

  const goToProfile = () => {
    setActiveTab('profile');
  };

  return {
    activeTab,
    setActiveTab,
    goToHome,
    goToMarketplace,
    goToRedemptions,
    goToProfile,
  };
};