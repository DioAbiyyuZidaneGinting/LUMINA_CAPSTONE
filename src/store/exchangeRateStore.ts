import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ExchangeRateState {
  rate: number; // 1 USD to IDR
  lastUpdated: string | null;
  isLoading: boolean;
  fetchRate: () => Promise<void>;
  // High-precision conversion helpers
  convertIDRtoUSD: (amount: number) => number;
  convertUSDtoIDR: (amount: number) => number;
}

const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes in ms

export const useExchangeRateStore = create<ExchangeRateState>()(
  persist(
    (set, get) => ({
      rate: 16000, // Initial seed, will be updated immediately on mount
      lastUpdated: null,
      isLoading: false,

      fetchRate: async () => {
        const { lastUpdated, isLoading } = get();
        
        // Only fetch if not currently loading and (never updated OR older than 30 mins)
        const now = Date.now();
        const lastUpdateTs = lastUpdated ? new Date(lastUpdated).getTime() : 0;
        
        if (isLoading || (lastUpdated && now - lastUpdateTs < REFRESH_INTERVAL)) {
          return;
        }

        set({ isLoading: true });
        try {
          const response = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
          if (!response.ok) throw new Error("Failed to fetch exchange rate");
          
          const data = await response.json();
          const newRate = data.rates.IDR;
          
          if (!newRate || typeof newRate !== "number") {
            throw new Error("Invalid rate data received");
          }

          set({ 
            rate: newRate, 
            lastUpdated: new Date().toISOString(),
            isLoading: false 
          });
          console.log(`[ExchangeRate] Global Rate Sync: 1 USD = Rp${newRate.toLocaleString("id-ID")}`);
        } catch (error) {
          console.error("Exchange Rate Sync Error:", error);
          set({ isLoading: false });
        }
      },

      convertIDRtoUSD: (amount: number) => {
        const { rate } = get();
        if (!rate) return 0;
        // Use precise floating-point math
        return amount / rate;
      },

      convertUSDtoIDR: (amount: number) => {
        const { rate } = get();
        if (!rate) return 0;
        return amount * rate;
      },
    }),
    {
      name: "lumina-exchange-rate-v2", // New version for clean state
    }
  )
);
