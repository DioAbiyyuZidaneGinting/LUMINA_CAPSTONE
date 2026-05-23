import { Brain, Sparkles, RefreshCw, ChevronDown, CheckCircle2, DollarSign, Activity } from "lucide-react";
import { AIRecommendation } from "../../../../types/dashboard";
import { useState } from "react";
import { useLanguageStore, translations } from "../../../../store/languageStore";
import { useFormatCurrency } from "../../../../hooks/useFormatCurrency";

interface Props {
  recommendations: AIRecommendation[];
  isLoading: boolean;
  onRefresh: () => void;
  lastRefreshed: Date | null;
}

const PRIORITY_CONFIG: Record<string, { bg: string; border: string; badge: string; label: string; icon: string }> = {
  CRITICAL: { bg: "bg-red-50/50 dark:bg-red-500/5", border: "border-red-200 dark:border-red-500/20", badge: "bg-red-500 text-white shadow-sm", label: "CRITICAL", icon: "🚨" },
  HIGH: { bg: "bg-orange-50/50 dark:bg-orange-500/5", border: "border-orange-200 dark:border-orange-500/20", badge: "bg-orange-500 text-white shadow-sm", label: "HIGH", icon: "⚠️" },
  MEDIUM: { bg: "bg-amber-50/50 dark:bg-amber-500/5", border: "border-amber-200 dark:border-amber-500/20", badge: "bg-amber-500 text-white shadow-sm", label: "MEDIUM", icon: "👀" },
  LOW: { bg: "bg-slate-50 dark:bg-slate-800/50", border: "border-slate-200 dark:border-slate-800", badge: "bg-slate-500 text-white shadow-sm", label: "LOW", icon: "💡" },
};

export default function AiActionCenter({ recommendations, isLoading, onRefresh, lastRefreshed }: Props) {
  const { language } = useLanguageStore();
  const { format } = useFormatCurrency();
  const t = translations[language];

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [approvedIds, setApprovedIds] = useState<string[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const C = "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl flex flex-col h-[500px] transition-colors overflow-hidden";

  const handleRefresh = () => {
    setIsSyncing(true);
    onRefresh();
    setTimeout(() => {
      setIsSyncing(false);
    }, 1500);
  };

  const handleApprove = (id: string) => {
    setApprovingId(id);
    setTimeout(() => {
      setApprovingId(null);
      setApprovedIds(prev => [...prev, id]);
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className={`${C} p-5`}>
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mb-4 animate-pulse"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const activeRecommendations = recommendations.filter(rec => !approvedIds.includes(rec.id));

  return (
    <div className={C}>
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 rounded-t-2xl shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-slate-900 dark:text-white font-bold tracking-tight text-lg">{t.aiActionQueue}</h3>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs">{t.autonomousWorkflow}</p>
        </div>
        
        <div className="flex flex-col items-end">
          <button 
            onClick={handleRefresh}
            disabled={isSyncing}
            className={`flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white text-xs font-semibold rounded-lg transition-all shadow-sm ${
              isSyncing ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-indigo-600 dark:text-indigo-400" : ""}`} />
            {isSyncing ? (language === "ID" ? "Menyinkronkan..." : "Syncing...") : t.forceSync}
          </button>
          {lastRefreshed && (
             <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 font-medium">{t.lastSync}: {lastRefreshed.toLocaleTimeString(language === "ID" ? "id-ID" : "en-US")}</span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
        {activeRecommendations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <Sparkles className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-3" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No active alerts detected</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">System operational state is nominal.</p>
          </div>
        ) : (
          activeRecommendations.map((rec, i) => (
            <div key={rec.id || i} className={`rounded-xl border transition-all ${PRIORITY_CONFIG[rec.severity].bg} ${PRIORITY_CONFIG[rec.severity].border} ${expandedId === (rec.id || i.toString()) ? "shadow-md" : "hover:shadow-sm"}`}>
              
              <div 
                className="p-4 cursor-pointer flex items-start gap-4"
                onClick={() => setExpandedId(expandedId === (rec.id || i.toString()) ? null : (rec.id || i.toString()))}
              >
                <div className="shrink-0 pt-0.5">
                  <span className={`text-[9px] font-black tracking-widest px-2 py-1 rounded uppercase ${PRIORITY_CONFIG[rec.severity].badge}`}>
                    {PRIORITY_CONFIG[rec.severity].icon} {PRIORITY_CONFIG[rec.severity].label}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{rec.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">{t.affected}: {rec.affectedProducts?.join(", ") || (language === "ID" ? "Operasi Umum" : "General Operations")}</p>
                </div>
                <div className="shrink-0 text-right hidden sm:block">
                  <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">{t.estImpact}</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {typeof rec.estimatedImpact === 'number' ? format(rec.estimatedImpact) : rec.estimatedImpact}
                  </p>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform mt-1 shrink-0 ${expandedId === (rec.id || i.toString()) ? "rotate-180" : ""}`} />
              </div>

              {expandedId === (rec.id || i.toString()) && (
                <div className="px-4 pb-4 border-t border-slate-200/50 dark:border-slate-800/50 pt-4 bg-white/50 dark:bg-slate-900/50 rounded-b-xl">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="md:col-span-2 space-y-3">
                      <div>
                        <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                          <Brain className="w-3 h-3 text-indigo-500 dark:text-indigo-400" /> AI Reasoning Lineage
                        </h5>
                        <ul className="space-y-1.5 pl-4 border-l-2 border-indigo-100 dark:border-indigo-900">
                          {rec.reasoning.map((reason, idx) => (
                            <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed relative">
                              <span className="absolute -left-[21px] top-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 dark:bg-indigo-600"></span>
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 shadow-sm">
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Metrics Trace</span>
                        <Activity className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-600 dark:text-slate-400">Model Confidence</span>
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{rec.confidence}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-600 dark:text-slate-400">Data Freshness</span>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">Live</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-3 border-t border-slate-200/50 dark:border-slate-800/50">
                    <button 
                      onClick={() => handleApprove(rec.id)}
                      disabled={approvingId === rec.id}
                      className={`flex-1 text-white text-xs font-bold py-2 px-4 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 ${
                        approvingId === rec.id 
                          ? "bg-slate-400 dark:bg-slate-600 cursor-not-allowed" 
                          : "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 shadow-indigo-600/20"
                      }`}
                    >
                      {approvingId === rec.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      {approvingId === rec.id ? (language === "ID" ? "Menjalankan..." : "Executing Workflow...") : (language === "ID" ? "Setujui Eksekusi" : "Approve Execution")}
                    </button>
                    <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white text-xs font-bold rounded-lg transition-colors">
                      Simulate What-If
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
