"use client";

import { useState, useEffect } from "react";
import {
  Download,
  RefreshCw,
  Plus,
  SlidersHorizontal,
  ChevronDown,
  Activity,
  Brain,
  BarChart3,
  AlertTriangle,
  Bell,
  Package,
  TrendingUp,
} from "lucide-react";

import OrdersHero from "@/app/components/admin/orders/OrdersHero";
import OrdersKpiStrip from "@/app/components/admin/orders/OrdersKpiStrip";
import OrdersTable from "@/app/components/admin/orders/OrdersTable";
import OrdersAnalytics from "@/app/components/admin/orders/OrdersAnalytics";
import AddSalesModal from "@/app/components/admin/orders/AddSalesModal";
import { useTranslation } from "@/store/languageStore";
import { useNotificationStore } from "@/store/notificationStore";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";
import { toast } from "sonner";

/* ─── Section Header ──────────────────────────────────────────── */
function SectionHeader({
  icon: Icon,
  label,
  title,
  sub,
  accent = "text-blue-600",
  accentBg = "bg-blue-50 dark:bg-blue-500/10",
  accentBorder = "border-blue-100 dark:border-blue-500/20",
}: {
  icon: React.ElementType;
  label: string;
  title: string;
  sub: string;
  accent?: string;
  accentBg?: string;
  accentBorder?: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div
        className={`w-10 h-10 rounded-2xl ${accentBg} border ${accentBorder} flex items-center justify-center shrink-0 shadow-sm`}
      >
        <Icon className={`w-4 h-4 ${accent}`} />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
          {label}
        </p>
        <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight tracking-tight">{title}</h3>
        <p className="text-xs text-slate-500 font-medium mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────── */
export default function OrdersPage() {
  const { t, language } = useTranslation();
  const { addNotification } = useNotificationStore();
  const { format } = useFormatCurrency();
  const supabase = useSupabaseClient();

  const [activeTab, setActiveTab] = useState("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddSalesOpen, setIsAddSalesOpen] = useState(false);
  const [todayOrdersCount, setTodayOrdersCount] = useState<number | null>(null);

  const TABS = [
    { id: "overview", label: t("orders.tab.overview") },
    { id: "analytics", label: t("orders.tab.analytics") },
  ];

  const fetchTodayCount = async () => {
    try {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      
      const { count, error } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startOfToday.toISOString());

      if (!error) {
        setTodayOrdersCount(count || 0);
      }
    } catch (err) {
      console.error("Gagal memuat count pesanan hari ini:", err);
    }
  };

  useEffect(() => {
    fetchTodayCount();

    const handleRefreshCount = () => {
      fetchTodayCount();
    };

    window.addEventListener("refresh-orders", handleRefreshCount);
    return () => {
      window.removeEventListener("refresh-orders", handleRefreshCount);
    };
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Dispatch the custom event to sync all subcomponents
    window.dispatchEvent(new CustomEvent("refresh-orders"));
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success(t("orders.toast.refreshed"), {
        description: t("orders.toast.refreshedDesc")
      });
    }, 800);
  };

  const handleExport = async () => {
    try {
      toast.loading("Menyiapkan data ekspor...");
      const { data, error } = await supabase
        .from("orders")
        .select(`
          order_number,
          customer_name,
          phone,
          address,
          city,
          payment_status,
          status,
          total_amount,
          created_at,
          order_items (
            quantity
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      toast.dismiss();

      if (!data || data.length === 0) {
        toast.error("Tidak ada data pesanan untuk diekspor.");
        return;
      }

      // Build CSV
      const headers = [
        "Nomor Pesanan",
        "Pelanggan",
        "Telepon",
        "Alamat",
        "Kota",
        "Status Pembayaran",
        "Status Pesanan",
        "Jumlah Item",
        "Subtotal",
        "Tanggal Dibuat"
      ];

      const rows = data.map((o: any) => {
        const totalItems = o.order_items
          ? o.order_items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0)
          : 0;

        return [
          o.order_number,
          `"${(o.customer_name || "").replace(/"/g, '""')}"`,
          o.phone || "-",
          `"${(o.address || "").replace(/"/g, '""')}"`,
          `"${(o.city || "").replace(/"/g, '""')}"`,
          o.payment_status ? o.payment_status.toUpperCase() : "PENDING",
          o.status ? o.status.toUpperCase() : "PENDING",
          totalItems,
          o.total_amount || 0,
          o.created_at
        ];
      });

      const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);

      const todayStr = new Date().toISOString().split("T")[0];
      link.setAttribute("download", `orders-export-${todayStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Ekspor CSV Berhasil!", {
        description: `${data.length} transaksi pesanan diunduh.`
      });
    } catch (err: any) {
      console.error(err);
      toast.dismiss();
      toast.error("Gagal melakukan ekspor data: " + err.message);
    }
  };

  const handleToggleFilters = () => {
    // Dispatch custom event to let OrdersTable toggle its advanced filters
    window.dispatchEvent(new CustomEvent("toggle-advanced-filters"));
  };

  const handleNewOrder = () => {
    setIsAddSalesOpen(true);
  };

  // Simulate notification when a new order comes in (for demo purposes)
  useEffect(() => {
    const timer = setTimeout(() => {
      addNotification({
        title: language === "ID" ? "Pesanan Baru" : "New Order",
        description: language === "ID" 
          ? `Customer #9402 baru saja melakukan pembelian sebesar ${format(1250000)}.`
          : `Customer #9402 just completed a purchase of ${format(1250000)}.`,
        type: "SUCCESS",
        source: "Sales"
      });
    }, 15000); // 15 seconds after load
    return () => clearTimeout(timer);
  }, [addNotification, format, language]);

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* ── Page Header ───────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800 shadow-sm transition-colors">
        <div className="max-w-[1600px] mx-auto px-8 py-5">
          <div className="flex items-center justify-between gap-6 flex-wrap">
            {/* Title block */}
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">
                {t("orders.titleHeader")}
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-2">
                {t("orders.subtitle")} · <span className="font-black text-blue-600">
                  {todayOrdersCount !== null ? `${todayOrdersCount} ` : "..."}{t("orders.today")}
                </span>
              </p>
            </div>

            {/* Action bar */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-blue-500" : "text-slate-400"}`}
                />
                {t("common.action.refresh")}
              </button>

              <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                {t("common.action.export")}
              </button>

              <button 
                onClick={handleToggleFilters}
                className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                {t("common.action.filters")}
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              <button 
                onClick={handleNewOrder}
                className="flex items-center gap-2 px-6 py-2 text-[10px] font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                {t("orders.modal.addSales")}
              </button>
            </div>
          </div>

          {/* Tab Strip */}
          <div className="flex items-center gap-8 mt-6 -mb-5 overflow-x-auto scrollbar-none">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 pb-3 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-blue-600"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content Area ──────────────────────────────────────────── */}
      <div className="max-w-[1600px] mx-auto px-8 py-8 space-y-12">

        {/* ── OVERVIEW TAB ────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <div className="space-y-12 animate-in fade-in duration-500">
            {/* Hero */}
            <OrdersHero />

            {/* KPI Strip */}
            <section className="space-y-6">
              <div>
                <SectionHeader 
                  icon={Activity}
                  label={t("orders.section.dailyOperations")}
                  title={t("orders.section.fulfillmentPipeline")}
                  sub={t("orders.section.fulfillmentDesc")}
                />
              </div>
              <OrdersKpiStrip />
            </section>

            {/* Orders Table */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <SectionHeader 
                  icon={Package}
                  label={t("orders.section.orderRegistry")}
                  title={t("orders.section.activeShipments")}
                  sub={t("orders.section.registryDesc")}
                  accent="text-emerald-600"
                  accentBg="bg-emerald-50 dark:bg-emerald-500/10"
                  accentBorder="border-emerald-100 dark:border-emerald-500/20"
                />
                <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-500/20 shadow-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 tracking-widest uppercase">
                    {t("orders.section.liveUpdates")}
                  </span>
                </div>
              </div>
              <OrdersTable />
            </section>
          </div>
        )}

        {/* ── ANALYTICS TAB ───────────────────────────────────────── */}
        {activeTab === "analytics" && (
          <section className="animate-in slide-in-from-right-4 duration-500">
            <div className="mb-8">
              <SectionHeader
                icon={BarChart3}
                label={t("orders.section.visualization")}
                title={t("orders.analytics.heatmapTitle")}
                sub={t("orders.analytics.heatmapSub")}
                accent="text-blue-600"
                accentBg="bg-blue-50 dark:bg-blue-500/10"
                accentBorder="border-blue-100 dark:border-blue-500/20"
              />
            </div>
            <OrdersAnalytics />
          </section>
        )}

        {/* ── Footer spacer ─────────────────────────────────────── */}
        <div className="h-8" />
      </div>

      {/* Add Sales Modal */}
      <AddSalesModal 
        isOpen={isAddSalesOpen} 
        onClose={() => setIsAddSalesOpen(false)} 
      />
    </div>
  );
}
