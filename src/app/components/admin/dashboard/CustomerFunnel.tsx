"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Filter, EyeOff, Clock } from "lucide-react";
import { useLanguageStore, translations } from "../../../../store/languageStore";
import { useCustomerFunnel } from "../../../../hooks/useCustomerFunnel";

export default function CustomerFunnel({ isLoading: isParentLoading }: { isLoading?: boolean }) {
  const { language } = useLanguageStore();
  const t = translations[language];
  const [timeFilter, setTimeFilter] = useState<'24h' | '7d' | '30d' | 'all'>('30d');

  const { loading: isFunnelLoading, hasTelemetry, metrics } = useCustomerFunnel(timeFilter);

  const isLoading = isParentLoading || isFunnelLoading;

  if (isLoading) {
    return (
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm animate-pulse h-full min-h-[460px]">
        <div className="h-full bg-slate-50 dark:bg-slate-800/50 rounded-xl min-h-[440px]"></div>
      </Card>
    );
  }

  const FUNNEL_STAGES = [
    { 
      name: "Total Visitors", 
      value: metrics.totalVisitors, 
      width: "100%", 
      color: "bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200",
      valueColor: "text-slate-900 dark:text-white"
    },
    { 
      name: "Product Views", 
      value: metrics.productViews, 
      width: "88%", 
      color: "bg-[#cbd5e1] dark:bg-slate-700/80 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100",
      valueColor: "text-slate-900 dark:text-white"
    },
    { 
      name: "Add to Cart", 
      value: metrics.addToCart, 
      width: "76%", 
      color: "bg-[#94a3b8] dark:bg-slate-600/90 border-slate-400 dark:border-slate-500 text-slate-900 dark:text-white",
      valueColor: "text-slate-950 dark:text-white"
    },
    { 
      name: "Checkout", 
      value: metrics.checkoutStarts, 
      width: "64%", 
      color: "bg-[#475569] dark:bg-indigo-900/80 border-slate-600 dark:border-indigo-700 text-slate-200 dark:text-white",
      valueColor: "text-white"
    },
    { 
      name: "Successful Payment", 
      value: metrics.successfulPurchases, 
      width: "52%", 
      color: "bg-[#0f172a] dark:bg-blue-600 border-[#0f172a] dark:border-blue-500 text-slate-200 dark:text-white",
      valueColor: "text-white"
    },
  ];

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 transition-colors h-full flex flex-col justify-between min-h-[500px] relative overflow-hidden">
      <CardHeader className="pb-0 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-950 dark:text-white">
            <Filter className="w-4 h-4 text-slate-500" />
            {t.conversionFunnel || "Intelijen Corong Konversi"}
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            {t.customerJourneyAnalysis || "Analisis perjalanan pelanggan & penurunan"}
          </CardDescription>
        </div>
        
        {/* Time Filter Dropdown */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
          <Clock className="w-3.5 h-3.5 text-slate-500 ml-2" />
          <select 
            className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none pr-2 py-1 cursor-pointer"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as any)}
          >
            <option value="24h">24 Jam Terakhir</option>
            <option value="7d">7 Hari Terakhir</option>
            <option value="30d">30 Hari Terakhir</option>
            <option value="all">Semua Waktu</option>
          </select>
        </div>
      </CardHeader>
      
      <CardContent className="relative flex-1 flex flex-col justify-between pt-8 pb-6 px-6 lg:px-8">
        
        {/* Centered Progressive Visual Funnel */}
        <div className={`flex flex-col items-center w-full transition-all ${!hasTelemetry ? 'blur-[3px] opacity-30 select-none pointer-events-none' : ''}`}>
          {FUNNEL_STAGES.map((item, i) => {
            const dropoff = i > 0 && FUNNEL_STAGES[i-1].value > 0 
              ? Math.round(((FUNNEL_STAGES[i-1].value - item.value) / FUNNEL_STAGES[i-1].value) * 100) 
              : 0;

            return (
              <div key={i} className="w-full flex flex-col items-center">
                {/* Dropoff Badge Between Stages */}
                {i > 0 && (
                  <div className="flex items-center justify-center py-2 relative">
                    <div className="bg-rose-50 dark:bg-rose-950 border border-rose-100 dark:border-rose-900 rounded-full px-3 py-0.5 shadow-sm">
                      <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 tracking-wide">
                        -{dropoff}% {language === "ID" ? "Penurunan" : "Dropoff"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Funnel Stage Block */}
                <div 
                  className={`h-11 rounded-xl flex items-center justify-between px-5 transition-all duration-500 shadow-[0_2px_10px_rgba(0,0,0,0.04)] relative overflow-hidden ${item.color}`}
                  style={{ width: item.width }}
                >
                  <span className="text-xs font-bold truncate pr-2 z-10">
                    {item.name === "Total Visitors" ? (language === "ID" ? "Total Pengunjung" : "Total Visitors") : 
                     item.name === "Product Views" ? (language === "ID" ? "Tampilan Produk" : "Product Views") : 
                     item.name === "Add to Cart" ? (language === "ID" ? "Tambah ke Keranjang..." : "Add to Cart...") : 
                     item.name === "Checkout" ? (language === "ID" ? "Checkout" : "Checkout") : 
                     item.name === "Successful Payment" ? (language === "ID" ? "Pembayaran Berhasil" : "Successful Payment") : item.name}
                  </span>
                  <span className={`text-sm font-black z-10 ${item.valueColor}`}>
                    {item.value.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic, High-Fidelity Professional Notice Overlay (Only if NO telemetry table) */}
        {!hasTelemetry && (
          <div className="absolute inset-0 bg-white/70 dark:bg-slate-950/80 backdrop-blur-[3px] flex flex-col items-center justify-center p-6 text-center z-10">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 rounded-2xl flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
              <EyeOff className="w-6 h-6 animate-pulse" />
            </div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              {language === "ID" ? "Telemetri Konversi Belum Aktif" : "Telemetry Conversion Inactive"}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-[340px]">
              {language === "ID" 
                ? "Sistem saat ini mencatat transaksi manual dari Admin Panel. Data corong konversi pengunjung storefront akan tersedia secara real-time setelah integrasi pelacakan piksel (storefront tracking engine) selesai dikonfigurasi."
                : "The platform currently logs manual transaction inputs from the Admin Panel. Storefront customer journey telemetry will become active once storefront web tracker pixels are fully integrated."}
            </p>
          </div>
        )}

        {/* Bottom Metrics Cards */}
        <div className={`mt-10 grid grid-cols-2 gap-4 transition-all ${!hasTelemetry ? 'blur-[2px] opacity-30 select-none pointer-events-none' : ''}`}>
          <div className="p-4 bg-[#f8faff] dark:bg-slate-900 rounded-2xl border border-indigo-100 dark:border-slate-800 flex flex-col justify-center shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <p className="text-[10px] font-black text-indigo-600 dark:text-slate-500 uppercase tracking-widest">{t.overallCr || "CR KESELURUHAN"}</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{metrics.overallCr}</p>
            <p className="text-[9px] font-medium text-indigo-400 mt-1">+1.4% dari rata-rata</p>
          </div>
          <div className="p-4 bg-white dark:bg-rose-950/20 rounded-2xl border border-slate-100 dark:border-rose-900/50 flex flex-col justify-center shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.cartAbandonment || "PENGABAIAN KERANJANG"}</p>
            <p className="text-2xl font-black text-slate-900 dark:text-rose-500 mt-1">{metrics.cartAbandonment}</p>
            <p className="text-[9px] font-medium text-slate-400 mt-1">Perhatian kritis diperlukan.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
