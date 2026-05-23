"use client";

import { useEffect } from "react";
import { X, ExternalLink } from "lucide-react";
import { useTranslation } from "@/store/languageStore";
import OrderDetailsDrawer from "./OrderDetailsDrawer";
import ShipmentTrackingDrawer from "./ShipmentTrackingDrawer";
import CustomerChatDrawer from "./CustomerChatDrawer";
import TrackingIdDrawer from "./TrackingIdDrawer";

export type DrawerType = "ORDER" | "TRACKING" | "CHAT" | "BARCODE" | null;

interface OrderActionManagerProps {
  isOpen: boolean;
  activeView: DrawerType;
  orderId: string | null;
  onClose: () => void;
  onNavigate: (view: DrawerType, newOrderId?: string) => void;
}

export default function OrderActionManager({ isOpen, activeView, orderId, onClose, onNavigate }: OrderActionManagerProps) {
  const { t } = useTranslation();
  
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen || !orderId) return null;

  const getViewTitle = () => {
    switch (activeView) {
      case "ORDER": return t("orders.drawer.title.order");
      case "TRACKING": return t("orders.drawer.title.tracking");
      case "CHAT": return t("orders.drawer.title.chat");
      case "BARCODE": return t("orders.drawer.title.barcode");
      default: return "";
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-[600px] lg:w-[800px] bg-white dark:bg-slate-955 shadow-2xl z-[101] transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        
        {/* Header - Global actions across all drawers */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors">
          <div className="flex items-center gap-3">
             <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 py-1.5 rounded-md text-[10px] font-bold tracking-widest uppercase shadow-sm">
               {getViewTitle()}
             </div>
             <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 font-mono"></div>
             <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 font-mono flex items-center gap-1.5">
               {t("orders.drawer.ref")}: <span className="text-slate-900 dark:text-white">{orderId}</span>
               <ExternalLink className="w-3 h-3 text-slate-400" />
             </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative bg-slate-50/30 dark:bg-slate-950/30">
          {activeView === "ORDER" && <OrderDetailsDrawer orderId={orderId} onNavigate={onNavigate} />}
          {activeView === "TRACKING" && <ShipmentTrackingDrawer orderId={orderId} onNavigate={onNavigate} />}
          {activeView === "CHAT" && <CustomerChatDrawer orderId={orderId} onNavigate={onNavigate} />}
          {activeView === "BARCODE" && <TrackingIdDrawer orderId={orderId} onNavigate={onNavigate} />}
        </div>
      </div>
    </>
  );
}
