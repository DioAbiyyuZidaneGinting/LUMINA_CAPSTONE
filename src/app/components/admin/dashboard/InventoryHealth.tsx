import { Package, Brain } from "lucide-react";
import { useLanguageStore, translations } from "../../../../store/languageStore";
import { InventoryRisk } from "../../../../types/dashboard";

interface Props {
  risks: InventoryRisk[];
  healthScore: number;
  isLoading: boolean;
}

export default function InventoryHealth({ risks, healthScore, isLoading }: Props) {
  const { language } = useLanguageStore();
  const t = translations[language];

  const C = "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl p-5 transition-colors";

  if (isLoading) {
    return (
      <div className={C}>
        <div className="h-6 w-1/3 bg-slate-200 dark:bg-slate-800 rounded mb-4 animate-pulse"></div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={C}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-slate-900 dark:text-white font-bold tracking-tight">{t.inventoryHealth}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{t.aiVelocityDepletion}</p>
        </div>
        <Package className="w-4 h-4 text-orange-500 dark:text-orange-400"/>
      </div>
      
      <div className="space-y-2.5 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
        {risks.slice(0, 10).map((item, i) => {
          const urgency = item.status === "CRITICAL"
            ? "text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-500/10 dark:border-red-500/20"
            : item.status === "WARNING"
            ? "text-orange-700 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-500/10 dark:border-orange-500/20"
            : "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20";
            
          return (
            <div key={item.productId || i} className="flex items-center justify-between p-3 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{item.productName}</p>
                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">{t.currentStock}: {item.stock} unit • {item.velocity}/{language === "ID" ? "hari" : "day"}</p>
              </div>
              <div className={`text-center px-2.5 py-1.5 rounded-lg border ${urgency}`}>
                <p className="text-sm font-bold">{item.daysLeft}</p>
                <p className="text-[9px] font-semibold">{language === "ID" ? "hari" : "days"}</p>
              </div>
            </div>
          );
        })}
        {risks.length === 0 && (
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-4">{t.safeStatus}</p>
        )}
      </div>
      
      <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{t.healthScore}</span>
          <Brain className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400"/>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-1000" style={{ width:`${healthScore}%`, background:"linear-gradient(to right,#ef4444, #f59e0b,#10b981)" }}/>
          </div>
          <span className="text-lg font-bold text-slate-900 dark:text-white">{healthScore}<span className="text-xs text-slate-400 dark:text-slate-500 font-medium">/100</span></span>
        </div>
      </div>
    </div>
  );
}
