"use client";

import { useState, useEffect } from "react";
import { useLanguageStore, translations } from "../../../store/languageStore";
import TopMetrics from "../../components/admin/dashboard/TopMetrics";
import SalesAnalytics from "../../components/admin/dashboard/SalesAnalytics";
import RevenueDistribution from "../../components/admin/dashboard/RevenueDistribution";
import ProfitMarginAnalysis from "../../components/admin/dashboard/ProfitMarginAnalysis";
import CustomerFunnel from "../../components/admin/dashboard/CustomerFunnel";
import TopProducts from "../../components/admin/dashboard/TopProducts";
import SmartRestockPrediction from "../../components/admin/dashboard/SmartRestockPrediction";
import InventoryAlertsEngine from "../../components/admin/dashboard/InventoryAlertsEngine";
import { useNotificationStore } from "@/store/notificationStore";
import { useUser } from "@clerk/nextjs";

// Import live relational CRM and stock analytics hooks
import { useDashboardAnalytics } from "../../../hooks/useDashboardAnalytics";
import { useInventoryInsights } from "../../../hooks/useInventoryInsights";

export default function AdminDashboardPage() {
  // Fetch real-time relational analytics from Supabase
  const { 
    loading: loadingAnalytics, 
    metrics, 
    criticalStockCount,
    refetch: refetchAnalytics
  } = useDashboardAnalytics();

  const { 
    loading: loadingInventory, 
    stockItems,
    refetch: refetchInventory
  } = useInventoryInsights();

  const { language } = useLanguageStore();
  const t = translations[language];
  const { addNotification } = useNotificationStore();
  const { user } = useUser();

  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    
    if (user) {
      addNotification({
        title: "Login Berhasil",
        description: `Selamat datang kembali, ${user.fullName || "Admin"}. Sesi Anda telah diverifikasi secara aman.`,
        type: "SUCCESS",
        source: "Auth"
      });
    }
  }, [user, addNotification]);

  if (!mounted) {
    return (
      <div className="p-8 bg-white dark:bg-slate-950 min-h-screen text-slate-500 font-medium flex items-center justify-center transition-colors">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          {language === "ID" ? "Menginisialisasi Platform Analisis Perusahaan..." : "Initializing Enterprise Analytics Platform..."}
        </div>
      </div>
    );
  }

  const isLoading = loadingAnalytics || loadingInventory;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6">
        {/* SECTION 1: Top KPI Cards */}
        <TopMetrics
          metrics={metrics}
          isLoading={loadingAnalytics}
          stockAlertsCount={criticalStockCount}
        />

        {/* SECTION 2: Prediksi Pengisian Stok */}
        <div id="restock-prediction-section">
          <SmartRestockPrediction isLoading={loadingInventory} />
        </div>

        {/* SECTION 3: Peringatan Inventaris & Mesin Pendapatan Prediktif */}
        <div className="flex flex-col gap-6">
          <InventoryAlertsEngine isLoading={loadingInventory} stockItems={stockItems} />
          <SalesAnalytics forecast={[]} isLoading={loadingAnalytics} />
        </div>

        {/* SECTION 4: Corong Konversi + Distribusi Pendapatan */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CustomerFunnel isLoading={loadingAnalytics} />
          <RevenueDistribution isLoading={loadingAnalytics} />
        </div>

        {/* SECTION 5: Produk Performa Teratas + Analisis Margin Profit */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopProducts isLoading={loadingAnalytics} />
          <ProfitMarginAnalysis isLoading={loadingAnalytics} />
        </div>
      </div>
    </div>
  );
}
