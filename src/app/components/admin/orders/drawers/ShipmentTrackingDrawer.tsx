"use client";

import { Truck, MapPin, Clock, AlertTriangle, Navigation, CheckCircle2, ChevronRight, Package, ShieldAlert, CloudRain } from "lucide-react";
import { DrawerType } from "./OrderActionManager";
import { useTranslation } from "@/store/languageStore";

interface ShipmentTrackingDrawerProps {
  orderId: string;
  onNavigate: (view: DrawerType, newOrderId?: string) => void;
}

export default function ShipmentTrackingDrawer({ orderId, onNavigate }: ShipmentTrackingDrawerProps) {
  const { t } = useTranslation();

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Tracking Hero */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors">
        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20">
                <Navigation className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t("orders.tracking.title")}</h2>
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">{t("orders.tracking.id")}: JNE082191821</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onNavigate("BARCODE")}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 shadow-sm transition-colors"
            >
              <Package className="w-4 h-4" /> {t("orders.tracking.scanHistory")}
            </button>
          </div>
        </div>

        {/* Map Visualization */}
        <div className="h-64 bg-slate-100 dark:bg-slate-955 relative overflow-hidden w-full border-b border-slate-100 dark:border-slate-800">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.5 }} />
          
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
             <path d="M 100 125 Q 50%" fill="none" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
             <line x1="10%" y1="50%" x2="90%" y2="50%" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" />
             <line x1="10%" y1="50%" x2="90%" y2="50%" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeDasharray="8 8" className="animate-[dash_20s_linear_infinite]" />
          </svg>
          <style>{`@keyframes dash { to { stroke-dashoffset: -1000; } }`}</style>

          <div className="absolute top-1/2 left-[10%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
             <div className="w-5 h-5 bg-white dark:bg-slate-800 border-4 border-slate-300 dark:border-slate-700 rounded-full shadow-sm" />
             <div className="mt-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t("orders.tracking.origin")}</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Jakarta</p>
             </div>
          </div>

          <div className="absolute top-1/2 left-[90%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
             <div className="w-6 h-6 bg-white dark:bg-slate-800 border-4 border-indigo-500 rounded-full shadow-md" />
             <div className="mt-2 bg-indigo-50/90 dark:bg-indigo-500/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                <p className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase">{t("orders.tracking.destination")}</p>
                <p className="text-xs font-bold text-indigo-900 dark:text-indigo-100">Medan</p>
             </div>
          </div>

          <div className="absolute top-1/2 left-[50%] -translate-x-1/2 -translate-y-1/2 z-20">
             <div className="w-10 h-10 bg-indigo-600 rounded-full border-4 border-white dark:border-slate-900 shadow-xl flex items-center justify-center text-white relative">
               <Truck className="w-5 h-5" />
               <div className="absolute -inset-2 rounded-full border border-indigo-500/30 animate-ping" />
             </div>
             <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-800 text-white px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2 whitespace-nowrap">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-xs font-bold">{t("orders.tracking.inTransit")} - 68 km/h</span>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Timeline */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" /> {t("orders.tracking.checkpoints")}
              </h3>
            </div>
            <div className="p-6">
              <div className="relative pl-6 space-y-8 before:absolute before:inset-0 before:ml-8 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-800 before:to-transparent">
                {[
                  { title: t("orders.checkpoint.customs"), location: "Bakauheni Port", time: `${t("orders.chat.today")}, 10:45 AM`, desc: t("orders.checkpoint.customsDesc"), icon: ShieldAlert, color: "bg-indigo-500", done: true },
                  { title: t("orders.checkpoint.departedSorting"), location: "Jakarta Mega Hub", time: `${t("orders.chat.today")}, 06:20 AM`, desc: t("orders.checkpoint.departedSortingDesc"), icon: Truck, color: "bg-indigo-500", done: true },
                  { title: t("orders.checkpoint.weatherDelay"), location: "Tol Trans Jawa", time: `${t("orders.chat.yesterday")}, 22:15 PM`, desc: t("orders.checkpoint.weatherDelayDesc"), icon: CloudRain, color: "bg-amber-500", done: true },
                  { title: t("orders.checkpoint.processed"), location: "Jakarta Mega Hub", time: `${t("orders.chat.yesterday")}, 19:00 PM`, desc: t("orders.checkpoint.processedDesc"), icon: Package, color: "bg-indigo-500", done: true },
                ].map((event, i) => {
                  const Icon = event.icon;
                  return (
                    <div key={i} className="relative flex items-start gap-6">
                      <div className={`w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center shrink-0 shadow-sm relative z-10 ${event.color}`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{event.title}</h4>
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0">{event.time}</span>
                        </div>
                        <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" /> {event.location}
                        </p>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{event.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Logistics Info */}
        <div className="space-y-8">
          
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
             <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-slate-400" /> {t("orders.tracking.routeRisks")}
              </h3>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-3 p-3.5 bg-amber-50/50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/20 rounded-xl mb-4">
                <CloudRain className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-semibold text-amber-800 dark:text-amber-400 mb-0.5">{t("orders.tracking.weatherAdvisory")}</p>
                  <p className="text-[11px] text-amber-600 dark:text-amber-500 font-medium">{t("orders.tracking.weatherDesc")}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
             <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-slate-400" /> {t("orders.tracking.courierInfo")}
              </h3>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-5">
                <img src="https://images.unsplash.com/photo-1563821013-1490b4d455d3?auto=format&fit=crop&q=80&w=200" alt="Van" className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-700" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">JNE Express</h4>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">Heavy Truck - B 9921 XYZ</p>
                </div>
              </div>
              <button className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                {t("orders.tracking.contactDispatch")}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
