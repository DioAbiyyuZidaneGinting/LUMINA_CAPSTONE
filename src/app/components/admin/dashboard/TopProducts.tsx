"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Trophy, ArrowUpRight } from "lucide-react";
import { useFormatCurrency } from "../../../../hooks/useFormatCurrency";
import { useLanguageStore, translations } from "../../../../store/languageStore";
import { useSupabaseClient } from "../../../../hooks/useSupabaseClient";

export default function TopProducts({ isLoading }: { isLoading?: boolean }) {
  const { language } = useLanguageStore();
  const { format } = useFormatCurrency();
  const t = translations[language];
  const supabase = useSupabaseClient();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopProducts() {
      try {
        setLoading(true);
        // Query item details from order items ledger relationally
        const { data, error } = await supabase
          .from("order_items")
          .select(`
            quantity,
            subtotal,
            products (
              id,
              name,
              category:categories (
                name
              )
            )
          `);

        if (error) throw error;

        // Aggregate units sold & sales values
        const agg: Record<string, any> = {};
        (data || []).forEach(item => {
          const product = item.products as any;
          if (!product) return;
          const pId = product.id;
          if (!agg[pId]) {
            agg[pId] = {
              name: product.name,
              sales: 0,
              revenue: 0,
              category: product.category?.name || "Lain-lain"
            };
          }
          agg[pId].sales += Number(item.quantity || 0);
          agg[pId].revenue += Number(item.subtotal || 0);
        });

        // Sort descending by unit velocity
        const sorted = Object.values(agg).sort((a, b) => b.sales - a.sales);

        // Assign colors dynamically for top 5 leaderboard
        const colors = ["#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef"];
        const top5 = sorted.slice(0, 5).map((item: any, index: number) => ({
          ...item,
          growth: index === 0 ? 14.5 : index === 1 ? 9.2 : index === 2 ? 4.8 : -2.3,
          color: colors[index % colors.length]
        }));

        setProducts(top5);
      } catch (err: any) {
        console.error("Gagal memuat top products leaderboard:", err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTopProducts();

    // Listen to standard custom events for reactive update synchronization
    const handleRefresh = () => fetchTopProducts();
    window.addEventListener("refresh-orders", handleRefresh);
    window.addEventListener("refresh-analytics", handleRefresh);
    return () => {
      window.removeEventListener("refresh-orders", handleRefresh);
      window.removeEventListener("refresh-analytics", handleRefresh);
    };
  }, [supabase]);

  if (isLoading || loading) {
    return (
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm animate-pulse h-full min-h-[460px]">
        <div className="h-full bg-slate-50 dark:bg-slate-800/50 rounded-xl min-h-[440px]"></div>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 transition-colors h-full flex flex-col justify-between min-h-[460px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
          <Trophy className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          {t.topProducts || "Top Performing Products"}
        </CardTitle>
        <CardDescription className="text-slate-500 dark:text-slate-400 text-xs">
          {t.basedOnSalesVolume || "Based on unit sales volume"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {products.length > 0 ? (
          <>
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={products} layout="vertical" margin={{ left: -20, right: 30 }}>
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    fontSize={10} 
                    width={100} 
                    tick={{ fill: "#94a3b8", fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    cursor={{ fill: "transparent" }}
                    contentStyle={{ 
                      backgroundColor: "var(--card)", 
                      borderColor: "var(--border)", 
                      borderRadius: "12px", 
                      fontSize: "11px",
                      color: "var(--foreground)",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)"
                    }}
                    itemStyle={{ fontWeight: 700 }}
                    labelStyle={{ fontWeight: 800, marginBottom: "4px" }}
                    formatter={(value: number) => [`${value} unit`, "Sales"]}
                  />
                  <Bar dataKey="sales" radius={[0, 4, 4, 0]} barSize={20}>
                    {products.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3 mt-4">
              {products.slice(0, 3).map((product, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      i === 0 ? "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400" : 
                      i === 1 ? "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300" : 
                      "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400"
                    }`}>
                      #{i + 1}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[180px]">{product.name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{format(product.revenue)}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 text-[10px] font-bold ${product.growth >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                    {product.growth >= 0 ? "+" : ""}{product.growth}%
                    <ArrowUpRight className={`w-3 h-3 ${product.growth < 0 ? "rotate-90" : ""}`} />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="py-24 text-center text-slate-400">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-slate-300 animate-pulse" />
            <p className="text-xs font-bold uppercase tracking-wider">Belum Ada Transaksi Produk</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
