import {
  ShieldAlert,
  TrendingUp,
  Boxes,
  Activity,
  Brain,
  Target,
  ArrowUpRight,
} from "lucide-react";
import { DashboardMetrics } from "../../../../types/dashboard";
import { useLanguageStore, translations } from "../../../../store/languageStore";

interface Props {
  metrics: DashboardMetrics | null;
  aiRecommendationsCount: number;
  criticalStockCount: number;
  isLoading: boolean;
}

export default function ExecutiveCommandLayer({
  metrics,
  aiRecommendationsCount,
  criticalStockCount,
  isLoading,
}: Props) {
  const { language } = useLanguageStore();
  const t = translations[language];

  if (isLoading || !metrics) {
    return (
      <div className="mb-6 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse transition-colors">
        <div className="h-6 w-1/3 bg-slate-100 dark:bg-slate-800 rounded mb-4"></div>
        <div className="flex gap-4">
          <div className="h-10 w-48 bg-slate-50 dark:bg-slate-800/50 rounded"></div>
          <div className="h-10 w-48 bg-slate-50 dark:bg-slate-800/50 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group transition-colors">
      {/* Background Subtle Gradient */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50/50 dark:bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none group-hover:bg-indigo-100/50 dark:group-hover:bg-indigo-500/10 transition-colors duration-700"></div>

      <div className="relative z-10">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
          {/* AI Operational Summary */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1.5 px-2 py-1 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-lg">
                <Brain className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-[10px] font-black tracking-widest text-indigo-700 dark:text-indigo-300 uppercase">
                  {t.aiStrategyBriefing}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-lg">
                <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[10px] font-black tracking-widest text-emerald-700 dark:text-emerald-300 uppercase">
                  {t.realtimeActive}
                </span>
              </div>
            </div>

            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3 leading-tight tracking-tight">
              {t.operationalPacing}{" "}
              <span className="text-indigo-600 dark:text-indigo-400">+{metrics.revenueGrowth}%</span>{" "}
              {t.vsForecast}.
            </h2>

            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed font-medium">
              {t.intelligenceEngine}{" "}
              <span className="text-slate-900 dark:text-white font-bold">
                {aiRecommendationsCount} {t.criticalInterventions}
              </span>
              . {t.revenueMomentum}{" "}
              <span className="text-orange-600 dark:text-orange-400 font-bold">
                {criticalStockCount} {t.highVelocityDepletion}
              </span>{" "}
              . {t.forecastConfidence} <span className="text-indigo-600 dark:text-indigo-400 font-bold">94.8%</span> {t.basedOnDemand}.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="flex flex-wrap gap-4 shrink-0">
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl p-4 min-w-[160px] transition-all hover:border-indigo-200 dark:hover:border-indigo-500/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md group/card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {t.revenuePacing}
                </p>
                <ArrowUpRight className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
              </div>
              <p className="text-xl font-black text-slate-900 dark:text-white leading-none">
                {t.strong}
              </p>
              <div className="mt-2 h-1 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[85%]" />
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl p-4 min-w-[160px] transition-all hover:border-orange-200 dark:hover:border-orange-500/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md group/card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {t.inventoryRisk}
                </p>
                <Boxes
                  className={`w-3 h-3 ${criticalStockCount > 0 ? "text-orange-500 dark:text-orange-400" : "text-emerald-500 dark:text-emerald-400"}`}
                />
              </div>
              <p className="text-xl font-black text-slate-900 dark:text-white leading-none">
                {criticalStockCount > 0 ? t.elevated : t.nominal}
              </p>
              <p className="mt-2 text-[10px] font-bold text-slate-400 dark:text-slate-500">
                {criticalStockCount} {t.criticalStock}
              </p>
            </div>

            <div className="bg-indigo-600 dark:bg-indigo-500 rounded-xl p-4 min-w-[160px] shadow-lg shadow-indigo-200 dark:shadow-indigo-500/20 transition-all hover:scale-[1.02]">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-wider">
                  {t.actionQueue}
                </p>
                <ShieldAlert className="w-3 h-3 text-white" />
              </div>
              <p className="text-xl font-black text-white leading-none">
                {aiRecommendationsCount} {t.actions}
              </p>
              <p className="mt-2 text-[10px] font-bold text-indigo-100">
                {t.awaitingReview}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Metrics */}
        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {t.globalOpsStatus}: {t.optimizing}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-3 h-3 text-slate-400 dark:text-slate-500" />
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {t.targetProgress}: 68.4%
            </span>
          </div>
          <div className="ml-auto hidden sm:block">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">
              {t.lastSync}: {language === "ID" ? "Baru Saja" : "Just Now"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
