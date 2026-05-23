"use client";

import { useState, useEffect, useCallback } from "react";
import { useSupabaseClient } from "./useSupabaseClient";

export interface StockItem {
  id: string;
  productName: string;
  category: string;
  size: string;
  stock: number;
  lowStockThreshold: number;
  customSku: string;
  status: "CRITICAL" | "ELEVATED" | "SAFE";
  statusText: string;
  dailyVelocity: number;
  daysRemaining: number;
  predictedRestockDate: string;
  image?: string;
}

export function useInventoryInsights() {
  const supabase = useSupabaseClient();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);

  const fetchInsights = useCallback(async () => {
    try {
      setRefreshing(true);

      // 1. Fetch products & variants
      const { data: variants, error: variantsError } = await supabase
        .from("product_variants")
        .select(`
          id,
          product_id,
          size,
          stock,
          custom_sku,
          products (
            name,
            category:categories(name),
            low_stock_threshold,
            product_images(image_url, is_primary)
          )
        `);

      if (variantsError) throw variantsError;

      // 2. Fetch order items from the last 30 days to calculate transaction velocity
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: orderItems, error: itemsError } = await supabase
        .from("order_items")
        .select("variant_id, quantity, orders!inner(created_at)")
        .gte("orders.created_at", thirtyDaysAgo.toISOString());

      if (itemsError) throw itemsError;

      // Calculate quantity sold per variant in last 30 days
      const salesMap: Record<string, number> = {};
      (orderItems || []).forEach(item => {
        const vId = item.variant_id;
        salesMap[vId] = (salesMap[vId] || 0) + Number(item.quantity || 0);
      });

      const mapped: StockItem[] = (variants || []).map(v => {
        const pName = (v.products as any)?.name || "Produk Tanpa Nama";
        const cat = (v.products as any)?.category?.name || "Lain-lain";
        const lowStockThreshold = Number((v.products as any)?.low_stock_threshold) || 5;
        const stockVal = Number(v.stock || 0);
        
        // Velocity (units sold per day over last 30 days)
        const unitsSold = salesMap[v.id] || 0;
        const dailyVelocity = Number((unitsSold / 30).toFixed(2));
        
        // Days remaining = stock / velocity
        let daysRemaining = 999; // Default if no sales
        if (dailyVelocity > 0) {
          daysRemaining = Math.max(0, Math.ceil(stockVal / dailyVelocity));
        }

        // Restock predictions
        const restockDate = new Date();
        restockDate.setDate(restockDate.getDate() + (daysRemaining > 365 ? 90 : daysRemaining));
        const formattedRestock = daysRemaining > 365 ? "-" : restockDate.toLocaleDateString();

        // Status thresholds
        let status: "CRITICAL" | "ELEVATED" | "SAFE" = "SAFE";
        let statusText = "Aman";
        if (stockVal <= lowStockThreshold) {
          status = "CRITICAL";
          statusText = "Habis/Menipis";
        } else if (stockVal <= lowStockThreshold + 10) {
          status = "ELEVATED";
          statusText = "Elevated Risk";
        }

        const productImages = (v.products as any)?.product_images || [];
        const image = productImages.find((img: any) => img.is_primary)?.image_url 
                   || productImages[0]?.image_url;

        return {
          id: v.id,
          productName: pName,
          category: cat,
          size: v.size || "-",
          stock: stockVal,
          lowStockThreshold,
          customSku: v.custom_sku || "NO-SKU",
          status,
          statusText,
          dailyVelocity,
          daysRemaining,
          predictedRestockDate: formattedRestock,
          image
        };
      });

      // Sort low stock first
      mapped.sort((a, b) => a.stock - b.stock);
      setStockItems(mapped);

    } catch (err: any) {
      console.error("Gagal mengambil inventory insights:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  // Listen to standard custom events for reactive update synchronization
  useEffect(() => {
    const handleRefresh = () => fetchInsights();
    window.addEventListener("refresh-orders", handleRefresh);
    window.addEventListener("refresh-analytics", handleRefresh);
    return () => {
      window.removeEventListener("refresh-orders", handleRefresh);
      window.removeEventListener("refresh-analytics", handleRefresh);
    };
  }, [fetchInsights]);

  return {
    loading,
    refreshing,
    stockItems,
    refetch: fetchInsights
  };
}
