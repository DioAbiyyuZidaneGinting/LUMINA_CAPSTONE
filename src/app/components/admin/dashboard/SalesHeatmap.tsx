"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Activity } from "lucide-react";
import { useLanguageStore, translations } from "../../../../store/languageStore";

const HEATMAP_DATA = [
  { day: "Mon", data: [12, 18, 34, 56, 42, 28, 15] },
  { day: "Tue", data: [15, 22, 38, 62, 48, 32, 18] },
  { day: "Wed", data: [14, 20, 36, 58, 45, 30, 16] },
  { day: "Thu", data: [18, 25, 42, 68, 52, 35, 20] },
  { day: "Fri", data: [25, 35, 55, 85, 65, 45, 25] },
  { day: "Sat", data: [40, 60, 85, 120, 95, 70, 45] },
  { day: "Sun", data: [35, 55, 80, 110, 85, 65, 40] },
];

const TIME_SLOTS = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];

export default function SalesHeatmap({ isLoading }: { isLoading?: boolean }) {
  const { language } = useLanguageStore();
  const t = translations[language];

  if (isLoading) {
    return (
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm animate-pulse transition-colors">
        <div className="h-[280px] bg-slate-50 dark:bg-slate-800/50 rounded-xl"></div>
      </Card>
    );
  }

  const getColor = (value: number) => {
    if (value > 100) return "bg-indigo-600 dark:bg-indigo-500";
    if (value > 80) return "bg-indigo-500 dark:bg-indigo-600";
    if (value > 60) return "bg-indigo-400 dark:bg-indigo-700";
    if (value > 40) return "bg-indigo-300 dark:bg-indigo-800";
    if (value > 20) return "bg-indigo-200 dark:bg-indigo-900/50";
    return "bg-indigo-50 dark:bg-slate-800";
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 transition-colors">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
          <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          {t.salesIntensityHeatmap}
        </CardTitle>
        <CardDescription className="text-slate-500 dark:text-slate-400 text-xs">{t.transactionActivity}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mt-4 overflow-x-auto custom-scrollbar">
          <div className="min-w-[400px]">
            <div className="flex mb-2">
              <div className="w-10"></div>
              {TIME_SLOTS.map((slot, i) => (
                <div key={i} className="flex-1 text-[10px] text-slate-400 dark:text-slate-500 text-center font-medium">{slot}</div>
              ))}
            </div>
            {HEATMAP_DATA.map((row, i) => (
              <div key={i} className="flex items-center mb-1.5 h-7">
                <div className="w-10 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  {language === "ID" ? (row.day === "Mon" ? "Sen" : row.day === "Tue" ? "Sel" : row.day === "Wed" ? "Rab" : row.day === "Thu" ? "Kam" : row.day === "Fri" ? "Jum" : row.day === "Sat" ? "Sab" : "Min") : row.day}
                </div>
                {row.data.map((cell, j) => (
                  <div 
                    key={j} 
                    className={`flex-1 h-full mx-0.5 rounded-sm cursor-help transition-all hover:scale-110 hover:shadow-md ${getColor(cell)} border dark:border-slate-800/50`}
                    title={`${row.day} ${TIME_SLOTS[j]}: ${cell} ${language === "ID" ? "pesanan" : "orders"}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">{language === "ID" ? "Intensitas" : "Intensity"}:</span>
          <div className="flex gap-1 items-center">
            <span className="text-[10px] text-slate-400 dark:text-slate-500">{language === "ID" ? "Rendah" : "Low"}</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-indigo-50 dark:bg-slate-800 rounded-sm" />
              <div className="w-3 h-3 bg-indigo-200 dark:bg-indigo-900/50 rounded-sm" />
              <div className="w-3 h-3 bg-indigo-400 dark:bg-indigo-700 rounded-sm" />
              <div className="w-3 h-3 bg-indigo-600 dark:bg-indigo-500 rounded-sm" />
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">{language === "ID" ? "Tinggi" : "High"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
