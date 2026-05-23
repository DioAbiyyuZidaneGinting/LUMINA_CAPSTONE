"use client";

import { useEffect } from "react";
import { useExchangeRateStore } from "../../../store/exchangeRateStore";

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const fetchRate = useExchangeRateStore((state) => state.fetchRate);

  useEffect(() => {
    // Initial fetch
    fetchRate();

    // Re-fetch every 1 hour
    const interval = setInterval(() => {
      fetchRate();
    }, 3600000);

    return () => clearInterval(interval);
  }, [fetchRate]);

  return <>{children}</>;
}
