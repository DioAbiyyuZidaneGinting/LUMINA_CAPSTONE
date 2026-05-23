"use client";

import { ShoppingBag, TrendingUp, Truck, Clock, DollarSign, ArrowUpRight, Activity } from "lucide-react";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { useTranslation } from "@/store/languageStore";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";
import { useState, useEffect } from "react";

// Tiny sparkline data
const SPARKS = [
  [30, 40, 35, 55, 45, 60, 70, 65, 80, 90, 85, 95],
  [50, 55, 48, 62, 58, 70, 65, 80, 75, 88, 94, 94],
  [90, 92, 88, 94, 91, 95, 93, 96, 97, 96, 98, 97],
  [2.2, 2.1, 2.3, 2.0, 1.9, 2.1, 1.8, 1.9, 1.7, 1.8, 1.9, 1.8],
  [2, 3, 1, 4, 2, 5, 3, 6, 4, 7, 5, 7],
];

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 28;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  });
  const polyline = pts.join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible opacity-60 group-hover:opacity-100 transition-opacity">
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Last dot */}
      {pts[pts.length - 1] && (
        <circle
          cx={parseFloat(pts[pts.length - 1].split(",")[0])}
          cy={parseFloat(pts[pts.length - 1].split(",")[1])}
          r="2"
          fill={color}
        />
      )}
    </svg>
  );
}

export default function OrdersHero() {
  const { format } = useFormatCurrency();
  const { t } = useTranslation();
  const supabase = useSupabaseClient();

  const [metrics, setMetrics] = useState({
    gmv: 0,
    totalOrders: 0,
    fulfillmentRate: 97.2,
    avgDelivery: 1.8,
    pendingActions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select("total_amount, status, created_at");

      if (error) throw error;

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      let todayGmv = 0;
      let todayCount = 0;
      let todayPending = 0;

      let allTimeCompleted = 0;
      let allTimePending = 0;
      const allTimeTotal = data?.length || 0;

      (data || []).forEach((order: any) => {
        const amt = Number(order.total_amount || 0);
        const status = (order.status || "").toLowerCase();
        const createdAt = new Date(order.created_at);

        if (status === "completed") {
          allTimeCompleted++;
        }
        if (status === "pending") {
          allTimePending++;
        }

        if (createdAt >= startOfToday) {
          todayCount++;
          if (status === "completed" || status === "processing" || status === "shipped") {
            todayGmv += amt;
          }
          if (status === "pending") {
            todayPending++;
          }
        }
      });

      // Simple real-time estimation of fulfillment rate based on completed + in-flight orders
      const fRate = allTimeTotal > 0 
        ? ((allTimeCompleted + (allTimeTotal - allTimePending - allTimeCompleted) * 0.8) / allTimeTotal) * 100 
        : 97.2;

      setMetrics({
        gmv: todayGmv,
        totalOrders: todayCount,
        fulfillmentRate: parseFloat(fRate.toFixed(1)),
        avgDelivery: 1.8,
        pendingActions: todayPending,
      });
    } catch (err) {
      console.error("Gagal memuat metrik hero:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();

    const handleRefresh = () => {
      fetchMetrics();
    };

    window.addEventListener("refresh-orders", handleRefresh);
    return () => {
      window.removeEventListener("refresh-orders", handleRefresh);
    };
  }, []);

  const HERO_METRICS = [
    {
      label: t("orders.hero.gmvToday") || "GMV Hari Ini",
      value: isLoading ? "..." : format(metrics.gmv),
      delta: "+18.4%",
      positive: true,
      icon: DollarSign,
      accent: "text-indigo-400",
      bgAccent: "bg-indigo-500/10",
      sparkColor: "#818cf8",
    },
    {
      label: t("orders.hero.ordersToday") || "Pesanan Hari Ini",
      value: isLoading ? "..." : String(metrics.totalOrders),
      delta: "+12",
      positive: true,
      icon: ShoppingBag,
      accent: "text-blue-400",
      bgAccent: "bg-blue-500/10",
      sparkColor: "#60a5fa",
    },
    {
      label: t("orders.hero.fulfillmentRate") || "Tingkat Pemenuhan",
      value: isLoading ? "..." : `${metrics.fulfillmentRate}%`,
      delta: "+2.1%",
      positive: true,
      icon: TrendingUp,
      accent: "text-emerald-400",
      bgAccent: "bg-emerald-500/10",
      sparkColor: "#34d399",
    },
    {
      label: t("orders.hero.avgDelivery") || "Rata-rata Pengiriman",
      value: t("orders.hero.avgDeliveryValue") || "1.8 hari",
      delta: t("orders.hero.avgDeliveryDelta") || "-0.3 hari",
      positive: true,
      icon: Truck,
      accent: "text-violet-400",
      bgAccent: "bg-violet-500/10",
      sparkColor: "#a78bfa",
    },
    {
      label: t("orders.hero.pendingActions") || "Tindakan Tertunda",
      value: isLoading ? "..." : String(metrics.pendingActions),
      delta: "+3",
      positive: false,
      icon: Clock,
      accent: "text-amber-400",
      bgAccent: "bg-amber-500/10",
      sparkColor: "#fbbf24",
    },
  ];

  const aiEngineText = t("orders.hero.aiEngine") || "Mesin AI Sehat";
  const words = aiEngineText.split(" ");
  const statusWord = words[words.length - 1]; // "Healthy" or "Sehat"
  const prefixWords = words.slice(0, -1).join(" "); // "AI Engine" or "Mesin AI"

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#0a0f1a] border border-white/10 p-8 shadow-xl shadow-slate-900/10 transition-colors">
      {/* Subtle Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Very soft singular glow, not overdone */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Top bar */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center">
                <Activity className="w-3 h-3 text-indigo-400" />
              </div>
              <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400">{t("orders.hero.operationalCommand") || "Pusat Komando Operasional"}</span>
            </div>
            <h2 className="text-2xl font-semibold text-white leading-tight tracking-tight">
              {t("orders.hero.intelligenceHub") || "Pusat Intelijen Pesanan"}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              {t("orders.hero.realtimeMonitoring") || "Pemantauan pemenuhan real-time"}
            </p>
          </div>

          {/* Live status pills - Restrained */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-medium text-slate-300 uppercase tracking-wider">{t("orders.hero.systemLive") || "Sistem Aktif"}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{prefixWords}</span>
              <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-wider">{statusWord}</span>
            </div>
          </div>
        </div>

        {/* Metric cards - Density variation, restrained accents */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {HERO_METRICS.map((m, i) => {
            const Icon = m.icon;
            return (
              <div
                key={i}
                className="bg-white/[0.02] border border-white/5 rounded-xl p-4 hover:bg-white/[0.04] transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-7 h-7 rounded-lg ${m.bgAccent} flex items-center justify-center`}>
                    <Icon className={`w-3.5 h-3.5 ${m.accent}`} />
                  </div>
                  <span
                    className={`text-[10px] font-medium flex items-center gap-0.5 ${
                      m.positive ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    <ArrowUpRight className={`w-3 h-3 ${!m.positive ? "rotate-180" : ""}`} />
                    {m.delta}
                  </span>
                </div>

                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-1">{m.label}</p>
                <p className="text-xl font-semibold text-white tracking-tight leading-none">{m.value}</p>

                {/* Sparkline */}
                <div className="mt-4">
                  <MiniSparkline data={SPARKS[i]} color={m.sparkColor} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
