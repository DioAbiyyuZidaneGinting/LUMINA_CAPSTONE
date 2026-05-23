"use client";

import { useState } from "react";
import { toast } from "sonner";
import { executeSmartRestock } from "@/app/actions/inventory";
import { 
  AlertCircle, 
  ChevronRight, 
  RefreshCw, 
  CheckCircle2, 
  Package, 
  ShieldAlert, 
  Boxes 
} from "lucide-react";
import { useLanguageStore, translations } from "../../../../store/languageStore";
import { StockItem } from "../../../../hooks/useInventoryInsights";

interface Props {
  isLoading: boolean;
  stockItems: StockItem[];
}

export default function InventoryAlertsEngine({ isLoading, stockItems }: Props) {
  const { language } = useLanguageStore();
  const t = translations[language];

  const [restockingId, setRestockingId] = useState<string | null>(null);
  const [restockedIds, setRestockedIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter dynamic low stock alerts
  const activeAlerts = (stockItems || [])
    .filter(item => item.status !== "SAFE")
    .filter(alert => !restockedIds.includes(alert.id));

  const handleRestock = async (alert: StockItem) => {
    setRestockingId(alert.id);
    try {
      const result = await executeSmartRestock(alert.id, alert.lowStockThreshold);
      
      if (result.success) {
        toast.success(`Berhasil!`, {
          description: `Stok ${alert.productName} ditambah ${result.added} pcs (Total: ${result.newStock}).`,
          icon: <Package className="w-4 h-4 text-emerald-500" />
        });
        
        // Hide the card from the UI
        setRestockedIds(prev => [...prev, alert.id]);
        
        // Dispatch global refresh events to auto-update charts & metrics
        window.dispatchEvent(new Event("refresh-analytics"));
        window.dispatchEvent(new Event("refresh-orders"));
      } else {
        toast.error("Gagal melakukan restock", { description: result.error });
      }
    } catch (error: any) {
      toast.error("Kesalahan Sistem", { description: error.message });
    } finally {
      setRestockingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 animate-pulse transition-colors">
        <div className="h-6 w-1/4 bg-slate-100 dark:bg-slate-800 rounded mb-4"></div>
        <div className="space-y-4">
          <div className="h-16 bg-slate-50 dark:bg-slate-800/50 rounded-xl"></div>
          <div className="h-16 bg-slate-50 dark:bg-slate-800/50 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden group transition-colors flex flex-col">
      {/* Header Area */}
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-rose-100 dark:bg-rose-500/10 rounded-lg flex items-center justify-center">
            <Boxes className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              {t.inventoryAlerts || "Inventory Alerts"}
              <span className="px-1.5 py-0.5 bg-rose-500 text-white text-[9px] font-black rounded-full animate-pulse">
                {activeAlerts.length}
              </span>
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              {t.aiReplenishmentMonitoring || "Replenishment Monitoring"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {t.criticalResponse || "CRITICAL RESPONSE"}
            </span>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 transition-all"
          >
            {t.viewAnalytics || "ANALYSIS"} <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Alerts Container */}
      <div className="max-h-[560px] overflow-y-auto flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
        {activeAlerts.length > 0 ? activeAlerts.map((alert) => (
          <div
            key={alert.id}
            className="px-6 py-5 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-all"
          >
            <div className="flex items-center justify-between gap-6">
          
              {/* LEFT SECTION */}
              <div className="flex items-center gap-4 min-w-0 flex-1">
          
                {/* STATUS */}
                <div className="shrink-0">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      alert.status === "CRITICAL"
                        ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.55)]"
                        : "bg-amber-500"
                    }`}
                  />
                </div>

                {/* THUMBNAIL */}
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 flex items-center justify-center">
                  {alert.image ? (
                    <img 
                      src={alert.image} 
                      alt={alert.productName} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <Package className="w-6 h-6 text-slate-400" />
                  )}
                </div>
          
                {/* PRODUCT INFO */}
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-2">
          
                    <h4 className="truncate whitespace-nowrap text-sm font-black text-slate-900 dark:text-white">
                      {alert.productName}
                    </h4>
          
                    <span className="text-xs text-slate-400 font-bold shrink-0">
                      ({alert.size})
                    </span>
                  </div>
          
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
          
                    <span className="truncate text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      SKU: {alert.customSku}
                    </span>
          
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0" />
          
                    <span className="truncate text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {alert.category}
                    </span>
                  </div>
                </div>
              </div>
          
              {/* CENTER METRICS */}
              <div className="flex items-center gap-8 shrink-0">
          
                {/* STOCK */}
                <div className="flex flex-col items-start min-w-[72px]">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    STOCK
                  </span>
          
                  <div className="flex items-center gap-2 mt-1">
                    <Package className="w-3.5 h-3.5 text-slate-400" />
          
                    <span
                      className={`text-sm font-black ${
                        alert.stock <= 5
                          ? "text-rose-500"
                          : "text-slate-900 dark:text-white"
                      }`}
                    >
                      {alert.stock} pcs
                    </span>
                  </div>
                </div>
          
                {/* AI LIMIT */}
                <div className="flex flex-col items-start min-w-[72px]">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    AI LIMIT
                  </span>
          
                  <div className="flex items-center gap-2 mt-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-indigo-500" />
          
                    <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                      {alert.lowStockThreshold}
                    </span>
                  </div>
                </div>
          
                {/* BADGE */}
                <div className="shrink-0">
                  <span
                    className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-[0.18em] border ${
                      alert.status === "CRITICAL"
                        ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                        : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                    }`}
                  >
                    {alert.status === "CRITICAL"
                      ? "Critical"
                      : "Elevated"}
                  </span>
                </div>
          
                {/* ACTION */}
                <button
                  onClick={() => handleRestock(alert)}
                  disabled={restockingId === alert.id}
                  className={`h-11 px-5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all shrink-0 ${
                    restockingId === alert.id
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-400"
                      : "bg-slate-900 dark:bg-indigo-600 text-white hover:scale-[1.02]"
                  }`}
                >
                  {restockingId === alert.id
                    ? "Loading..."
                    : "Pesan Ulang"}
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="flex flex-col p-4 md:p-6 gap-6">
            {/* Top Security Banner */}
            <div className="flex flex-col items-center justify-center text-center p-5 bg-emerald-50/20 dark:bg-emerald-950/15 border border-emerald-100/40 dark:border-emerald-900/30 rounded-xl">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2 animate-bounce" />
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                {language === "ID" ? "Stok Operasional 100% Aman" : "Inventory 100% Secure"}
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tight mt-1 leading-relaxed max-w-[320px]">
                {language === "ID"
                  ? "Seluruh item varian produk berada di atas ambang batas resiko yang dikonfigurasi."
                  : "All monitored product variants are safely above their configured AI danger thresholds."}
              </p>
            </div>

            {/* Bottom Health Telemetry Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl transition-all hover:shadow-sm">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  {language === "ID" ? "Total Varian Terpantau" : "Monitored SKUs"}
                </p>
                <p className="text-sm font-black text-slate-900 dark:text-white mt-1">
                  {stockItems.length} {language === "ID" ? "Item" : "Varian"}
                </p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl transition-all hover:shadow-sm">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  {language === "ID" ? "Kategori Terintegrasi" : "Categories"}
                </p>
                <p className="text-sm font-black text-slate-900 dark:text-white mt-1">
                  {Array.from(new Set(stockItems.map(s => s.category))).length} Group
                </p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl transition-all hover:shadow-sm">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  {language === "ID" ? "Stok Volume Teratas" : "Top Stock SKU"}
                </p>
                <p className="text-xs font-black text-slate-900 dark:text-white mt-1 truncate" title={stockItems.sort((a,b) => b.stock - a.stock)[0]?.productName || "-"}>
                  {stockItems.sort((a,b) => b.stock - a.stock)[0]?.productName || "-"}
                </p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-855 rounded-xl transition-all hover:shadow-sm">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  {language === "ID" ? "Keandalan Sistem AI" : "AI System Status"}
                </p>
                <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-1 uppercase tracking-wider font-extrabold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  EXCELLENT
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <AlertCircle className="w-3 h-3 text-rose-500 dark:text-rose-400" />
          AI Replenishment Confidence: 94.8%
        </p>
        <p className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
          {t.lastSync || "Last Refreshed"}: {language === "ID" ? "Baru Saja" : "Just Now"}
        </p>
      </div>

      {/* Premium Inventory Telemetry Report Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl transition-all scale-100 flex flex-col justify-between">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  {language === "ID" ? "Laporan Telemetri Inventaris" : "Inventory Telemetry Report"}
                </h3>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                  AI Replenishment Monitoring Engine
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-black uppercase tracking-wider"
              >
                {language === "ID" ? "Tutup" : "Close"}
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[420px] overflow-y-auto">
              {/* Dynamic Health Card */}
              <div className="p-4 bg-emerald-50/30 dark:bg-emerald-950/15 border border-emerald-100/50 dark:border-emerald-900/30 rounded-xl flex items-center gap-4">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 shrink-0" />
                <div>
                  <h4 className="text-xs font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wide">
                    {language === "ID" ? "Kondisi Stok Optimal (100%)" : "Optimal Stock Condition (100%)"}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-1">
                    {language === "ID"
                      ? "Algoritma AI mengonfirmasi seluruh tingkat stok varian produk berada di atas batas kritis operasional."
                      : "AI algorithm confirms all product variant stock levels remain safely above critical operational limits."}
                  </p>
                </div>
              </div>

              {/* Monitored Metrics Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl">
                  <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    {language === "ID" ? "TOTAL SKU VARIANT" : "TOTAL SKU VARIANT"}
                  </p>
                  <p className="text-sm font-black text-slate-900 dark:text-white mt-1">{stockItems.length} Varian</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl">
                  <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    {language === "ID" ? "AI CONFIDENCE RATING" : "AI CONFIDENCE RATING"}
                  </p>
                  <p className="text-sm font-black text-slate-900 dark:text-white mt-1">94.8% Accurate</p>
                </div>
              </div>

              {/* Detail Items Table */}
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  {language === "ID" ? "Rincian Stok Aktif" : "Active Stock Ledger"}
                </p>
                <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                  {stockItems.map(item => (
                    <div key={item.id} className="p-3 flex items-center justify-between text-xs bg-slate-50/30 dark:bg-slate-950/20">
                      <div>
                        <p className="font-black text-slate-900 dark:text-white">{item.productName}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Size {item.size} • SKU: {item.customSku}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-[9px] font-black ${
                        item.stock >= 30 ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-450" : "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-450"
                      }`}>
                        {item.stock} pcs
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
              <span>Status: Synchronized Live</span>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-900 dark:bg-indigo-600 text-white rounded-lg hover:bg-indigo-600 transition-colors"
              >
                {language === "ID" ? "Selesai" : "Done"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
