"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { PieChart as PieIcon } from "lucide-react";
import { useLanguageStore, translations } from "../../../../store/languageStore";
import { useFormatCurrency } from "../../../../hooks/useFormatCurrency";
import { useRevenueDistribution } from "../../../../hooks/useRevenueDistribution";

export default function RevenueDistribution({ isLoading }: { isLoading?: boolean }) {
  const { language } = useLanguageStore();
  const { format } = useFormatCurrency();
  const t = translations[language];

  // Fetch live revenue splits from Supabase
  const { distributions, loading } = useRevenueDistribution();

  const colors = ["#06b6d4", "#f472b6", "#a78bfa", "#34d399", "#f59e0b", "#ef4444", "#8b5cf6"];
  const formattedData = (distributions || []).map((item, index) => ({
    name: item.category,
    value: item.percentage,
    amount: item.value,
    color: colors[index % colors.length]
  }));

  const totalPeriodRevenue = (distributions || []).reduce((sum, item) => sum + item.value, 0);

  if (isLoading || loading) {
    return (
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 animate-pulse h-full min-h-[300px] md:min-h-[420px]">
        <div className="h-full bg-slate-50 dark:bg-slate-800/50 rounded-xl min-h-[250px] md:min-h-[400px]"></div>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 transition-colors h-full flex flex-col justify-between min-h-[300px] md:min-h-[420px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
          <PieIcon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          {t.revenueDistribution || "Revenue Distribution"}
        </CardTitle>
        <CardDescription className="text-slate-500 dark:text-slate-400 text-xs">
          {t.categoryBreakdown || "Category Breakdown"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between pt-0 pb-3.5 px-6 gap-1">
        {formattedData.length > 0 ? (
          <>
            <div className="flex justify-center h-[155px] mt-1 relative w-full overflow-hidden p-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                  <Pie 
                    data={formattedData} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius="60%" 
                    outerRadius="85%" 
                    paddingAngle={3} 
                    dataKey="value"
                  >
                    {formattedData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any, name: any, props: any) => [
                      `${value}% (${format(props.payload.amount)})`, 
                      props.payload.name
                    ]} 
                    contentStyle={{ 
                      backgroundColor: "var(--card)", 
                      borderColor: "var(--border)", 
                      borderRadius: "12px", 
                      fontSize: "12px",
                      color: "var(--foreground)",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)"
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-1.5 mt-2.5 max-h-[145px] overflow-y-auto pr-1">
              {formattedData.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-400 truncate max-w-[120px]">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 transition-colors">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ width: `${item.value}%`, background: item.color }} 
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white w-8 text-right">{item.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="py-20 text-center text-slate-400">
            <PieIcon className="w-8 h-8 mx-auto mb-2 text-slate-300 animate-pulse" />
            <p className="text-xs font-bold uppercase tracking-wider">Belum Ada Data Kategori</p>
          </div>
        )}

        <div className="mt-2 p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors">
          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-1">
            {t.totalPeriodRevenue || "Total Period Revenue"}
          </p>
          <p className="text-lg font-extrabold text-slate-900 dark:text-white">
            {format(totalPeriodRevenue)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
