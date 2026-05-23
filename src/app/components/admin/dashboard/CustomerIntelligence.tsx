"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, LabelList } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { MapPin, Users, Target } from "lucide-react";
import { useFormatCurrency } from "../../../../hooks/useFormatCurrency";

const CUSTOMER_TYPE = [
  { name: "Returning", value: 65, color: "#3b82f6" }, // blue-500
  { name: "New", value: 35, color: "#10b981" }, // emerald-500
];

const FUNNEL_DATA = [
  { name: "Visitors", value: 15400, fill: "#e2e8f0" },
  { name: "Product Views", value: 8200, fill: "#cbd5e1" },
  { name: "Add to Cart", value: 3100, fill: "#94a3b8" },
  { name: "Checkout", value: 1850, fill: "#64748b" },
  { name: "Paid", value: 1429, fill: "#0f172a" },
];

const REGIONS = [
  { name: "DKI Jakarta", revenue: 450000000, percentage: 35 },
  { name: "Jawa Barat", revenue: 320000000, percentage: 25 },
  { name: "Jawa Timur", revenue: 180000000, percentage: 15 },
  { name: "Bali", revenue: 120000000, percentage: 8 },
];

export default function CustomerIntelligence() {
  const { format } = useFormatCurrency();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Customer Types & CLV */}
      <Card className="border-zinc-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-slate-900 dark:text-white">
            <Users className="w-4 h-4" />
            Customer Type
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400">Returning vs New Buyers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[150px] mt-2 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CUSTOMER_TYPE}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {CUSTOMER_TYPE.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">65%</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Returning</span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Avg Customer Lifetime Value (CLV)</div>
              <div className="font-black text-slate-900 dark:text-white">{format(2450000)}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Repeat Order Rate</div>
              <div className="font-black text-slate-900 dark:text-white">42.8% <span className="text-emerald-500 text-xs font-normal">+2.1%</span></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Funnel */}
      <Card className="border-zinc-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-slate-900 dark:text-white">
            <Target className="w-4 h-4" />
            Conversion Funnel
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400">Dari Visitor hingga Pembayaran Berhasil (Conversion Rate: 9.2%)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={FUNNEL_DATA}
                layout="vertical"
                margin={{ top: 0, right: 30, left: 40, bottom: 0 }}
              >
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} width={90} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                  <LabelList dataKey="value" position="right" formatter={(val: number) => val.toLocaleString()} style={{ fontSize: '10px', fill: '#64748b', fontWeight: 'bold' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Geographic Analytics */}
      <Card className="border-zinc-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-slate-900 dark:text-white">
            <MapPin className="w-4 h-4" />
            Top Buying Regions
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400">Berdasarkan pendapatan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mt-2">
            {REGIONS.map((region, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-bold text-slate-700 dark:text-slate-300">{region.name}</span>
                  <span className="text-slate-900 dark:text-white font-black">{region.percentage}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-indigo-500 h-2 rounded-full" 
                    style={{ width: `${region.percentage}%` }}
                  ></div>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 text-right font-medium">
                  {format(region.revenue)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
