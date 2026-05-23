"use client";

import { MessageCircle, Send, Paperclip, User, Bot, MoreHorizontal, CheckCircle2, PhoneCall, Video, Package } from "lucide-react";
import { useState, useEffect } from "react";
import { DrawerType } from "./OrderActionManager";
import { useTranslation } from "@/store/languageStore";

interface CustomerChatDrawerProps {
  orderId: string;
  onNavigate: (view: DrawerType, newOrderId?: string) => void;
}

export default function CustomerChatDrawer({ orderId, onNavigate }: CustomerChatDrawerProps) {
  const { t } = useTranslation();
  const [typing, setTyping] = useState(true);

  // Simulate typing effect stopping after 3s
  useEffect(() => {
    const timer = setTimeout(() => setTyping(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-[calc(100vh-65px)]">
        
        {/* Chat Header */}
        <div className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 transition-colors">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-500/20">
                BS
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Budi Santoso</h3>
              <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">{t("orders.chat.online")}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><PhoneCall className="w-4 h-4" /></button>
            <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><Video className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-955/50 space-y-6 transition-colors">
          
          <div className="text-center">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full">{t("orders.chat.today")}</span>
          </div>

          {/* System Message */}
          <div className="flex justify-center">
             <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 max-w-xs shadow-sm">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 mb-2">
                  <Bot className="w-3.5 h-3.5 text-indigo-500" /> {t("orders.chat.autoContext")}
                </p>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2 border border-slate-100 dark:border-slate-700 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors" onClick={() => onNavigate("ORDER")}>
                   <p className="text-[11px] font-bold text-slate-900 dark:text-white">{orderId}</p>
                   <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{t("orders.chat.statusTransit")}</p>
                </div>
             </div>
          </div>

          {/* Customer Msg */}
          <div className="flex items-end gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-[10px] shrink-0 border border-indigo-200 dark:border-indigo-500/20">BS</div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-bl-sm p-4 shadow-sm max-w-[80%]">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                {t("orders.chat.message")}
              </p>
              <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 mt-2">14:22 PM</p>
            </div>
          </div>

          {/* Typing Indicator */}
          {typing && (
            <div className="flex items-end gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-[10px] shrink-0 border border-indigo-200 dark:border-indigo-500/20">BS</div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm max-w-[80%] flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-600 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0 transition-colors">
          {/* AI Quick Replies */}
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-none">
            <button className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 rounded-full text-[11px] font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors">
              <Bot className="w-3 h-3" /> {t("orders.chat.reply.status")}
            </button>
            <button className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 rounded-full text-[11px] font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors">
              <Bot className="w-3 h-3" /> {t("orders.chat.reply.apologize")}
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>
            <input 
              type="text" 
              placeholder={t("orders.chat.inputPlaceholder")} 
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm dark:text-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400"
            />
            <button className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-sm transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Context */}
      <div className="w-64 bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800 flex flex-col shrink-0 hidden md:flex transition-colors">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-4">{t("orders.chat.supportContext")}</h4>
          
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 p-4 mb-4">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{t("orders.chat.relatedOrder")}</p>
            <button onClick={() => onNavigate("ORDER")} className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline">{orderId}</button>
            <div className="flex items-center gap-1 mt-2 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-2 py-0.5 rounded w-fit">
              <Package className="w-3 h-3" /> {t("orders.chat.statusDelayed")}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">{t("orders.chat.customerTags")}</p>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-[9px] font-bold uppercase rounded">VIP</span>
              <span className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-[9px] font-bold uppercase rounded">{t("orders.chat.tag.frequent")}</span>
              <span className="px-2 py-1 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-[9px] font-bold uppercase rounded">{t("orders.chat.tag.churn")}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
