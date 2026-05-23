import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Currency = "IDR" | "USD";
export type Theme = "LIGHT" | "DARK" | "SYSTEM";
export type SessionTimeout = "30_MIN" | "1_HOUR" | "4_HOURS";

interface SettingsState {
  // General
  currency: Currency;
  maintenanceMode: boolean;
  
  // AI Intelligence
  replenishmentThreshold: number;
  autonomousActions: boolean;
  dynamicPricing: boolean;
  predictiveAnalytics: boolean;
  ageBasedRecommendation: boolean;
  recommendationLimit: number;
  
  // Notifications
  emailDailyDigest: boolean;
  pushNotifications: boolean;
  
  // Appearance
  theme: Theme;
  
  // Security
  twoFactorEnabled: boolean;
  twoFactorPin: string | null;
  lastPinVerification: number | null; // Timestamp
  sessionTimeout: SessionTimeout;
  autoBackup: boolean;

  // Actions
  setCurrency: (currency: Currency) => void;
  setMaintenanceMode: (val: boolean) => void;
  setReplenishmentThreshold: (val: number) => void;
  setAutonomousActions: (val: boolean) => void;
  setDynamicPricing: (val: boolean) => void;
  setPredictiveAnalytics: (val: boolean) => void;
  setAgeBasedRecommendation: (val: boolean) => void;
  setRecommendationLimit: (val: number) => void;
  setEmailDailyDigest: (val: boolean) => void;
  setPushNotifications: (val: boolean) => void;
  setTheme: (theme: Theme) => void;
  setTwoFactorEnabled: (val: boolean) => void;
  setTwoFactorPin: (pin: string | null) => void;
  setLastPinVerification: (timestamp: number | null) => void;
  setSessionTimeout: (timeout: SessionTimeout) => void;
  setAutoBackup: (val: boolean) => void;
  
  resetSettings: () => void;
}

const DEFAULT_VALUES = {
  currency: "IDR" as Currency,
  maintenanceMode: false,
  replenishmentThreshold: 15,
  autonomousActions: true,
  dynamicPricing: false,
  predictiveAnalytics: true,
  ageBasedRecommendation: true,
  recommendationLimit: 8,
  emailDailyDigest: true,
  pushNotifications: false,
  theme: "SYSTEM" as Theme,
  twoFactorEnabled: false,
  twoFactorPin: null,
  lastPinVerification: null,
  sessionTimeout: "30_MIN" as SessionTimeout,
  autoBackup: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_VALUES,

      setCurrency: (currency) => set({ currency }),
      setMaintenanceMode: (maintenanceMode) => set({ maintenanceMode }),
      setReplenishmentThreshold: (replenishmentThreshold) => set({ replenishmentThreshold }),
      setAutonomousActions: (autonomousActions) => set({ autonomousActions }),
      setDynamicPricing: (dynamicPricing) => set({ dynamicPricing }),
      setPredictiveAnalytics: (predictiveAnalytics) => set({ predictiveAnalytics }),
      setAgeBasedRecommendation: (ageBasedRecommendation) => set({ ageBasedRecommendation }),
      setRecommendationLimit: (recommendationLimit) => set({ recommendationLimit }),
      setEmailDailyDigest: (emailDailyDigest) => set({ emailDailyDigest }),
      setPushNotifications: (pushNotifications) => set({ pushNotifications }),
      setTheme: (theme) => set({ theme }),
      setTwoFactorEnabled: (twoFactorEnabled) => set({ twoFactorEnabled }),
      setTwoFactorPin: (twoFactorPin) => set({ twoFactorPin }),
      setLastPinVerification: (lastPinVerification) => set({ lastPinVerification }),
      setSessionTimeout: (sessionTimeout) => set({ sessionTimeout }),
      setAutoBackup: (autoBackup) => set({ autoBackup }),

      resetSettings: () => set(DEFAULT_VALUES),
    }),
    {
      name: "lumina-settings",
    }
  )
);
