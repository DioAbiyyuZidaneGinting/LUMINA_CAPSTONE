"use client";

import { useState, useEffect, useCallback } from "react";
import { useSupabaseClient } from "./useSupabaseClient";

export interface FunnelMetrics {
  totalVisitors: number;
  productViews: number;
  addToCart: number;
  checkoutStarts: number;
  successfulPurchases: number;
  overallCr: string;
  cartAbandonment: string;
}

export function useCustomerFunnel(timeFilter: '24h' | '7d' | '30d' | 'all' = '30d') {
  const supabase = useSupabaseClient();
  const [loading, setLoading] = useState(true);
  const [hasTelemetry, setHasTelemetry] = useState(true);
  const [metrics, setMetrics] = useState<FunnelMetrics>({
    totalVisitors: 0,
    productViews: 0,
    addToCart: 0,
    checkoutStarts: 0,
    successfulPurchases: 0,
    overallCr: "0.0%",
    cartAbandonment: "0.0%"
  });

  const fetchFunnel = useCallback(async () => {
    try {
      setLoading(true);

      let query = supabase.from('storefront_events').select('event_type, session_id');

      if (timeFilter !== 'all') {
        const date = new Date();
        if (timeFilter === '24h') date.setHours(date.getHours() - 24);
        else if (timeFilter === '7d') date.setDate(date.getDate() - 7);
        else if (timeFilter === '30d') date.setDate(date.getDate() - 30);
        query = query.gte('created_at', date.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        // Table probably doesn't exist yet
        setHasTelemetry(false);
        throw error;
      }

      if (!data || data.length === 0) {
        setHasTelemetry(false);
        return;
      }

      setHasTelemetry(true);

      const uniqueSessions = {
        page_view: new Set<string>(),
        product_view: new Set<string>(),
        add_to_cart: new Set<string>(),
        checkout_start: new Set<string>(),
        purchase: new Set<string>()
      };

      data.forEach(event => {
        if (uniqueSessions[event.event_type as keyof typeof uniqueSessions]) {
          uniqueSessions[event.event_type as keyof typeof uniqueSessions].add(event.session_id);
        }
      });

      // Total Visitors is the count of unique sessions across all events
      const allSessions = new Set<string>();
      data.forEach(event => allSessions.add(event.session_id));
      const totalVisitors = allSessions.size;

      const productViews = uniqueSessions.product_view.size;
      const addToCart = uniqueSessions.add_to_cart.size;
      const checkoutStarts = uniqueSessions.checkout_start.size;
      const successfulPurchases = uniqueSessions.purchase.size;

      const overallCr = totalVisitors > 0 
        ? ((successfulPurchases / totalVisitors) * 100).toFixed(1) + "%" 
        : "0.0%";

      let abandonedSessionsCount = 0;
      uniqueSessions.add_to_cart.forEach(sessionId => {
        if (!uniqueSessions.purchase.has(sessionId)) {
          abandonedSessionsCount++;
        }
      });

      const cartAbandonment = addToCart > 0
        ? ((abandonedSessionsCount / addToCart) * 100).toFixed(1) + "%"
        : "0.0%";

      if (process.env.NODE_ENV === 'development') {
        console.log('[CustomerFunnel] Aggregated counts:', {
          totalVisitors,
          productViews,
          addToCart,
          checkoutStarts,
          successfulPurchases,
          calculatedCr: overallCr,
          calculatedAbandonment: cartAbandonment
        });
      }

      setMetrics({
        totalVisitors,
        productViews,
        addToCart,
        checkoutStarts,
        successfulPurchases,
        overallCr,
        cartAbandonment
      });
    } catch (e) {
      if (process.env.NODE_ENV === 'development') console.log('CustomerFunnel Telemetry inactive or table missing.', e);
      setHasTelemetry(false);
    } finally {
      setLoading(false);
    }
  }, [supabase, timeFilter]);

  useEffect(() => {
    fetchFunnel();
  }, [fetchFunnel]);

  return {
    loading,
    hasTelemetry,
    metrics,
    refetch: fetchFunnel
  };
}
