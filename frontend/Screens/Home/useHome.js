import { useState } from 'react';

export default function useHome(route, onLogout) {
  const userName = route?.params?.name || "User";
  const [fitcoinsAccumulated, setFitcoinsAccumulated] = useState(1250);

  const handleLogout = () => {
    if (onLogout) {
      onLogout(); 
    }
  };

  return {
    userName,
    fitcoinsAccumulated,
    handleLogout
  };
}