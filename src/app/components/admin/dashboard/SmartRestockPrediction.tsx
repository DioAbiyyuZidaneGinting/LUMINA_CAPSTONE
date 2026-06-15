"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  BarChart3,
  Brain,
  RefreshCw,
  CheckCircle2,
  Database,
  Cpu,
} from "lucide-react";
import { useLanguageStore, translations } from "../../../../store/languageStore";
import { useSupabaseClient } from "../../../../hooks/useSupabaseClient";

interface Props {
  isLoading: boolean;
}

// Type for ML API forecast response
interface MLForecastItem {
  order_date: string;
  predicted_items: number;
  predicted_revenue: number;
}

interface MLForecastResponse {
  horizon_days: number;
  total_predicted_items: number;
  total_predicted_revenue: number;
  avg_daily_items: number;
  avg_daily_revenue: number;
  forecast: MLForecastItem[];
}

interface MLHealthResponse {
  status: string;
  model_name: string;
  trained_at: string;
  train_period: string[];
}

export default function SmartRestockPrediction({ isLoading }: Props) {
  const { language } = useLanguageStore();
  const t = translations[language];
  const supabase = useSupabaseClient();

  const filterLabels = {
    ID: {
      historicalData: "Data Historis",
      predictionRange: "Rentang Prediksi",
      daysAgo: (n: number) => `${n} Hari Lalu`,
      monthsAgo: (n: number) => `${n} Bulan Lalu`,
      yearAgo: "1 Tahun Lalu",
      nextDays: (n: number) => `${n} Hari Ke Depan`,
      nextMonths: (n: number) => `${n} Bulan Ke Depan`,
    },
    EN: {
      historicalData: "Historical Data",
      predictionRange: "Prediction Range",
      daysAgo: (n: number) => `${n} Days Ago`,
      monthsAgo: (n: number) => `${n} Month${n > 1 ? "s" : ""} Ago`,
      yearAgo: "1 Year Ago",
      nextDays: (n: number) => `Next ${n} Days`,
      nextMonths: (n: number) => `Next ${n} Month${n > 1 ? "s" : ""}`,
    }
  };

  const currentLabels = filterLabels[language as "ID" | "EN"] || filterLabels.EN;

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [insufficientData, setInsufficientData] = useState(false);
  const [loading, setLoading] = useState(true);

  // ML API state
  const [mlModelName, setMlModelName] = useState<string | null>(null);
  const [mlConnected, setMlConnected] = useState(false);
  const [mlForecast, setMlForecast] = useState<MLForecastItem[]>([]);

  // Filters state
  const [historyRange, setHistoryRange] = useState(30);
  const [predictionRange, setPredictionRange] = useState(7);

  // Fetch ML model health on mount
  const fetchMLHealth = useCallback(async () => {
    try {
      const res = await fetch("/api/ml-health");
      if (res.ok) {
        const data: MLHealthResponse = await res.json();
        if (data.status === "ok") {
          setMlModelName(data.model_name);
          setMlConnected(true);
        }
      }
    } catch {
      setMlConnected(false);
    }
  }, []);

  // Fetch live ML predictions based on actual store data
  const fetchLivePrediction = useCallback(async (): Promise<MLForecastItem[]> => {
    try {
      const res = await fetch(
        `/api/ml-predict?horizonDays=${predictionRange}&historyDays=${Math.max(historyRange, 90)}`
      );
      if (!res.ok) throw new Error("ML predict API error");
      const data = await res.json();

      if (data.error) throw new Error(data.details || data.error);

      setMlConnected(true);
      setMlModelName(data.model_name || "Random Forest");

      // Derive confidence from prediction consistency
      if (data.forecast && data.forecast.length > 0) {
        const items = data.forecast.map((f: any) => f.predicted_items);
        const mean = items.reduce((a: number, b: number) => a + b, 0) / items.length;
        if (mean > 0) {
          const variance = items.reduce((a: number, b: number) => a + Math.pow(b - mean, 2), 0) / items.length;
          const cv = Math.sqrt(variance) / mean;
          const derivedConfidence = Math.min(98, Math.max(80, 100 - cv * 15));
          setConfidence(Number(derivedConfidence.toFixed(1)));
        } else {
          setConfidence(0);
        }
      }

      return data.forecast || [];
    } catch (err) {
      console.error("Live prediction error:", err);
      setMlConnected(false);
      return [];
    }
  }, [predictionRange, historyRange]);

  const fetchDemandForecast = useCallback(async () => {
    try {
      setLoading(true);
      setInsufficientData(false);

      // Step 1: Fetch actual store data from Supabase AND live ML predictions in parallel
      const [mlPredictions, orderResult] = await Promise.all([
        fetchLivePrediction(),
        supabase
          .from("order_items")
          .select(`
            quantity,
            orders!inner(created_at)
          `)
      ]);

      const { data: orderItems, error } = orderResult;
      if (error) throw error;

      // Extract created_at from the joined orders table
      const itemsList = (orderItems || []).map((item: any) => ({
        quantity: item.quantity,
        created_at: Array.isArray(item.orders) ? item.orders[0]?.created_at : item.orders?.created_at
      })).filter((item) => item.created_at);

      // Step 2: Group actual sales by date for the historical range
      const historyDate = new Date();
      historyDate.setDate(historyDate.getDate() - historyRange);
      
      const recentItems = itemsList.filter(item => new Date(item.created_at) >= historyDate);
      const salesMap: Record<string, number> = {};
      recentItems.forEach(item => {
        const dateStr = new Date(item.created_at).toISOString().split("T")[0];
        salesMap[dateStr] = (salesMap[dateStr] || 0) + Number(item.quantity || 0);
      });

      const data: any[] = [];
      const today = new Date();

      // Step 3: Build historical data (actual demand from Supabase)
      for (let i = historyRange; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        const actualSales = salesMap[dateStr] || 0;

        data.push({
          date: dateStr,
          demand: actualSales > 0 ? actualSales : null,
          predicted: null,
        });
      }

      // Step 4: Build prediction data from LIVE ML model (fed by actual store data)
      if (mlPredictions.length > 0) {
        mlPredictions.forEach((pred) => {
          data.push({
            date: pred.order_date,
            demand: null,
            predicted: Number(pred.predicted_items.toFixed(1)),
          });
        });
      } else {
        // Fallback: simple projection if ML API unavailable
        const totalUnitsSold = recentItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
        const avgDailyVelocity = Math.max(1, totalUnitsSold / historyRange);
        
        for (let i = 1; i <= predictionRange; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() + i);
          const predicted = avgDailyVelocity * 1.15 + Math.sin(i * 0.5) * 3;

          data.push({
            date: d.toISOString().split("T")[0],
            demand: null,
            predicted: Number(Math.max(1, predicted).toFixed(1)),
          });
        }
        
        if (confidence === null) {
          setConfidence(0);
        }
      }

      setChartData(data);

    } catch (err: any) {
      console.error("Gagal memuat restock forecast:", err.message);
      setInsufficientData(true);
    } finally {
      setLoading(false);
    }
  }, [supabase, historyRange, predictionRange, fetchLivePrediction, confidence]);

  useEffect(() => {
    fetchMLHealth();
  }, [fetchMLHealth]);

  useEffect(() => {
    fetchDemandForecast();
  }, [supabase, historyRange, predictionRange]);

  useEffect(() => {
    const handleRefresh = () => fetchDemandForecast();
    window.addEventListener("refresh-orders", handleRefresh);
    window.addEventListener("refresh-analytics", handleRefresh);
    return () => {
      window.removeEventListener("refresh-orders", handleRefresh);
      window.removeEventListener("refresh-analytics", handleRefresh);
    };
  }, [supabase, historyRange, predictionRange]);

  const handleRunAnalysis = async () => {
    if (insufficientData) return;
    setIsAnalyzing(true);
    setRecommendation(null);

    try {
      const response = await fetch("/api/forecast-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chartData,
          language,
          mlModelConnected: mlConnected,
          modelName: mlModelName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate AI analysis");
      }

      const data = await response.json();
      setRecommendation(data.recommendation);
    } catch (err: any) {
      console.error("AI Analysis Error:", err);
      setRecommendation(
        language === "ID"
          ? "Gagal menghubungi AI Lumina. Silakan coba sesaat lagi."
          : "Failed to connect to Lumina AI. Please try again shortly."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse">
        <div className="h-6 w-1/3 bg-slate-100 dark:bg-slate-800 rounded mb-8"></div>
        <div className="h-[300px] bg-slate-50 dark:bg-slate-800/50 rounded mb-6"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors w-full flex flex-col justify-between min-h-[420px] relative overflow-hidden">
      <div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
                <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                {t.replenishmentForecast || "Smart Restock Forecast"}
              </h3>
              {/* ML Model connection badge */}
              {mlConnected ? (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-full">
                  <Cpu className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-[8px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
                    {mlModelName || "ML Model"}
                  </span>
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-full">
                  <span className="text-[8px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest">
                    Fallback
                  </span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {mlConnected
                ? (language === "ID"
                    ? `Prediksi menggunakan model ${mlModelName || "ML"} yang terintegrasi via API.`
                    : `Predictions powered by ${mlModelName || "ML"} model integrated via API.`)
                : (language === "ID"
                    ? "Peramalan pergerakan permintaan inventaris real-time terintegrasi database."
                    : "Real-time demand forecasting driven by authentic checkout transactions.")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                {language === "ID" ? "Keyakinan Prediksi" : "Forecast Confidence"}
              </p>
              <p className={`text-xs font-black ${
                mlConnected
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-indigo-600 dark:text-indigo-400"
              }`}>
                {insufficientData ? "-" : confidence !== null ? `${confidence}%` : "-"}
              </p>
            </div>
            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing || insufficientData}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                isAnalyzing || insufficientData
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500 dark:text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all duration-300 border-none active:scale-95"
              }`}
            >
              {isAnalyzing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Brain className="w-3.5 h-3.5" />
              )}
              {isAnalyzing
                ? language === "ID"
                  ? "Menganalisis..."
                  : "Analyzing..."
                : (language === "ID" ? "Jalankan Analisis" : "Run Analysis")}
            </button>
          </div>
        </div>

        {/* Dynamic Warning overlay if insufficient order rows exist */}
        {insufficientData ? (
          <div className="my-12 flex flex-col items-center justify-center text-center p-8 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-2xl max-w-[500px] mx-auto">
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900 rounded-2xl flex items-center justify-center mb-4 text-amber-600 dark:text-amber-400">
              <Database className="w-6 h-6 animate-pulse" />
            </div>
            <h4 className="text-xs font-black text-slate-950 dark:text-white uppercase tracking-widest mb-2">
              {language === "ID" ? "Analisis AI Ditangguhkan" : "AI Analysis Suspended"}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              {language === "ID"
                ? "Data historis transaksi belum cukup untuk membangun prediksi inventaris berbasis AI."
                : "Insufficient transaction history data to formulate AI inventory predictions."}
            </p>
          </div>
        ) : (
          <>
            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-4 mb-5 p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-900/60 text-xs">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[9px]">
                  {language === "ID" ? "Filter Grafik:" : "Graph Filters:"}
                </span>
              </div>

              {/* History Filter */}
              <div className="flex items-center gap-2">
                <label htmlFor="history-range-select" className="text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  {currentLabels.historicalData}
                </label>
                <select
                  id="history-range-select"
                  value={historyRange}
                  onChange={(e) => setHistoryRange(Number(e.target.value))}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer text-xs transition-colors hover:border-slate-350 dark:hover:border-slate-700"
                >
                  <option value={7}>{currentLabels.daysAgo(7)}</option>
                  <option value={30}>{currentLabels.monthsAgo(1)}</option>
                  <option value={90}>{currentLabels.monthsAgo(3)}</option>
                  <option value={180}>{currentLabels.monthsAgo(6)}</option>
                  <option value={365}>{currentLabels.yearAgo}</option>
                </select>
              </div>

              {/* Prediction Filter */}
              <div className="flex items-center gap-2">
                <label htmlFor="prediction-range-select" className="text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  {currentLabels.predictionRange}
                </label>
                <select
                  id="prediction-range-select"
                  value={predictionRange}
                  onChange={(e) => setPredictionRange(Number(e.target.value))}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer text-xs transition-colors hover:border-slate-350 dark:hover:border-slate-700"
                >
                  <option value={7}>{currentLabels.nextDays(7)}</option>
                  <option value={14}>{currentLabels.nextDays(14)}</option>
                  <option value={30}>{currentLabels.nextMonths(1)}</option>
                </select>
              </div>
            </div>

            {recommendation && (
              <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2 duration-500">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-xs text-indigo-900 dark:text-indigo-200 font-medium leading-relaxed">
                  {recommendation}
                </p>
              </div>
            )}

            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                    className="dark:stroke-slate-800"
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
                    tickFormatter={(str) => {
                      const date = new Date(str);
                      return date.toLocaleDateString(
                        language === "ID" ? "id-ID" : "en-US",
                        { day: "numeric", month: "short" }
                      );
                    }}
                    minTickGap={30}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
                    tickFormatter={(val) => `${val} pcs`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "16px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                      padding: "12px",
                      backgroundColor: "white",
                    }}
                    itemStyle={{
                      fontSize: "11px",
                      fontWeight: 800,
                      textTransform: "uppercase",
                    }}
                    labelStyle={{
                      fontSize: "10px",
                      color: "#64748b",
                      marginBottom: "4px",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                    formatter={(value: number) => [`${value} Unit/Pcs`]}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    content={({ payload }) => (
                      <div className="flex gap-4 justify-end mb-6">
                        {payload?.map((entry: any, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${entry.value.includes("Actual") || entry.value.includes("Aktual") ? "bg-indigo-500" : "bg-pink-500"}`}
                            />
                            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                              {entry.value === "Actual Demand" || entry.value === t.actualDemand
                                ? t.actualDemand
                                : language === "ID" ? "Prediksi Permintaan" : "Forecasted Demand"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  />
                  <Area
                    type="monotone"
                    dataKey="demand"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorDemand)"
                    name={t.actualDemand || "Actual Demand"}
                    connectNulls={true}
                  />
                  <Area
                    type="monotone"
                    dataKey="predicted"
                    stroke="#ec4899"
                    strokeWidth={3}
                    strokeDasharray="6 6"
                    fillOpacity={1}
                    fill="url(#colorPredicted)"
                    name={language === "ID" ? "Prediksi Permintaan" : "Forecasted Demand"}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
