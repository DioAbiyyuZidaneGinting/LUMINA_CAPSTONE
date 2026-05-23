"use client";

import { Mail, ArrowRight, ExternalLink, TrendingUp, ShoppingBag, Users, AlertCircle, X } from "lucide-react";
import { useFormatCurrency } from "../../../hooks/useFormatCurrency";

export function EmailDigestMock({ onClose }: { onClose: () => void }) {
  const { format } = useFormatCurrency();

  return (
    <div className="fixed inset-0 z-[11000] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-[#f8fafc] dark:bg-slate-950 w-full max-w-2xl rounded-[2rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 duration-500 flex flex-col max-h-[90vh] transition-colors">
        
        {/* Email Header */}
        <div className="bg-white dark:bg-slate-900 p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center text-white">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">Lumina OS Intelligence</p>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Daily Operations Digest • 15 May 2026</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Email Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {/* Greeting */}
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Halo, Admin Eksekutif!</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              Berikut adalah ringkasan kinerja operasional Lumina OS untuk hari ini. Sistem AI kami telah menganalisis data terbaru untuk Anda.
            </p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Pendapatan Hari Ini</p>
              <p className="text-xl font-black text-slate-900 dark:text-white">{format(125400000)}</p>
              <div className="flex items-center gap-1 mt-2 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-3 h-3" />
                <span className="text-[10px] font-bold">+12.5% vs Kemarin</span>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Pesanan Baru</p>
              <p className="text-xl font-black text-slate-900 dark:text-white">142 Pesanan</p>
              <div className="flex items-center gap-1 mt-2 text-emerald-600 dark:text-emerald-400">
                <ShoppingBag className="w-3 h-3" />
                <span className="text-[10px] font-bold">89% Terpenuhi</span>
              </div>
            </div>
          </div>

          {/* AI Insights Section */}
          <div className="bg-violet-600 rounded-[2rem] p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-violet-200" />
                <p className="text-[10px] font-black uppercase tracking-widest text-violet-200">AI Customer Insight</p>
              </div>
              <h3 className="text-xl font-bold mb-3">Lonjakan Generasi Z Terdeteksi</h3>
              <p className="text-sm text-violet-100 font-medium leading-relaxed mb-6">
                Kami mendeteksi peningkatan aktivitas sebesar 40% dari segmen Generasi Z di wilayah Jakarta. Kami menyarankan untuk menonjolkan koleksi "Urban Streetwear" di halaman depan.
              </p>
              <button className="flex items-center gap-2 bg-white text-violet-600 px-6 py-2.5 rounded-xl text-xs font-black shadow-lg hover:bg-violet-50 transition-colors">
                Lihat Detail Strategi <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-violet-500 rounded-full blur-3xl opacity-50" />
          </div>

          {/* Critical Alerts */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Peringatan Kritis</h4>
            {[
              { label: "Stok Menipis: Oversized Tee Black (SKU-001)", status: "Kritis" },
              { label: "Kegagalan Pembayaran Gateway Region Bandung", status: "Sedang" },
            ].map((alert, i) => (
              <div key={i} className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl">
                <div className="flex items-center gap-3">
                  <AlertCircle className={`w-4 h-4 ${i === 0 ? "text-rose-500" : "text-amber-500"}`} />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{alert.label}</p>
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${i === 0 ? "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400" : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"}`}>
                  {alert.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Email Footer */}
        <div className="p-8 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 text-center transition-colors">
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-4">
            Ini adalah email otomatis. Silakan jangan membalas email ini.
          </p>
          <div className="flex justify-center gap-6">
            <a href="#" className="text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors flex items-center gap-1">Unsubscribe <ExternalLink className="w-3 h-3" /></a>
            <a href="#" className="text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors flex items-center gap-1">Privacy Policy <ExternalLink className="w-3 h-3" /></a>
          </div>
        </div>
      </div>
    </div>
  );
}

