"use client";

import {
  Search,
  Settings as SettingsIcon,
  Globe,
  Moon,
  Sun,
  Monitor,
  Home,
  ChevronRight,
  Check,
  ShieldCheck,
  Bell,
  PackageX,
  TrendingDown,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Info,
  Trash2,
  UserPlus,
  ShoppingBag,
  Menu
} from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";
import { useDashboardData } from "../../../hooks/useDashboardData";
import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { ADMIN_ROUTE_MAP, DEFAULT_ROUTE_METADATA } from "@/config/adminRoutes";
import Link from "next/link";
import { useLanguageStore, translations } from "@/store/languageStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useNotificationStore, Notification } from "@/store/notificationStore";
import { useCustomerSync } from "@/hooks/useCustomerSync";
import { useSidebarStore } from "@/store/sidebarStore";

export default function GlobalTopbar() {
  const { systemStatus, aiHealth, lastSync } = useDashboardData();
  
  // Dynamic temporary Clerk-to-Supabase customer CRM auto-sync
  useCustomerSync();
  const [syncSeconds, setSyncSeconds] = useState(0);
  const pathname = usePathname();
  const metadata = ADMIN_ROUTE_MAP[pathname] || DEFAULT_ROUTE_METADATA;
  const { toggleMobile } = useSidebarStore();
  
  const { language, setLanguage } = useLanguageStore();
  const { pushNotifications, theme, setTheme } = useSettingsStore();
  const { notifications, markAllAsRead, clearAll } = useNotificationStore();
  const { user } = useUser();
  const t = translations[language];

  const [showAlerts, setShowAlerts] = useState(false);
  const alertsRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const interval = setInterval(() => {
      if (lastSync) {
        setSyncSeconds(Math.floor((Date.now() - lastSync.getTime()) / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lastSync]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (alertsRef.current && !alertsRef.current.contains(event.target as Node)) {
        setShowAlerts(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "SUCCESS": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "WARNING": return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "CRITICAL": return <PackageX className="w-4 h-4 text-rose-500" />;
      default: return <Info className="w-4 h-4 text-primary" />;
    }
  };

  const getBg = (type: string) => {
    switch (type) {
      case "SUCCESS": return "bg-emerald-500/10";
      case "WARNING": return "bg-amber-500/10";
      case "CRITICAL": return "bg-rose-500/10";
      default: return "bg-primary/10";
    }
  };

  return (
    <header className="h-16 bg-background border-b border-border flex items-center justify-between px-4 md:px-6 shrink-0 z-30 sticky top-0 transition-colors duration-300">
      <div className="flex items-center gap-3 md:gap-8 flex-1 min-w-0">
        <button 
          onClick={toggleMobile}
          className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>
        {/* Breadcrumbs */}
        <div className="flex flex-col justify-center min-w-0 overflow-hidden">
          <nav className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5 truncate">
            <Link href="/admin/dashboard" className="hover:text-primary transition-colors flex items-center gap-1 shrink-0">
              <Home className="w-2.5 h-2.5" />
              {(t as any)[metadata.breadcrumb[0].toLowerCase() === "beranda" ? "home" : metadata.breadcrumb[0].toLowerCase()] || metadata.breadcrumb[0]}
            </Link>
            {metadata.breadcrumb.slice(1).map((item, index) => (
              <div key={index} className="flex items-center gap-1.5 shrink-0">
                <ChevronRight className="w-2.5 h-2.5 text-muted/30" />
                <span className="text-muted-foreground/80 truncate">
                  {(t as any)[item.toLowerCase() === "dashboard" ? "dashboardTitle" : item.toLowerCase() === "produk" ? "productsTitle" : item.toLowerCase() === "pesanan" ? "ordersTitle" : item.toLowerCase() === "chat ai" ? "chatAiTitle" : item.toLowerCase() === "pelanggan" ? "customersTitle" : item.toLowerCase() === "pengaturan" ? "settingsTitle" : item.toLowerCase()] || item}
                </span>
              </div>
            ))}
          </nav>
          <h2 className="text-sm font-black text-foreground leading-none tracking-tight truncate">
            {(t as any)[metadata.title.toLowerCase() === "dashboard" ? "dashboardTitle" : metadata.title.toLowerCase() === "produk" ? "productsTitle" : metadata.title.toLowerCase() === "pesanan" ? "ordersTitle" : metadata.title.toLowerCase() === "chat ai" ? "chatAiTitle" : metadata.title.toLowerCase() === "pelanggan" ? "customersTitle" : metadata.title.toLowerCase() === "pengaturan" ? "settingsTitle" : metadata.title.toLowerCase()] || metadata.title}
          </h2>
        </div>

      </div>

      <div className="flex items-center gap-2 md:gap-4 shrink-0">

        {/* AI Health */}
        <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest md:mr-2 border ${
          aiHealth === "HEALTHY" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-primary/10 text-primary border-primary/20"
        }`}>
          <ShieldCheck className="w-3 h-3" /> AI {aiHealth === "HEALTHY" ? t.aiHealthy : t.aiOptimizing}
        </div>

        <div className="hidden sm:block w-px h-6 bg-border mx-1"></div>

        <div className="flex items-center gap-1">
          {/* Intelligence Alerts Panel */}
          <div className="relative" ref={alertsRef}>
            <button 
              onClick={() => {
                setShowAlerts(!showAlerts);
                if (!showAlerts) markAllAsRead();
              }}
              className={`p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all relative ${showAlerts ? "bg-primary/10 text-primary" : ""}`}
              title="Intelligence Alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && pushNotifications && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[8px] font-black rounded-full border-2 border-background flex items-center justify-center animate-in zoom-in">
                  {unreadCount}
                </span>
              )}
            </button>

            {showAlerts && (
              <div className="absolute right-0 top-full mt-2 w-96 bg-card border border-border shadow-2xl rounded-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-primary" />
                    <span className="text-xs font-black text-foreground uppercase tracking-tight">Intelligence Alerts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={clearAll} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors" title="Clear All">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-lg uppercase">
                      {notifications.length} Total
                    </span>
                  </div>
                </div>

                <div className="max-h-[400px] overflow-y-auto divide-y divide-border">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div key={n.id} className={`p-4 hover:bg-muted/30 transition-colors flex gap-3 cursor-pointer group ${!n.isRead ? "bg-primary/5" : ""}`}>
                        <div className={`w-10 h-10 rounded-xl ${getBg(n.type)} flex items-center justify-center shrink-0 border border-background shadow-sm group-hover:scale-105 transition-transform`}>
                          {getIcon(n.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <p className="text-xs font-black text-foreground truncate">{n.title}</p>
                            <span className="text-[8px] font-black text-muted-foreground uppercase whitespace-nowrap pt-0.5">
                              {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed line-clamp-2">{n.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[8px] font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded-md uppercase tracking-tighter">
                              {n.source}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center space-y-3">
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                        <Bell className="w-5 h-5 text-muted-foreground/30" />
                      </div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Belum ada notifikasi intelijen</p>
                    </div>
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="p-3 bg-muted/30 text-center border-t border-border">
                    <button className="text-[10px] font-black text-primary hover:text-primary/80 uppercase tracking-widest flex items-center justify-center gap-2 w-full">
                      View Operational Log <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Theme Switcher */}
          <div className="relative group">
            <button className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all">
              {theme === "LIGHT" ? <Sun className="w-4 h-4" /> : theme === "DARK" ? <Moon className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
            </button>
            <div className="absolute top-full right-0 mt-2 w-40 bg-card border border-border rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden py-1">
              {[
                { id: "LIGHT", label: t.lightMode, icon: <Sun className="w-3.5 h-3.5" /> },
                { id: "DARK", label: t.darkMode, icon: <Moon className="w-3.5 h-3.5" /> },
                { id: "SYSTEM", label: t.systemTheme, icon: <Monitor className="w-3.5 h-3.5" /> },
              ].map((th) => (
                <button 
                  key={th.id}
                  onClick={() => setTheme(th.id as any)}
                  className={`w-full px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest hover:bg-muted transition-colors flex items-center justify-between ${theme === th.id ? "text-primary bg-primary/10" : "text-muted-foreground"}`}
                >
                  <div className="flex items-center gap-2">
                    {th.icon}
                    {th.label}
                  </div>
                  {theme === th.id && <Check className="w-3 h-3" />}
                </button>
              ))}
            </div>
          </div>

          {/* Language Switcher */}
          <div className="relative group hidden sm:block">
            <button className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all flex items-center gap-1.5">
              <Globe className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase">{language}</span>
            </button>
            <div className="absolute top-full right-0 mt-2 w-40 bg-card border border-border rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden py-1">
              <button onClick={() => setLanguage("ID")} className={`w-full px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest hover:bg-muted transition-colors flex items-center justify-between ${language === "ID" ? "text-primary bg-primary/10" : "text-muted-foreground"}`}>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-3 bg-red-500 border border-border" />
                  {t.indonesian}
                </div>
                {language === "ID" && <Check className="w-3 h-3" />}
              </button>
              <button onClick={() => setLanguage("EN")} className={`w-full px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest hover:bg-muted transition-colors flex items-center justify-between ${language === "EN" ? "text-primary bg-primary/10" : "text-muted-foreground"}`}>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-3 bg-blue-500 border border-border" />
                  {t.english}
                </div>
                {language === "EN" && <Check className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        <div className="w-px h-6 bg-border mx-1"></div>

        {/* User Identity */}
        <div className="flex items-center gap-3 pl-2">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-black text-foreground leading-none">
              {user?.fullName || t.executiveAdmin}
            </span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase mt-1 flex items-center gap-1">
              <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" /> {t.authorized}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center overflow-hidden">
            <UserButton />
          </div>
        </div>
      </div>
    </header>
  );
}
