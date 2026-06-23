import { useState } from "react";

type HomeRoute = {
  params?: {
    name?: string;
    saldo?: number;
  };
};

type UseHomeReturn = {
  userName: string;
  fitcoinsAccumulated: number;
  setFitcoinsAccumulated: React.Dispatch<React.SetStateAction<number>>;
  handleLogout: () => void;
};

export default function useHome(
  route?: HomeRoute,
  onLogout?: () => void
): UseHomeReturn {
  const userName = route?.params?.name || "Usuario";
  const initialBalance = route?.params?.saldo ?? 1250;

  const [fitcoinsAccumulated, setFitcoinsAccumulated] =
    useState<number>(initialBalance);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return {
    userName,
    fitcoinsAccumulated,
    setFitcoinsAccumulated,
    handleLogout,
  };
}