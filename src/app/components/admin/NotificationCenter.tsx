import { Bell, ShieldAlert, PackageX, TrendingDown } from "lucide-react";

export default function NotificationCenter() {
  return (
    <div className="relative group">
      <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors relative">
        <Bell className="w-4 h-4" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
      </button>
      
      {/* Dropdown - absolute positioned */}
      <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 shadow-xl rounded-xl hidden group-hover:block z-50 text-left">
        <div className="p-3 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900">Intelligence Alerts</span>
          <span className="text-[10px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">3 New</span>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          <div className="p-3 hover:bg-slate-50 transition-colors border-b border-slate-50 flex items-start gap-3 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <PackageX className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 mb-0.5">Critical Stock Depletion</p>
              <p className="text-[10px] text-slate-500 leading-relaxed">SKU-992 (Kemeja Oxford) predicted to stockout in 48 hours. Approval required for emergency restock.</p>
              <span className="text-[9px] font-medium text-slate-400 mt-1 block">2 mins ago • AI Predictive Engine</span>
            </div>
          </div>

          <div className="p-3 hover:bg-slate-50 transition-colors border-b border-slate-50 flex items-start gap-3 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
              <TrendingDown className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 mb-0.5">Conversion Anomaly</p>
              <p className="text-[10px] text-slate-500 leading-relaxed">Conversion rate dropped by 14% in the last 3 hours for Desktop users. Initiating RCA.</p>
              <span className="text-[9px] font-medium text-slate-400 mt-1 block">15 mins ago • Realtime Analytics</span>
            </div>
          </div>
          
          <div className="p-3 hover:bg-slate-50 transition-colors flex items-start gap-3 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4 text-indigo-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 mb-0.5">AI Confidence Shift</p>
              <p className="text-[10px] text-slate-500 leading-relaxed">Demand forecast confidence for 'Outerwear' adjusted from 92% to 84% due to new weather patterns.</p>
              <span className="text-[9px] font-medium text-slate-400 mt-1 block">1 hour ago • AI Governance</span>
            </div>
          </div>
        </div>
        
        <div className="p-2 border-t border-slate-100 text-center">
          <button className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 w-full py-1">View All Alerts</button>
        </div>
      </div>
    </div>
  );
}
