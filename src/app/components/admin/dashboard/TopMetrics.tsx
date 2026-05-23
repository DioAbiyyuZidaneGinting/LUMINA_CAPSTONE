import { TrendingUp, AlertCircle, ShoppingCart, CreditCard, ArrowUpRight, ArrowDownRight, Minus, BarChart2 } from "lucide-react";
import { DashboardMetrics } from "../../../../types/dashboard";
import { useLanguageStore, translations } from "../../../../store/languageStore";
import { useFormatCurrency } from "../../../../hooks/useFormatCurrency";

interface Props {
  metrics: DashboardMetrics | null;
  isLoading: boolean;
  stockAlertsCount: number;
}

export default function TopMetrics({ metrics, isLoading, stockAlertsCount }: Props) {
  const { language } = useLanguageStore();
  const { format } = useFormatCurrency();
  const t = translations[language];

  const C = "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl";

  if (isLoading || !metrics) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`${C} p-4 animate-pulse`}>
            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/2 mb-3"></div>
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  const kpis = [
    { label: t.totalRevenue, value: format(metrics.totalRevenue), vs: metrics.revenueGrowth, icon: <TrendingUp className="w-4 h-4"/>, accent: "indigo", interpretation: t.trendingAboveAvg },
    { label: t.netIncome, value: format(metrics.netIncome), vs: metrics.netIncomeGrowth, icon: <BarChart2 className="w-4 h-4"/>, accent: "emerald", interpretation: t.healthyMargin },
    { label: t.totalOrders, value: metrics.totalOrders.toLocaleString(language === "ID" ? "id-ID" : "en-US"), vs: metrics.ordersGrowth, icon: <ShoppingCart className="w-4 h-4"/>, accent: "violet", anomaly: metrics.ordersGrowth < -10 },
    { label: t.avgOrderValue, value: format(metrics.avgOrderValue), vs: metrics.aovGrowth, icon: <CreditCard className="w-4 h-4"/>, accent: "sky", interpretation: t.stagnantVsLastMonth },
    { label: t.criticalStock, value: stockAlertsCount.toString(), isAlert: true, icon: <AlertCircle className="w-4 h-4"/>, accent: "red", interpretation: t.restockActionRequired },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
      {kpis.map((kpi, i) => {
        const colorMap: Record<string, string> = { 
          sky: "text-sky-600 dark:text-sky-400", 
          emerald: "text-emerald-600 dark:text-emerald-400", 
          violet: "text-violet-600 dark:text-violet-400", 
          indigo: "text-indigo-600 dark:text-indigo-400", 
          red: "text-red-600 dark:text-red-400" 
        };
        const bgMap: Record<string, string> = { 
          sky: "bg-sky-50 dark:bg-sky-500/10 border-sky-100 dark:border-sky-500/20", 
          emerald: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20", 
          violet: "bg-violet-50 dark:bg-violet-500/10 border-violet-100 dark:border-violet-500/20", 
          indigo: "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20", 
          red: "bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20" 
        };
        return (
          <div key={i} className={`${C} p-5 relative overflow-hidden transition-all hover:shadow-md flex flex-col justify-between group`}>
            {kpi.anomaly && (
               <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full m-3 animate-pulse" title="AI Anomaly Detected"></div>
            )}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-2 rounded-lg border ${bgMap[kpi.accent]} ${colorMap[kpi.accent]}`}>
                  {kpi.icon}
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{kpi.label}</p>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">{kpi.value}</p>
            </div>
            
            <div className="mt-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              {!kpi.isAlert && kpi.vs !== undefined ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {kpi.vs > 0 ? <ArrowUpRight className="w-4 h-4 text-emerald-500" /> : kpi.vs < 0 ? <ArrowDownRight className="w-4 h-4 text-red-500" /> : <Minus className="w-4 h-4 text-slate-400" />}
                    <span className={`text-[11px] font-bold ${kpi.vs > 0 ? "text-emerald-600" : kpi.vs < 0 ? "text-red-600" : "text-slate-500"}`}>{kpi.vs > 0 ? "+" : ""}{kpi.vs}%</span>
                  </div>
                  {kpi.interpretation && (
                    <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 max-w-[100px] text-right truncate group-hover:text-clip">{kpi.interpretation}</span>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-[11px] text-red-600 font-bold uppercase tracking-wider">{t.actions}</span>
                  </div>
                  {kpi.interpretation && (
                    <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 max-w-[100px] text-right truncate">{kpi.interpretation}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
