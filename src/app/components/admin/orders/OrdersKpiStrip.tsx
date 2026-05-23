"use client";

import { ShoppingBag, Truck, Clock, CheckCircle2, XCircle, TrendingUp, TrendingDown } from "lucide-react";
import { useTranslation } from "@/store/languageStore";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";
import { useState, useEffect } from "react";

export default function OrdersKpiStrip() {
  const { t } = useTranslation();
  const supabase = useSupabaseClient();

  const [stats, setStats] = useState({
    processing: 0,
    pending: 0,
    shipped: 0,
    completed: 0,
    cancelled: 0,
  });
  const [todayStats, setTodayStats] = useState({
    processing: 0,
    pending: 0,
    shipped: 0,
    completed: 0,
    cancelled: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select("status, created_at");

      if (error) throw error;

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const counts = {
        processing: 0,
        pending: 0,
        shipped: 0,
        completed: 0,
        cancelled: 0,
      };

      const todayCounts = {
        processing: 0,
        pending: 0,
        shipped: 0,
        completed: 0,
        cancelled: 0,
      };

      (data || []).forEach((order: any) => {
        const status = (order.status || "").toLowerCase();
        const createdAt = new Date(order.created_at);

        if (status === "processing") {
          counts.processing++;
          if (createdAt >= startOfToday) todayCounts.processing++;
        }
        else if (status === "pending") {
          counts.pending++;
          if (createdAt >= startOfToday) todayCounts.pending++;
        }
        else if (status === "shipped") {
          counts.shipped++;
          if (createdAt >= startOfToday) todayCounts.shipped++;
        }
        else if (status === "completed") {
          counts.completed++;
          if (createdAt >= startOfToday) todayCounts.completed++;
        }
        else if (status === "cancelled") {
          counts.cancelled++;
          if (createdAt >= startOfToday) todayCounts.cancelled++;
        }
      });

      setStats(counts);
      setTodayStats(todayCounts);
    } catch (err) {
      console.error("Gagal memuat statistik KPI:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    const handleRefresh = () => {
      fetchStats();
    };

    window.addEventListener("refresh-orders", handleRefresh);
    return () => {
      window.removeEventListener("refresh-orders", handleRefresh);
    };
  }, []);

  const total = stats.processing + stats.pending + stats.shipped + stats.completed + stats.cancelled;
  const getProgress = (count: number) => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  const KPI_DATA = [
    {
      label: t("common.status.processing") || "Diproses",
      count: stats.processing,
      delta: todayStats.processing > 0 ? `+${todayStats.processing}` : "0",
      positive: true,
      icon: ShoppingBag,
      text: "text-blue-600",
      bg: "bg-blue-50/50",
      bar: "bg-blue-500",
      progress: getProgress(stats.processing),
      colSpan: "lg:col-span-2",
      primary: true,
    },
    {
      label: t("common.status.pending") || "Tertunda",
      count: stats.pending,
      delta: todayStats.pending > 0 ? `+${todayStats.pending}` : "0",
      positive: false,
      icon: Clock,
      text: "text-amber-600",
      bg: "bg-amber-50/50",
      bar: "bg-amber-500",
      progress: getProgress(stats.pending),
      colSpan: "lg:col-span-1",
    },
    {
      label: t("common.status.shipped") || "Dikirim",
      count: stats.shipped,
      delta: todayStats.shipped > 0 ? `+${todayStats.shipped}` : "0",
      positive: true,
      icon: Truck,
      text: "text-violet-600",
      bg: "bg-violet-50/50",
      bar: "bg-violet-500",
      progress: getProgress(stats.shipped),
      colSpan: "lg:col-span-1",
    },
    {
      label: t("common.status.completed") || "Selesai",
      count: stats.completed,
      delta: todayStats.completed > 0 ? `+${todayStats.completed}` : "0",
      positive: true,
      icon: CheckCircle2,
      text: "text-emerald-600",
      bg: "bg-emerald-50/50",
      bar: "bg-emerald-500",
      progress: getProgress(stats.completed),
      colSpan: "lg:col-span-1",
    },
    {
      label: t("common.status.cancelled") || "Dibatalkan",
      count: stats.cancelled,
      delta: todayStats.cancelled > 0 ? `+${todayStats.cancelled}` : "0",
      positive: false,
      icon: XCircle,
      text: "text-rose-600",
      bg: "bg-rose-50/50",
      bar: "bg-rose-400",
      progress: getProgress(stats.cancelled),
      colSpan: "lg:col-span-1",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {KPI_DATA.map((kpi, i) => {
        const Icon = kpi.icon;
        return (
          <div
            key={i}
            className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800 p-5 hover:shadow-sm transition-all duration-300 ${kpi.colSpan} flex flex-col justify-between group`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-8 h-8 rounded-lg ${kpi.bg} dark:bg-opacity-10 flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${kpi.text}`} />
              </div>
              <div className={`flex items-center gap-1 text-[11px] font-medium ${kpi.positive ? "text-emerald-600" : "text-rose-600"}`}>
                {kpi.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {kpi.delta}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
              <p className={`${kpi.primary ? "text-3xl" : "text-2xl"} font-semibold text-slate-900 dark:text-white leading-none tracking-tight`}>
                {isLoading ? "..." : kpi.count}
              </p>
            </div>

            {/* Mini progress bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] text-slate-400 font-medium">{t("orders.analytics.dailyVolume") || "Volume Harian"}</span>
                <span className="text-[10px] text-slate-500 font-medium">{kpi.progress}%</span>
              </div>
              <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${kpi.bar} rounded-full transition-all duration-700`}
                  style={{ width: `${kpi.progress}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
