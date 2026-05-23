"use client";

import { Brain, TrendingUp, AlertTriangle, CheckCircle2, Zap, Clock, ArrowRight } from "lucide-react";

const AI_INSIGHTS = [
  {
    type: "prediction",
    icon: TrendingUp,
    color: "text-indigo-600",
    bg: "bg-white",
    border: "border-slate-200/60",
    badge: "Prediction",
    badgeColor: "bg-indigo-50/50 text-indigo-700 border border-indigo-100",
    title: "Order Volume Spike Expected",
    body: "AI forecasts +34% surge in order volume this Thursday based on historical patterns and current campaign performance.",
    confidence: 89,
    action: "Pre-stage warehouse",
  },
  {
    type: "risk",
    icon: AlertTriangle,
    color: "text-rose-600",
    bg: "bg-white",
    border: "border-slate-200/60",
    badge: "Risk Alert",
    badgeColor: "bg-rose-50/50 text-rose-700 border border-rose-100",
    title: "2 Orders at Delivery Risk",
    body: "Orders #ORD-8825 and #ORD-8822 show behavioral patterns consistent with potential churn or payment failure.",
    confidence: 76,
    action: "Intervene now",
  },
  {
    type: "optimization",
    icon: Zap,
    color: "text-amber-600",
    bg: "bg-white",
    border: "border-slate-200/60",
    badge: "Optimization",
    badgeColor: "bg-amber-50/50 text-amber-700 border border-amber-100",
    title: "Courier Route Optimization",
    body: "Switching 12 Bandung orders from JNE to SiCepat will reduce average delivery time by 6.4 hours.",
    confidence: 91,
    action: "Apply routing",
  },
  {
    type: "success",
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-white",
    border: "border-slate-200/60",
    badge: "Insight",
    badgeColor: "bg-emerald-50/50 text-emerald-700 border border-emerald-100",
    title: "Fulfillment Rate at 97.2%",
    body: "This week's on-time delivery rate has reached a 3-month high. Express orders are performing 18% better than forecast.",
    confidence: 99,
    action: "View report",
  },
];

const FULFILLMENT_PREDICTIONS = [
  { label: "Today", value: 94, max: 120 },
  { label: "Tomorrow", value: 118, max: 120 },
  { label: "Thu", value: 142, max: 160 },
  { label: "Fri", value: 130, max: 160 },
  { label: "Sat", value: 88, max: 120 },
];

export default function AiInsightsPanel() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* AI Insights Cards */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
            <Brain className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 leading-none">Lumina AI Intelligence</h3>
            <p className="text-[11px] font-medium text-slate-500 mt-1">Real-time fulfillment insights</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 bg-emerald-50/50 border border-emerald-100 px-2.5 py-1 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-medium text-emerald-700 uppercase tracking-wider">Live</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {AI_INSIGHTS.map((insight, i) => {
            const Icon = insight.icon;
            return (
              <div
                key={i}
                className={`p-5 rounded-2xl border ${insight.border} ${insight.bg} hover:shadow-sm transition-all duration-300 cursor-pointer group flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0`}>
                        <Icon className={`w-3.5 h-3.5 ${insight.color}`} />
                      </div>
                      <span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-md ${insight.badgeColor}`}>
                        {insight.badge}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-semibold text-slate-700">{insight.confidence}%</span>
                      <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wide">Confidence</p>
                    </div>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-900 leading-snug mb-1.5">{insight.title}</h4>
                  <p className="text-[12px] font-medium text-slate-500 leading-relaxed mb-4">{insight.body}</p>
                </div>

                <button className={`flex items-center gap-1.5 text-[11px] font-semibold ${insight.color} group-hover:gap-2 transition-all`}>
                  {insight.action} <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Fulfillment Prediction Panel */}
      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Clock className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-sm font-semibold text-slate-900 leading-none">Fulfillment Forecast</p>
              <p className="text-[11px] text-slate-500 font-medium mt-1">5-day order volume prediction</p>
            </div>
          </div>

          <div className="space-y-4">
            {FULFILLMENT_PREDICTIONS.map((day, i) => {
              const pct = Math.round((day.value / day.max) * 100);
              const isHigh = day.value > day.max * 0.9;
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] font-medium text-slate-600 w-16">{day.label}</span>
                    <span className={`text-[12px] font-semibold ${isHigh ? "text-rose-600" : "text-slate-900"}`}>
                      {day.value} orders
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium w-8 text-right">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isHigh ? "bg-rose-400" : "bg-indigo-400"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/60">
            <p className="text-[10px] font-semibold text-indigo-700 uppercase tracking-widest mb-1.5">AI Recommendation</p>
            <p className="text-[11px] text-indigo-600 font-medium leading-relaxed">
              Activate surge protocol on Thursday — pre-allocate 2 additional packing stations and notify logistics team.
            </p>
          </div>
        </div>

        {/* Courier Tracker Widget */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-700 mb-5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
            Live Courier Tracker
          </p>
          <div className="space-y-4">
            {[
              { courier: "JNE", active: 24, transit: "18 in transit", color: "bg-blue-500" },
              { courier: "SiCepat", active: 18, transit: "14 in transit", color: "bg-violet-500" },
              { courier: "J&T", active: 11, transit: "9 in transit", color: "bg-emerald-500" },
              { courier: "Anteraja", active: 7, transit: "7 in transit", color: "bg-amber-500" },
            ].map((c, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${c.color} shrink-0`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">{c.courier}</span>
                    <span className="text-[11px] font-medium text-slate-500">{c.active} orders</span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-400 mt-0.5">{c.transit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
