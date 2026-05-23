"use client";

import { useSettingsStore } from "@/store/settingsStore";
import { useExchangeRateStore } from "../store/exchangeRateStore";
import { useEffect, useMemo } from "react";

export function useFormatCurrency() {
  const currency = useSettingsStore((state) => state.currency);
  const { rate, fetchRate, convertIDRtoUSD, convertUSDtoIDR } = useExchangeRateStore();

  // Fetch rate on mount (store handles caching)
  useEffect(() => {
    fetchRate();
  }, [fetchRate]);

  const currencySymbol = useMemo(() => (currency === "IDR" ? "Rp" : "$"), [currency]);

  const format = (amount: number) => {
    // Amount is assumed to be in IDR (base currency of the app)
    if (currency === "IDR") {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    } else {
      // Use high-precision conversion helper
      const usdAmount = convertIDRtoUSD(amount);
      
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(usdAmount);
    }
  };

  const formatAbbreviated = (amount: number) => {
    if (currency === "IDR") {
      if (amount >= 1e9) return `Rp ${(amount / 1e9).toFixed(1).replace(".", ",")} M`;
      if (amount >= 1e6) return `Rp ${(amount / 1e6).toFixed(1).replace(".", ",")} Jt`;
      return format(amount);
    } else {
      const usdAmount = convertIDRtoUSD(amount);
      if (usdAmount >= 1e6) return `$${(usdAmount / 1e6).toFixed(1)}M`;
      if (usdAmount >= 1e3) return `$${(usdAmount / 1e3).toFixed(1)}K`;
      return format(amount);
    }
  };

  return { format, formatAbbreviated, currency, rate, currencySymbol, convertIDRtoUSD, convertUSDtoIDR };
}
