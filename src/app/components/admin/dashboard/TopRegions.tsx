"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { MapPin, ArrowUpRight } from "lucide-react";
import { useLanguageStore, translations } from "../../../../store/languageStore";
import { useFormatCurrency } from "../../../../hooks/useFormatCurrency";

const REGIONS = [
  { name: "DKI Jakarta", revenue: 450000000, percentage: 35, growth: "+12%" },
  { name: "Jawa Barat", revenue: 320000000, percentage: 25, growth: "+8%" },
  { name: "Jawa Timur", revenue: 180000000, percentage: 15, growth: "+5%" },
  { name: "Bali", revenue: 120000000, percentage: 8, growth: "+2%" },
  { name: "Sumatera Utara", revenue: 95000000, percentage: 5, growth: "+4%" },
];

export default function TopRegions({ isLoading }: { isLoading?: boolean }) {
  const { language } = useLanguageStore();
  const { format } = useFormatCurrency();
  const t = translations[language];

  if (isLoading) {
    return (
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm animate-pulse">
        <div className="h-[320px] bg-slate-50 dark:bg-slate-800/50 rounded-xl"></div>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 transition-colors overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
          <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          {t.topRegions}
        </CardTitle>
        <CardDescription className="text-slate-500 dark:text-slate-400 text-xs">{t.territoryDistribution}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-5 mt-4">
          {REGIONS.map((region, i) => (
            <div key={i} className="group cursor-pointer">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900 dark:text-slate-100">{region.name}</span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-100 dark:border-emerald-500/20">{region.growth}</span>
                </div>
                <span className="text-sm font-black text-slate-900 dark:text-white">{region.percentage}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 relative overflow-hidden transition-colors">
                <div 
                  className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-1000 group-hover:bg-indigo-500 dark:group-hover:bg-indigo-400" 
                  style={{ width: `${region.percentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center mt-1.5">
                 <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t.estMarketShare}</span>
                 <span className="text-[11px] font-black text-slate-600 dark:text-slate-400">{format(region.revenue)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
           <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
             <ArrowUpRight className="w-3 h-3 text-indigo-500 dark:text-indigo-400" /> {t.geoExpansion}: {language === "ID" ? "Tinggi" : "High"}
           </p>
           <button className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline">
             {t.fullMapView}
           </button>
        </div>
      </CardContent>
    </Card>
  );
}
