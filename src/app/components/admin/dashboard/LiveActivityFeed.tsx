"use client";

import { Activity, Package, ShoppingBag, Brain, MapPin } from "lucide-react";
import { RealtimeEvent } from "../../../../types/dashboard";
import { useState } from "react";
import { useLanguageStore, translations } from "../../../../store/languageStore";
import { useFormatCurrency } from "../../../../hooks/useFormatCurrency";

interface Props {
  events: RealtimeEvent[];
  isLoading: boolean;
}

export default function LiveActivityFeed({ events, isLoading }: Props) {
  const { language } = useLanguageStore();
  const { format } = useFormatCurrency();
  const t = translations[language];

  const [filter, setFilter] = useState<string>("ALL");
  const C =
    "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl flex flex-col h-[500px] transition-colors";

  if (isLoading) {
    return (
      <div className={`${C} p-5`}>
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mb-6 animate-pulse"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-3/4 animate-pulse"></div>
                <div className="h-2 bg-slate-100 dark:bg-slate-900 rounded w-1/2 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const renderIcon = (type: string) => {
    switch (type) {
      case "ORDER":
        return <ShoppingBag className="w-3.5 h-3.5 text-emerald-500" />;
      case "INVENTORY":
        return <Package className="w-3.5 h-3.5 text-amber-500" />;
      case "AI_PREDICTION":
        return <Brain className="w-3.5 h-3.5 text-indigo-500" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case "ORDER":
        return "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20";
      case "INVENTORY":
        return "bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20";
      case "AI_PREDICTION":
        return "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20";
      default:
        return "bg-slate-50 dark:bg-slate-500/10 border-slate-100 dark:border-slate-500/20";
    }
  };

  const eventList = events || [];
  const filteredEvents =
    filter === "ALL" ? eventList : eventList.filter((e) => e.type === filter);

  return (
    <div className={C}>
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
        <div>
          <h3 className="text-slate-900 dark:text-white font-bold tracking-tight text-lg">
            {t.activityStream}
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">
            {t.liveEvents}
          </p>
        </div>
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          {["ALL", "ORDER", "INVENTORY", "AI_PREDICTION"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${filter === f ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}`}
            >
              {f === "AI_PREDICTION" ? "AI" : (f === "ALL" ? (language === "ID" ? "SEMUA" : "ALL") : (f === "ORDER" ? (language === "ID" ? "PESANAN" : "ORDER") : (f === "INVENTORY" ? (language === "ID" ? "STOK" : "INVENTORY") : f)))}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 relative custom-scrollbar">
        <div className="absolute left-9 top-5 bottom-5 w-px bg-slate-100 dark:bg-slate-800 -z-10"></div>
        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">
              {language === "ID" ? "Tidak ada aktivitas di kategori ini." : "No events in this category."}
            </p>
          ) : (
            filteredEvents.map((event, i) => (
              <div key={i} className="flex gap-4 group">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border shrink-0 relative z-10 ${getBgColor(event.type)}`}
                >
                  {renderIcon(event.type)}
                </div>

                <div className="flex-1 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 group-hover:border-slate-200 dark:group-hover:border-slate-600 transition-colors p-3 rounded-xl shadow-sm">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight pr-4">
                      {event.message}
                    </p>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap pt-0.5">
                      {new Date(event.timestamp).toLocaleTimeString(language === "ID" ? "id-ID" : "en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                  </div>

                  {event.metadata && (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {event.metadata.amount && (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          +{format(event.metadata.amount)}
                        </span>
                      )}
                      {event.metadata.location && (
                        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{" "}
                          {event.metadata.location}
                        </span>
                      )}
                      {event.metadata.confidence && (
                        <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Brain className="w-3 h-3" /> Conf:{" "}
                          {event.metadata.confidence}%
                        </span>
                      )}
                      {event.metadata.sku && (
                        <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full">
                          SKU: {event.metadata.sku}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="border-t border-slate-100 dark:border-slate-800 p-3 text-center">
        <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
          {t.viewAllActivity}
        </button>
      </div>
    </div>
  );
}
