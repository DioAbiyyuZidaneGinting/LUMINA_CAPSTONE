"use client";

import { QrCode, FileCheck, CheckCircle2, Copy, Barcode, MapPin, PackageOpen, Truck, ShieldCheck, PenTool } from "lucide-react";
import { DrawerType } from "./OrderActionManager";
import { toast } from "sonner";
import { useTranslation } from "@/store/languageStore";

interface TrackingIdDrawerProps {
  orderId: string;
  onNavigate: (view: DrawerType, newOrderId?: string) => void;
}

export default function TrackingIdDrawer({ orderId, onNavigate }: TrackingIdDrawerProps) {
  const { t } = useTranslation();

  const handleCopy = () => {
    toast.success(t("orders.toast.copied"));
  };

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Barcode Hero */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm text-center relative overflow-hidden transition-colors">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
        
        <div className="flex justify-center mb-6 mt-4">
           {/* Simulated Barcode via SVG */}
           <svg className="h-16 w-full max-w-sm" preserveAspectRatio="none" viewBox="0 0 100 100">
             {[...Array(40)].map((_, i) => (
                <rect key={i} x={i * 2.5} y="0" width={Math.random() > 0.5 ? 1 : 1.5} height="100" className="fill-slate-900 dark:fill-slate-100" opacity={Math.random() > 0.2 ? 1 : 0} />
             ))}
           </svg>
        </div>

        <div className="flex items-center justify-center gap-3">
          <h2 className="text-3xl font-mono font-bold text-slate-900 dark:text-white tracking-wider">JNE082191821</h2>
          <button onClick={handleCopy} className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <Copy className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">{t("orders.barcode.sub")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Scan History */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Barcode className="w-4 h-4 text-slate-400" /> {t("orders.barcode.systemScan")}
              </h3>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Awb Log</span>
            </div>
            
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {[
                { time: "10-May 14:20:05", location: "DC_JKT_SOUTH", status: "MANIFEST_CREATED", icon: FileCheck, color: "text-slate-500" },
                { time: "10-May 15:45:12", location: "WH_JKT_MEGA", status: "RECEIVED_AT_SORTING", icon: PackageOpen, color: "text-blue-500" },
                { time: "10-May 19:30:44", location: "WH_JKT_MEGA", status: "XRAY_CLEARANCE", icon: ShieldCheck, color: "text-emerald-500" },
                { time: "11-May 02:15:00", location: "TRANSIT_HUB_BDO", status: "DEPARTED_FACILITY", icon: Truck, color: "text-indigo-500" },
              ].map((scan, i) => {
                const Icon = scan.icon;
                return (
                  <div key={i} className="px-6 py-4 flex items-center gap-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="w-24 shrink-0 text-left">
                      <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 font-mono leading-tight">{scan.time.split(' ')[0]}</p>
                      <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 font-mono mt-0.5">{scan.time.split(' ')[1]}</p>
                    </div>
                    
                    <div className="flex-1 flex items-center gap-4">
                      <Icon className={`w-5 h-5 ${scan.color}`} />
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{scan.status}</p>
                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {scan.location}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Signatures & Proof */}
        <div className="space-y-8">
          
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
             <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PenTool className="w-4 h-4 text-slate-400" /> {t("orders.barcode.proof")}
              </h3>
            </div>
            <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm font-medium">
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-8 bg-slate-50 dark:bg-slate-800/50 mb-4">
                <p className="text-slate-400 dark:text-slate-500 text-xs">{t("orders.barcode.awaitingDelivery")}</p>
              </div>
              {t("orders.barcode.proofDesc")}
            </div>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 shadow-sm overflow-hidden p-6 text-center transition-colors">
             <QrCode className="w-12 h-12 text-indigo-300 dark:text-indigo-400 mx-auto mb-3" />
             <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-100 mb-1">{t("orders.barcode.portalTitle")}</h4>
             <p className="text-xs font-medium text-indigo-600/80 dark:text-indigo-400 mb-4">{t("orders.barcode.portalDesc")}</p>
             <button className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-indigo-700 transition-colors w-full">
               {t("orders.barcode.action.generate")}
             </button>
          </div>

        </div>
      </div>
    </div>
  );
}
