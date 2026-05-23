"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Users } from "lucide-react";
import { useLanguageStore, translations } from "../../../../store/languageStore";
import { useFormatCurrency } from "../../../../hooks/useFormatCurrency";

const CUSTOMER_TYPE = [
  { name: "Returning", value: 65, color: "#3b82f6" }, // blue-500
  { name: "New", value: 35, color: "#10b981" }, // emerald-500
];

export default function CustomerType({ isLoading }: { isLoading?: boolean }) {
  const { language } = useLanguageStore();
  const { format } = useFormatCurrency();
  const t = translations[language] as any;

  if (isLoading) {
    return (
      <Card className="border-zinc-200 shadow-sm animate-pulse">
        <div className="h-[320px] bg-slate-50 rounded-xl"></div>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 transition-colors">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
          <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          {t.customerType}
        </CardTitle>
        <CardDescription className="text-slate-500 dark:text-slate-400 text-xs">{t.returningVsNewAnalysis}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] mt-2 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={CUSTOMER_TYPE}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                stroke="transparent"
              >
                {CUSTOMER_TYPE.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '8px' }}
                formatter={(value: any, name: any) => [`${value}%`, name === "Returning" ? (language === "ID" ? "Pelanggan Lama" : "Returning") : (language === "ID" ? "Pelanggan Baru" : "New")]} 
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-black text-slate-900 dark:text-white">65%</span>
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{language === "ID" ? "Pelanggan Lama" : "Returning"}</span>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div>
            <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{t.avgClv}</div>
            <div className="text-sm font-black text-slate-900 dark:text-slate-100">{format(2450000)}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{t.repeatRate}</div>
            <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">42.8% <span className="text-[10px] font-bold text-emerald-500">+2.1%</span></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
