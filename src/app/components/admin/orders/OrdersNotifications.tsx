"use client";

import { Bell, Package, Truck, AlertTriangle, CheckCircle2, CreditCard, Zap, X } from "lucide-react";
import { useState } from "react";

const NOTIFICATIONS = [
  {
    id: 1,
    type: "anomaly",
    icon: Zap,
    bg: "bg-rose-50/50",
    iconColor: "text-rose-600",
    border: "border-rose-100",
    dot: "bg-rose-500",
    title: "AI Anomaly Flagged",
    body: "#ORD-8825 — 3rd cancellation this month. Churn probability at 87%.",
    time: "2m ago",
    unread: true,
  },
  {
    id: 2,
    type: "payment",
    icon: CreditCard,
    bg: "bg-amber-50/50",
    iconColor: "text-amber-600",
    border: "border-amber-100",
    dot: "bg-amber-500",
    title: "Partial Payment Received",
    body: "#ORD-8826 — Rp 1.875.000 of Rp 3.750.000 received. Awaiting balance.",
    time: "11m ago",
    unread: true,
  },
  {
    id: 3,
    type: "shipped",
    icon: Truck,
    bg: "bg-violet-50/50",
    iconColor: "text-violet-600",
    border: "border-violet-100",
    dot: "bg-violet-500",
    title: "Batch Shipped",
    body: "14 orders dispatched via SiCepat. ETA average: 1.8 days.",
    time: "28m ago",
    unread: true,
  },
  {
    id: 4,
    type: "delivered",
    icon: CheckCircle2,
    bg: "bg-emerald-50/50",
    iconColor: "text-emerald-600",
    border: "border-emerald-100",
    dot: "bg-emerald-500",
    title: "Order Delivered",
    body: "#ORD-8824 — Successfully delivered to Rina Kartika in Medan.",
    time: "1h ago",
    unread: false,
  },
  {
    id: 5,
    type: "new",
    icon: Package,
    bg: "bg-blue-50/50",
    iconColor: "text-blue-600",
    border: "border-blue-100",
    dot: "bg-blue-500",
    title: "8 New Orders",
    body: "Orders received in the last 30 minutes. Pending warehouse assignment.",
    time: "1h ago",
    unread: false,
  },
  {
    id: 6,
    type: "risk",
    icon: AlertTriangle,
    bg: "bg-orange-50/50",
    iconColor: "text-orange-600",
    border: "border-orange-100",
    dot: "bg-orange-500",
    title: "Delivery Risk Detected",
    body: "#ORD-8822 — Package stuck at sorting hub for 6+ hours. Re-routing advised.",
    time: "2h ago",
    unread: false,
  },
];

export default function OrdersNotifications() {
  const [dismissed, setDismissed] = useState<number[]>([]);
  const visible = NOTIFICATIONS.filter((n) => !dismissed.includes(n.id));
  const unreadCount = visible.filter((n) => n.unread).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="w-4 h-4 text-slate-500" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 rounded-full text-[9px] font-semibold text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 leading-none">Notifications</p>
            <p className="text-[11px] font-medium text-slate-500 mt-1">{unreadCount} unread alerts</p>
          </div>
        </div>
        <button className="text-[10px] font-medium text-indigo-600 uppercase tracking-widest hover:text-indigo-800 transition-colors">
          Mark all read
        </button>
      </div>

      {/* Notification List */}
      <div className="divide-y divide-slate-100/60 max-h-[420px] overflow-y-auto">
        {visible.map((n) => {
          const Icon = n.icon;
          return (
            <div
              key={n.id}
              className={`group relative px-5 py-4 hover:bg-slate-50/50 transition-all duration-300 ${n.unread ? "bg-slate-50/30" : ""}`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`w-8 h-8 rounded-lg ${n.bg} border ${n.border} flex items-center justify-center shrink-0 mt-0.5`}>
                  <Icon className={`w-3.5 h-3.5 ${n.iconColor}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[13px] font-semibold text-slate-900 leading-snug">{n.title}</p>
                      {n.unread && (
                        <span className={`w-1.5 h-1.5 rounded-full ${n.dot} shrink-0`} />
                      )}
                    </div>
                    <button
                      onClick={() => setDismissed((d) => [...d, n.id])}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-slate-500 shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] font-medium text-slate-500 leading-relaxed mt-1">{n.body}</p>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-2">{n.time}</p>
                </div>
              </div>
            </div>
          );
        })}

        {visible.length === 0 && (
          <div className="px-5 py-10 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
            <p className="text-xs font-medium text-slate-500">All caught up!</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100/60">
        <button className="w-full text-[10px] font-medium uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-colors">
          View all activity log →
        </button>
      </div>
    </div>
  );
}
