"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { CheckCircle, Clock, MapPin } from "lucide-react";
import { useLanguageStore, translations } from "../../../../store/languageStore";
import { useFormatCurrency } from "../../../../hooks/useFormatCurrency";

const ADMIN_TASKS = [
  { id: 1, task: "Restock Hoodie Oversize", status: "Urgent", type: "inventory", time: "2h ago" },
  { id: 2, task: "Review Promo Gajian", status: "Warning", type: "marketing", time: "5h ago" },
  { id: 3, task: "Sync Supabase Storage", status: "Success", type: "system", time: "1d ago" },
  { id: 4, task: "Update Shipping Rates", status: "Info", type: "logistics", time: "1d ago" },
];

const REGION_DATA = [
  { name: "Jabodetabek", value: 650000000, percentage: 45 },
  { name: "Jawa Barat", value: 320000000, percentage: 22 },
  { name: "Jawa Timur", value: 245000000, percentage: 17 },
  { name: "Luar Jawa", value: 230000000, percentage: 16 },
];

export default function AdminProductivityPanel({ isLoading }: { isLoading?: boolean }) {
  const { language } = useLanguageStore();
  const { format } = useFormatCurrency();
  const t = translations[language];

  if (isLoading) {
    return (
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm animate-pulse transition-colors">
        <div className="h-[400px] bg-slate-50 dark:bg-slate-800/50 rounded-xl"></div>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 transition-colors h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          {t.operationalProductivity}
        </CardTitle>
        <CardDescription className="text-slate-500 dark:text-slate-400 text-xs">{t.adminTasks}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Task List */}
        <div className="mt-4">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">{t.priorityTasks}</p>
          <div className="space-y-2">
            {ADMIN_TASKS.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className={`w-1.5 h-6 rounded-full ${
                    task.status === "Urgent" ? "bg-red-500" : 
                    task.status === "Warning" ? "bg-amber-500" : 
                    task.status === "Success" ? "bg-emerald-500" : "bg-blue-500"
                  }`} />
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{task.task}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {task.time.replace("h ago", language === "ID" ? " jam lalu" : "h ago").replace("1d ago", language === "ID" ? "kemarin" : "1d ago")}
                    </p>
                  </div>
                </div>
                <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                  task.status === "Urgent" ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400" : 
                  task.status === "Warning" ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400" : 
                  task.status === "Success" ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                }`}>
                  {task.status === "Urgent" ? (language === "ID" ? "MENDESAK" : "URGENT") : 
                   task.status === "Warning" ? (language === "ID" ? "PERINGATAN" : "WARNING") : 
                   task.status === "Success" ? (language === "ID" ? "BERHASIL" : "SUCCESS") : task.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Regional Performance */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <MapPin className="w-3 h-3 text-indigo-500 dark:text-indigo-400" /> {t.topRegions}
          </p>
          <div className="space-y-4">
            {REGION_DATA.map((region, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-bold text-slate-700 dark:text-slate-300">{region.name}</span>
                  <span className="font-black text-slate-900 dark:text-white">{region.percentage}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden transition-colors">
                  <div 
                    className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${region.percentage}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 text-right font-medium">
                  {format(region.value)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
