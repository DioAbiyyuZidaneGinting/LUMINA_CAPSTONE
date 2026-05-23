"use client";

import { useState, useEffect, useCallback } from "react";
import { useSupabaseClient } from "./useSupabaseClient";

export interface CategoryRevenue {
  category: string;
  value: number; // raw revenue sum
  percentage: number; // percentage share allocation
}

export function useRevenueDistribution() {
  const supabase = useSupabaseClient();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [distributions, setDistributions] = useState<CategoryRevenue[]>([]);

  const fetchDistributions = useCallback(async () => {
    try {
      setRefreshing(true);

      // 1. Fetch order items with their product categories relationally
      const { data: orderItems, error } = await supabase
        .from("order_items")
        .select(`
          subtotal,
          products (
            category:categories (
              name
            )
          )
        `);

      if (error) throw error;

      const items = orderItems || [];
      const totalSum = items.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);

      // Aggregate by category
      const aggMap: Record<string, number> = {};
      items.forEach(item => {
        const cat = (item.products as any)?.category?.name || "Lain-lain";
        aggMap[cat] = (aggMap[cat] || 0) + Number(item.subtotal || 0);
      });

      const list: CategoryRevenue[] = Object.keys(aggMap).map(cat => {
        const val = aggMap[cat];
        const pct = totalSum > 0 ? Number(((val / totalSum) * 100).toFixed(1)) : 0;
        return {
          category: cat,
          value: val,
          percentage: pct
        };
      });

      // Sort descending by value
      list.sort((a, b) => b.value - a.value);
      setDistributions(list);

    } catch (err: any) {
      console.error("Gagal mengambil revenue distribution:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchDistributions();
  }, [fetchDistributions]);

  // Listen to standard custom events for reactive update synchronization
  useEffect(() => {
    const handleRefresh = () => fetchDistributions();
    window.addEventListener("refresh-orders", handleRefresh);
    window.addEventListener("refresh-analytics", handleRefresh);
    return () => {
      window.removeEventListener("refresh-orders", handleRefresh);
      window.removeEventListener("refresh-analytics", handleRefresh);
    };
  }, [fetchDistributions]);

  return {
    loading,
    refreshing,
    distributions,
    refetch: fetchDistributions
  };
}
