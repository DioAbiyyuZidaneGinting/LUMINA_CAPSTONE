"use client";

import { useState, useEffect } from "react";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { ChevronDown, Calendar, ShoppingBag, DollarSign, CheckCircle2, Clock, XCircle, MapPin, Package } from "lucide-react";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { useTranslation } from "@/store/languageStore";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";

const HOURS = [
  "6a",
  "8a",
  "10a",
  "12p",
  "2p",
  "4p",
  "6p",
  "8p",
  "10p",
  "12a",
  "2a",
  "4a",
];

function getHeatColor(val: number): string {
  if (val >= 75) return "bg-indigo-700 dark:bg-indigo-600";
  if (val >= 55) return "bg-indigo-500 dark:bg-indigo-500";
  if (val >= 35) return "bg-indigo-300 dark:bg-indigo-400";
  if (val >= 15) return "bg-indigo-100 dark:bg-indigo-900/50";
  return "bg-slate-100 dark:bg-slate-800";
}

// Generate deterministic mock data based on month index to simulate data changes
function generateMonthData(monthIndex: number, DAYS: string[]) {
  const baseMultiplier = 1 + monthIndex * 0.1; // Data increases slightly each month

  const analyticsData = [
    {
      day: DAYS[0] || "Mon",
      orders: Math.floor(67 * baseMultiplier),
      revenue: Math.floor(18500000 * baseMultiplier),
    },
    {
      day: DAYS[1] || "Tue",
      orders: Math.floor(88 * baseMultiplier),
      revenue: Math.floor(24200000 * baseMultiplier),
    },
    {
      day: DAYS[2] || "Wed",
      orders: Math.floor(74 * baseMultiplier),
      revenue: Math.floor(20100000 * baseMultiplier),
    },
    {
      day: DAYS[3] || "Thu",
      orders: Math.floor(112 * baseMultiplier),
      revenue: Math.floor(32800000 * baseMultiplier),
    },
    {
      day: DAYS[4] || "Fri",
      orders: Math.floor(94 * baseMultiplier),
      revenue: Math.floor(27600000 * baseMultiplier),
    },
    {
      day: DAYS[5] || "Sat",
      orders: Math.floor(58 * baseMultiplier),
      revenue: Math.floor(16400000 * baseMultiplier),
    },
    {
      day: DAYS[6] || "Sun",
      orders: Math.floor(43 * baseMultiplier),
      revenue: Math.floor(12100000 * baseMultiplier),
    },
  ];

  const heatmapData = [
    [2, 4, 8, 12, 18, 24, 32, 44, 56, 68, 72, 74].map((v) =>
      Math.min(100, Math.floor(v * baseMultiplier)),
    ),
    [4, 6, 10, 14, 20, 28, 36, 48, 60, 70, 76, 80].map((v) =>
      Math.min(100, Math.floor(v * baseMultiplier)),
    ),
    [3, 5, 9, 13, 17, 22, 31, 40, 52, 66, 71, 73].map((v) =>
      Math.min(100, Math.floor(v * baseMultiplier)),
    ),
    [6, 8, 12, 18, 24, 32, 42, 55, 64, 72, 78, 82].map((v) =>
      Math.min(100, Math.floor(v * baseMultiplier)),
    ),
    [5, 7, 11, 16, 22, 30, 38, 50, 60, 68, 74, 78].map((v) =>
      Math.min(100, Math.floor(v * baseMultiplier)),
    ),
    [8, 11, 15, 20, 28, 36, 46, 58, 68, 76, 80, 84].map((v) =>
      Math.min(100, Math.floor(v * baseMultiplier)),
    ),
    [1, 3, 6, 9, 13, 18, 24, 32, 44, 56, 64, 70].map((v) =>
      Math.min(100, Math.floor(v * baseMultiplier)),
    ),
  ];

  return { analyticsData, heatmapData };
}

export default function OrdersAnalytics() {
  const { t, language } = useTranslation();
  const { format } = useFormatCurrency();
  const supabase = useSupabaseClient();

  const [dbOrders, setDbOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getLocalizedMonths = (lang: string) => {
    const locale = lang === "ID" ? "id-ID" : "en-US";
    const formatter = new Intl.DateTimeFormat(locale, { month: "long" });
    return Array.from({ length: 12 }, (_, i) => {
      const date = new Date(2026, i, 1);
      const name = formatter.format(date);
      return name.charAt(0).toUpperCase() + name.slice(1);
    });
  };

  const getLocalizedDays = (lang: string) => {
    const locale = lang === "ID" ? "id-ID" : "en-US";
    const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(2026, 4, 11 + i); // 2026-05-11 is a Monday
      const name = formatter.format(date);
      return name.charAt(0).toUpperCase() + name.slice(1);
    });
  };

  const MONTHS = getLocalizedMonths(language);
  const DAYS = getLocalizedDays(language);

  const [selectedMonthIndex, setSelectedMonthIndex] = useState(4); // May
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const selectedMonthLabel = MONTHS[selectedMonthIndex] || "May";
  
  // Baseline mock data
  const { analyticsData, heatmapData } = generateMonthData(
    selectedMonthIndex,
    DAYS,
  );

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select(`
          created_at,
          total_amount,
          status,
          city,
          order_items (
            quantity,
            products (
              name
            )
          )
        `);

      if (error) throw error;
      setDbOrders(data || []);
    } catch (err) {
      console.error("Gagal memuat data analitik:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();

    const handleRefresh = () => {
      fetchAnalyticsData();
    };

    window.addEventListener("refresh-orders", handleRefresh);
    return () => {
      window.removeEventListener("refresh-orders", handleRefresh);
    };
  }, []);

  // ── Aggregations ──────────────────────────────────────────────
  let overallOrders = dbOrders.length;
  let overallRevenue = 0;
  let overallCompleted = 0;
  let overallPending = 0;
  let overallCancelled = 0;

  const cityMap: { [key: string]: { orders: number; revenue: number } } = {};
  const productMap: { [key: string]: { quantity: number; revenue: number } } = {};

  const monthlyDayCounts = Array(7).fill(0);
  const monthlyDayRevenues = Array(7).fill(0);
  const monthlyHeatmapCounts = Array(7).fill(0).map(() => Array(12).fill(0));

  // Compute metrics
  dbOrders.forEach((o) => {
    const amt = Number(o.total_amount || 0);
    const status = (o.status || "").toLowerCase();

    if (status === "completed" || status === "processing" || status === "shipped") {
      overallRevenue += amt;
    }
    if (status === "completed") overallCompleted++;
    if (status === "pending") overallPending++;
    if (status === "cancelled") overallCancelled++;

    // City distribution
    const rawCity = o.city ? o.city.trim() : "";
    const city = rawCity || (language === "ID" ? "Luar Kota / Online" : "Online / Other");
    if (!cityMap[city]) {
      cityMap[city] = { orders: 0, revenue: 0 };
    }
    cityMap[city].orders += 1;
    cityMap[city].revenue += amt;

    // Product sales
    if (o.order_items) {
      o.order_items.forEach((item: any) => {
        const prodName = item.products?.name || (language === "ID" ? "Produk Tidak Dikenal" : "Unknown Product");
        const qty = item.quantity || 0;
        if (!productMap[prodName]) {
          productMap[prodName] = { quantity: 0, revenue: 0 };
        }
        productMap[prodName].quantity += qty;
        productMap[prodName].revenue += amt / (o.order_items.length || 1);
      });
    }

    // Filtered selected month aggregations
    const d = new Date(o.created_at);
    if (d.getMonth() === selectedMonthIndex) {
      const dayIndex = (d.getDay() + 6) % 7; // Mon=0 ... Sun=6
      monthlyDayCounts[dayIndex] += 1;
      if (status === "completed" || status === "processing" || status === "shipped") {
        monthlyDayRevenues[dayIndex] += amt;
      }

      // Hour grouping
      const hour = d.getHours();
      let hourIdx = 0;
      if (hour >= 6 && hour < 8) hourIdx = 0;
      else if (hour >= 8 && hour < 10) hourIdx = 1;
      else if (hour >= 10 && hour < 12) hourIdx = 2;
      else if (hour >= 12 && hour < 14) hourIdx = 3;
      else if (hour >= 14 && hour < 16) hourIdx = 4;
      else if (hour >= 16 && hour < 18) hourIdx = 5;
      else if (hour >= 18 && hour < 20) hourIdx = 6;
      else if (hour >= 20 && hour < 22) hourIdx = 7;
      else if (hour >= 22 || hour < 0) hourIdx = 8;
      else if (hour >= 0 && hour < 2) hourIdx = 9;
      else if (hour >= 2 && hour < 4) hourIdx = 10;
      else if (hour >= 4 && hour < 6) hourIdx = 11;

      monthlyHeatmapCounts[dayIndex][hourIdx] += 1;
    }
  });

  // Calculate fallbacks if db is empty
  const hasDbOrders = dbOrders.length > 0;
  if (!hasDbOrders) {
    overallOrders = 138;
    overallRevenue = 34500000;
    overallCompleted = 94;
    overallPending = 28;
    overallCancelled = 16;
  }

  // Active Monthly Charts
  const finalAnalyticsData = DAYS.map((dayName, idx) => {
    const dbCount = monthlyDayCounts[idx];
    const dbRev = monthlyDayRevenues[idx];
    
    return {
      day: dayName,
      orders: hasDbOrders ? dbCount : analyticsData[idx].orders,
      revenue: hasDbOrders ? dbRev : analyticsData[idx].revenue,
    };
  });

  const monthRevenue = finalAnalyticsData.reduce((s, d) => s + d.revenue, 0);
  const monthOrders = finalAnalyticsData.reduce((s, d) => s + d.orders, 0);

  // Peak heatmap normalization
  let maxHeat = 0;
  monthlyHeatmapCounts.forEach((r) => r.forEach((v) => { if (v > maxHeat) maxHeat = v; }));

  const normalizedHeatmap = monthlyHeatmapCounts.map((row) =>
    row.map((val) => (maxHeat > 0 ? Math.min(100, Math.round((val / maxHeat) * 90)) : 0))
  );

  const finalHeatmapData = hasDbOrders ? normalizedHeatmap : heatmapData;

  // Leaderboard formatting
  const formattedCities = Object.entries(cityMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 5);

  const finalCities = hasDbOrders 
    ? formattedCities 
    : [
        { name: "Bandung", orders: 48, revenue: 14500000 },
        { name: "Jakarta", orders: 36, revenue: 9800000 },
        { name: "Surabaya", orders: 24, revenue: 6200000 },
        { name: "Yogyakarta", orders: 18, revenue: 4100000 },
        { name: "Tangerang", orders: 12, revenue: 2900000 },
      ];

  const formattedProducts = Object.entries(productMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const finalProducts = hasDbOrders 
    ? formattedProducts 
    : [
        { name: "Lumina Core Black Edition", quantity: 64, revenue: 16000000 },
        { name: "Retro Run Lite Off-White", quantity: 48, revenue: 11200000 },
        { name: "Air Flow Canvas Forest Green", quantity: 36, revenue: 7800000 },
        { name: "Urban Street Classic Red", quantity: 22, revenue: 4900000 },
        { name: "Signature Slide Sandal Navy", quantity: 15, revenue: 2100000 },
      ];

  const cancellationRate = overallOrders > 0 ? ((overallCancelled / overallOrders) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setIsSelectorOpen(!isSelectorOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-lg shadow-sm text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Calendar className="w-4 h-4 text-slate-400" />
              {selectedMonthLabel} 2026
              <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
            </button>

            {isSelectorOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsSelectorOpen(false)}
                />
                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl shadow-lg shadow-slate-200/40 z-20 overflow-hidden py-1">
                  <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    {MONTHS.map((month, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedMonthIndex(idx);
                          setIsSelectorOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-[13px] font-medium transition-colors ${
                          selectedMonthIndex === idx
                            ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        {month}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* KPI Overview Summary Panel Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Total Orders */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Pesanan</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
            {isLoading ? "..." : overallOrders}
          </p>
          <span className="text-[9px] font-medium text-slate-400 mt-2 block">Seluruh order tercatat</span>
        </div>

        {/* Revenue */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Pendapatan</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <p className="text-lg font-black text-slate-900 dark:text-white leading-none tracking-tight truncate">
            {isLoading ? "..." : format(overallRevenue)}
          </p>
          <span className="text-[9px] font-medium text-slate-400 mt-2 block">GMV penjualan bersih</span>
        </div>

        {/* Completed */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Selesai</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
            {isLoading ? "..." : overallCompleted}
          </p>
          <span className="text-[9px] font-medium text-emerald-600 dark:text-emerald-400 mt-2 block">Pesanan terkirim penuh</span>
        </div>

        {/* Pending */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tertunda</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
            {isLoading ? "..." : overallPending}
          </p>
          <span className="text-[9px] font-medium text-amber-600 dark:text-amber-400 mt-2 block">Membutuhkan tindakan</span>
        </div>

        {/* Cancellation */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rasio Pembatalan</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
              <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
            {isLoading ? "..." : `${cancellationRate}%`}
          </p>
          <span className="text-[9px] font-medium text-rose-600 dark:text-rose-400 mt-2 block">Tingkat retur & batal</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue + Orders Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6 shadow-sm transition-colors">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">
                {t("orders.analytics.monthPerformance", {
                  month: selectedMonthLabel,
                })}
              </p>
              <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                {format(monthRevenue)}
              </p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                {t("orders.analytics.totalOrdersInMonth", {
                  orders: monthOrders,
                  month: selectedMonthLabel,
                })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  {t("orders.analytics.orders")}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-violet-300 dark:bg-violet-500" />
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  {t("orders.analytics.revenue")}
                </span>
              </div>
            </div>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={finalAnalyticsData}
                margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
              >
                <defs>
                  <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--tooltip-bg, white)",
                    border: "1px solid var(--tooltip-border, #f1f5f9)",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                    padding: "10px 14px",
                    fontSize: "11px",
                    fontWeight: "500",
                    color: "var(--tooltip-text, #0f172a)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="orders"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#ordersGrad)"
                  dot={{ fill: "#6366f1", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: "#6366f1" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Day breakdown */}
          <div className="grid grid-cols-7 gap-1 mt-4">
            {finalAnalyticsData.map((d, i) => (
              <div key={i} className="text-center">
                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-1">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-400 to-violet-400 rounded-full"
                    style={{ width: `${Math.min(100, Math.round((d.orders / (monthOrders || 1)) * 300))}%` }}
                  />
                </div>
                <p className="text-[9px] font-medium text-slate-400">
                  {d.orders}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Operational Heatmap */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-5 shadow-sm transition-colors">
          <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">
            {t("orders.analytics.heatmapTitle")}
          </p>
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-4">
            {t("orders.analytics.peakHours", { month: selectedMonthLabel })}
          </p>

          <div className="space-y-1">
            {finalHeatmapData.map((row, ri) => (
              <div key={ri} className="flex items-center gap-1">
                <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400 w-6 shrink-0 text-right">
                  {DAYS[ri]}
                </span>
                <div className="flex gap-0.5 flex-1">
                  {row.map((val, ci) => (
                    <div
                      key={ci}
                      className={`flex-1 h-4 rounded-sm ${getHeatColor(val)} transition-all hover:scale-110 cursor-pointer opacity-90`}
                      title={`${DAYS[ri]} ${HOURS[ci]}: ${hasDbOrders ? monthlyHeatmapCounts[ri][ci] : val} ${t("orders.analytics.orders").toLowerCase()}`}
                    />
                  ))}
                </div>
              </div>
            ))}
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[9px] font-medium text-slate-500 w-6 shrink-0" />
              <div className="flex flex-1 justify-between">
                {HOURS.filter((_, i) => i % 3 === 0).map((h, i) => (
                  <span
                    key={i}
                    className="text-[8px] font-medium text-slate-400"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-4">
            <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400">
              {t("orders.analytics.low")}
            </span>
            <div className="flex gap-0.5 flex-1 opacity-90">
              {[
                "bg-slate-100 dark:bg-slate-800",
                "bg-indigo-100 dark:bg-indigo-900/40",
                "bg-indigo-300 dark:bg-indigo-500/60",
                "bg-indigo-500 dark:bg-indigo-500",
                "bg-indigo-700 dark:bg-indigo-600",
              ].map((cls, i) => (
                <div key={i} className={`flex-1 h-2 rounded-sm ${cls}`} />
              ))}
            </div>
            <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400">
              {t("orders.analytics.high")}
            </span>
          </div>
        </div>
      </div>

      {/* Leaderboard Grid: Top Cities and Top Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Top Cities */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-indigo-500" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Kota Pengiriman Terbanyak
            </h4>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {finalCities.map((c, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-slate-400 w-4">{i + 1}</span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{c.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-slate-900 dark:text-white">{c.orders} Pesanan</p>
                  <p className="text-[10px] font-medium text-slate-400">{format(c.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-4 h-4 text-violet-500" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Produk Terlaris (Leaderboard)
            </h4>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {finalProducts.map((p, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3 max-w-[70%]">
                  <span className="text-xs font-black text-slate-400 w-4">{i + 1}</span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate block">
                    {p.name}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-black text-slate-900 dark:text-white">{p.quantity} Unit</p>
                  <p className="text-[10px] font-medium text-slate-400">{format(p.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
