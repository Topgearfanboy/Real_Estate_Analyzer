import { useState } from "react";
import type { ProjectSettings } from "@/types";

interface UseProjectSettingsReturn {
  selectedYears: number;
  setSelectedYears: (years: number) => void;
  cashStrategy: "profit" | "paydown";
  setCashStrategy: (strategy: "profit" | "paydown") => void;
  idealCashHoldingBalance: string;
  setIdealCashHoldingBalance: (balance: string) => void;
  estimatedHomeAppreciationRate: string;
  setEstimatedHomeAppreciationRate: (rate: string) => void;
  purchaseDate: string;
  setPurchaseDate: (date: string) => void;
  getProjectSettings: () => ProjectSettings;
}

export function useProjectSettings(
  initialSettings?: ProjectSettings,
): UseProjectSettingsReturn {
  const [selectedYears, setSelectedYears] = useState(
    initialSettings?.years ?? 30,
  );
  const [cashStrategy, setCashStrategy] = useState<"profit" | "paydown">(
    initialSettings?.cashStrategy ?? "profit",
  );
  const [idealCashHoldingBalance, setIdealCashHoldingBalance] = useState(
    initialSettings?.idealCashHoldingBalance?.toString() ?? "10000",
  );
  const [estimatedHomeAppreciationRate, setEstimatedHomeAppreciationRate] =
    useState(initialSettings?.estimatedHomeAppreciationRate?.toString() ?? "3");
  const [purchaseDate, setPurchaseDate] = useState(
    initialSettings?.purchaseDate ?? new Date().toISOString().split("T")[0],
  );

  const getProjectSettings = (): ProjectSettings => ({
    years: selectedYears,
    cashStrategy,
    idealCashHoldingBalance: parseFloat(idealCashHoldingBalance) || 0,
    estimatedHomeAppreciationRate:
      parseFloat(estimatedHomeAppreciationRate) || 0,
    purchaseDate,
  });

  return {
    selectedYears,
    setSelectedYears,
    cashStrategy,
    setCashStrategy,
    idealCashHoldingBalance,
    setIdealCashHoldingBalance,
    estimatedHomeAppreciationRate,
    setEstimatedHomeAppreciationRate,
    purchaseDate,
    setPurchaseDate,
    getProjectSettings,
  };
}
