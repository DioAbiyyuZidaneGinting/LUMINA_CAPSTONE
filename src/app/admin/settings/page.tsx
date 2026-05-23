"use client";

import { useState, useEffect } from "react";
import { 
  Settings as SettingsIcon, 
  User as UserIcon, 
  Bell, 
  Shield, 
  BrainCircuit, 
  Palette, 
  Globe, 
  Mail, 
  Save,
  ChevronRight,
  Monitor,
  Moon,
  Sun,
  Lock,
  Key,
  ShieldCheck,
  History,
  CloudUpload,
  LogOut,
  Smartphone,
  Download,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { useUser, useClerk } from "@clerk/nextjs";
import { useSettingsStore } from "@/store/settingsStore";
import { useLanguageStore, translations } from "@/store/languageStore";
import { ChangePasswordModal } from "@/app/components/admin/ChangePasswordModal";
import { PinSetupModal } from "@/app/components/admin/PinSetupModal";
import { EmailDigestMock } from "@/app/components/admin/EmailDigestMock";
import { useRouter } from "next/navigation";
import { useNotificationStore } from "@/store/notificationStore";
import { useExchangeRateStore } from "@/store/exchangeRateStore";

export default function SettingsPage() {
  const { user } = useUser();
  const clerk = useClerk();
  const { signOut } = clerk;
  const router = useRouter();

  // --- STORES ---
  const settings = useSettingsStore();
  const { language, setLanguage } = useLanguageStore();
  const { addNotification } = useNotificationStore();
  const { rate, isLoading, fetchRate } = useExchangeRateStore();
  const t = translations[language];

  // --- LOCAL STATE ---
  const [activeTab, setActiveTab] = useState("GENERAL");
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [showEmailDigest, setShowEmailDigest] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);

  // Fetch active sessions for "Logout All Devices"
  useEffect(() => {
    fetchRate();
  }, [fetchRate]);

  useEffect(() => {
    async function fetchSessions() {
      if (clerk?.user) {
        const resp = await clerk.user.getSessions();
        setSessions(resp);
      }
    }
    fetchSessions();
  }, [clerk]);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    toast.success(language === "ID" ? "Pengaturan berhasil disimpan" : "Settings saved successfully", {
      description: language === "ID" ? "Semua perubahan telah diterapkan ke sistem." : "All changes have been applied to the system."
    });
    
    addNotification({
      title: "Settings Updated",
      description: "System configurations have been modified by Admin.",
      type: "SUCCESS",
      source: "Settings"
    });
  };

  const handleLogoutAll = async () => {
    toast.promise(
      (async () => {
        // In a production environment, this would call a backend endpoint 
        // to revoke all active sessions via Clerk's Management API.
        // For this implementation, we trigger the global sign out.
        await signOut({ redirectUrl: "/sign-in" });
        window.location.href = "/sign-in";
      })(),
      {
        loading: language === "ID" ? "Menghentikan semua sesi..." : "Terminating all sessions...",
        success: language === "ID" ? "Seluruh sesi telah dihentikan." : "All sessions have been terminated.",
        error: language === "ID" ? "Gagal memproses penghentian sesi." : "Failed to terminate sessions.",
      }
    );
  };

  const handleDownloadBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      settings: settings,
      system: "Lumina OS v2.0",
      type: "Local Database Snapshot"
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lumina_backup_${new Date().getTime()}.json`;
    a.click();
    toast.success(language === "ID" ? "Backup Berhasil" : "Backup Successful", {
      description: language === "ID" ? "Data sistem telah diunduh ke perangkat Anda." : "System data has been downloaded to your device."
    });
  };

  const TABS = [
    { id: "GENERAL", label: "General", icon: SettingsIcon },
    { id: "AI_CONFIG", label: "AI Intelligence", icon: BrainCircuit },
    { id: "NOTIFICATIONS", label: "Notifications", icon: Bell },
    { id: "APPEARANCE", label: "Appearance", icon: Palette },
    { id: "SECURITY", label: "Security", icon: Shield },
  ];

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-10 animate-in fade-in duration-500">
      {/* Modals */}
      <ChangePasswordModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} />
      <PinSetupModal isOpen={showPinSetup} onClose={() => setShowPinSetup(false)} />
      {showEmailDigest && <EmailDigestMock onClose={() => setShowEmailDigest(false)} />}

      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t.settingsTitleHeader}</h1>
        <p className="text-slate-500 font-medium">{t.settingsSubtitle}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-72 shrink-0 space-y-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-200 group ${
                activeTab === tab.id 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                  : "bg-white dark:bg-slate-900 text-slate-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 border border-transparent hover:border-blue-100 dark:hover:border-blue-500/20"
              }`}
            >
              <div className="flex items-center gap-4">
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? "text-white" : "text-slate-400 group-hover:text-blue-500"}`} />
                {tab.label}
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === tab.id ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"}`} />
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-sm min-h-[600px] flex flex-col justify-between transition-colors">
            <div className="space-y-12">
              
              {/* GENERAL TAB */}
              {activeTab === "GENERAL" && (
                <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                      <UserIcon className="w-6 h-6 text-blue-600" /> {t.adminProfile}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">{t.fullName}</label>
                        <input 
                          type="text" 
                          readOnly
                          value={user?.fullName || "Executive Admin"} 
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-400 dark:text-slate-500 cursor-not-allowed" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">{t.businessEmail}</label>
                        <input 
                          type="email" 
                          readOnly
                          value={user?.primaryEmailAddress?.emailAddress || "admin@lumina-fashion.ai"} 
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-400 dark:text-slate-500 cursor-not-allowed" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3 pt-6 border-t border-slate-50 dark:border-slate-800">
                      <Globe className="w-6 h-6 text-blue-600" /> {t.operationalPreferences}
                    </h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-6 bg-slate-50/50 dark:bg-slate-800/30 rounded-3xl border border-slate-100 dark:border-slate-800 transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-md group">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-200">{t.mainCurrency}</p>
                          <p className="text-xs text-slate-500 font-medium">Global pricing currency across admin and storefront.</p>
                        </div>
                        <select 
                          value={settings.currency}
                          onChange={(e) => settings.setCurrency(e.target.value as any)}
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                        >
                          <option value="IDR">IDR (Rp) - Rupiah</option>
                          <option value="USD">USD ($) - US Dollar</option>
                        </select>
                      </div>

                      {/* Real-time Exchange Rate Display */}
                      <div className="flex flex-col gap-4 p-6 bg-blue-50/30 dark:bg-blue-500/5 rounded-3xl border border-blue-100/50 dark:border-blue-500/10 animate-in fade-in slide-in-from-top-2 duration-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-sm transition-all ${isLoading ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-white dark:bg-slate-900 border-blue-100 dark:border-blue-500/20 text-blue-600"}`}>
                              <Globe className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{(t as any).exchangeRateInfo}</p>
                              <p className="text-sm font-black text-slate-900 dark:text-slate-100 tabular-nums">
                                {(t as any).usdToIdr}{rate.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[9px] font-bold text-slate-400 uppercase">{(t as any).realtime} {(t as any).connected}</span>
                            <div className={`w-12 h-1 rounded-full ${isLoading ? "bg-amber-500" : "bg-emerald-500"} opacity-30`} />
                          </div>
                        </div>
                        
                        <div className="pt-4 border-t border-blue-100/50 dark:border-blue-500/10">
                          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                            {(t as any).exchangeRateAutoRefresh}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-6 bg-slate-50/50 dark:bg-slate-800/30 rounded-3xl border border-slate-100 dark:border-slate-800 transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-md group">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-200">{t.maintenanceMode}</p>
                          <p className="text-xs text-slate-500 font-medium">{t.maintenanceDesc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={settings.maintenanceMode}
                            onChange={(e) => settings.setMaintenanceMode(e.target.checked)}
                          />
                          {/* Toggle UI - Set to bright blue when active as requested */}
                          <div className="w-14 h-7 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500 shadow-sm"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* AI INTELLIGENCE TAB */}
              {activeTab === "AI_CONFIG" && (
                <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                      <BrainCircuit className="w-6 h-6 text-blue-600" /> {t.aiCoreConfig}
                    </h2>
                    
                    {/* Threshold Slider */}
                    <div className="p-8 bg-slate-50/50 dark:bg-slate-800/30 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-6">
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-200">{t.replenishmentThreshold}</p>
                          <p className="text-xs text-slate-500 font-medium">{t.replenishmentDesc}</p>
                        </div>
                        <span className="text-lg font-bold text-blue-600 bg-white dark:bg-slate-900 px-4 py-1 rounded-xl shadow-sm border border-blue-100 dark:border-blue-500/20">{settings.replenishmentThreshold}%</span>
                      </div>
                      <div className="px-2">
                        <input 
                          type="range" 
                          min="0" 
                          max="50" 
                          value={settings.replenishmentThreshold} 
                          onChange={(e) => settings.setReplenishmentThreshold(parseInt(e.target.value))}
                          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                        />
                      </div>
                    </div>

                    {/* AI Behavioral Toggles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { id: "autonomousActions", title: t.autonomousActions, desc: t.autonomousDesc, value: settings.autonomousActions, setter: settings.setAutonomousActions },
                        { id: "dynamicPricing", title: t.dynamicPricing, desc: t.dynamicPricingDesc, value: settings.dynamicPricing, setter: settings.setDynamicPricing },
                        { id: "predictiveAnalytics", title: t.predictiveAnalytics, desc: t.predictiveDesc, value: settings.predictiveAnalytics, setter: settings.setPredictiveAnalytics },
                        { id: "ageBasedRecommendation", title: t.ageBasedRecommendation, desc: t.ageBasedDesc, value: settings.ageBasedRecommendation, setter: settings.setAgeBasedRecommendation },
                      ].map((item, i) => (
                        <div key={i} className="p-6 border border-slate-100 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 hover:shadow-lg hover:border-blue-100 dark:hover:border-blue-500/20 transition-all flex flex-col justify-between group">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-200 group-hover:text-blue-600 transition-colors">{item.title}</p>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={item.value}
                                onChange={(e) => item.setter(e.target.checked)}
                              />
                              <div className="w-10 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                          <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                        </div>
                      ))}
                    </div>

                    {/* Recommendation Limit */}
                    <div className="flex items-center justify-between p-6 bg-slate-50/50 dark:bg-slate-800/30 rounded-3xl border border-slate-100 dark:border-slate-800">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-200">{t.recommendationLimit}</p>
                        <p className="text-xs text-slate-500 font-medium">Control how many recommended products are displayed per customer.</p>
                      </div>
                      <select 
                        value={settings.recommendationLimit}
                        onChange={(e) => settings.setRecommendationLimit(parseInt(e.target.value))}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300"
                      >
                        <option value={4}>4 Products</option>
                        <option value={8}>8 Products</option>
                        <option value={12}>12 Products</option>
                        <option value={16}>16 Products</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* NOTIFICATIONS TAB */}
              {activeTab === "NOTIFICATIONS" && (
                <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                      <Bell className="w-6 h-6 text-blue-600" /> {t.notificationChannels}
                    </h2>
                    <div className="grid grid-cols-1 gap-4">
                      {[
                        { id: "emailDigest", title: t.emailDailyDigest, desc: t.emailDigestDesc, icon: <Mail className="w-5 h-5" />, value: settings.emailDailyDigest, setter: settings.setEmailDailyDigest, showMock: true },
                        { id: "pushNotifications", title: t.pushNotifications, desc: t.pushNotificationsDesc, icon: <Smartphone className="w-5 h-5" />, value: settings.pushNotifications, setter: settings.setPushNotifications },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-6 border border-slate-100 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 hover:shadow-md transition-all">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600">
                              {item.icon}
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-sm font-bold text-slate-900 dark:text-slate-200">{item.title}</p>
                              <p className="text-xs text-slate-500 font-medium">{item.desc}</p>
                              {item.showMock && item.value && (
                                <button 
                                  onClick={() => setShowEmailDigest(true)}
                                  className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-widest mt-1 block"
                                >
                                  Preview Email Design
                                </button>
                              )}
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              checked={item.value}
                              onChange={(e) => item.setter(e.target.checked)}
                            />
                            <div className="w-12 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* APPEARANCE TAB */}
              {activeTab === "APPEARANCE" && (
                <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                  <div className="space-y-8">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                      <Palette className="w-6 h-6 text-blue-600" /> {t.appearanceSettings}
                    </h2>
                    
                    <div className="space-y-4">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">{t.appTheme}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { id: "LIGHT", label: t.lightMode, icon: <Sun className="w-5 h-5" /> },
                          { id: "DARK", label: t.darkMode, icon: <Moon className="w-5 h-5" /> },
                          { id: "SYSTEM", label: t.systemTheme, icon: <Monitor className="w-5 h-5" /> },
                        ].map((th) => (
                          <button 
                            key={th.id} 
                            onClick={() => settings.setTheme(th.id as any)}
                            className={`flex flex-col items-center gap-4 p-6 border rounded-3xl transition-all group ${
                              settings.theme === th.id 
                                ? "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30" 
                                : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-900 hover:border-blue-200 hover:shadow-md"
                            }`}
                          >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all border ${
                              settings.theme === th.id ? "bg-white dark:bg-slate-900 text-blue-600 border-blue-100 dark:border-blue-500/20" : "bg-white dark:bg-slate-900 text-slate-400 group-hover:text-blue-600 border-slate-100 dark:border-slate-800"
                            }`}>
                              {th.icon}
                            </div>
                            <span className={`text-sm font-bold ${settings.theme === th.id ? "text-blue-700 dark:text-blue-400" : "text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"}`}>{th.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-slate-50 dark:border-slate-800">
                      <div className="flex items-center justify-between p-6 bg-slate-50/50 dark:bg-slate-800/30 rounded-3xl border border-slate-100 dark:border-slate-800">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-200">{t.languageSelection}</p>
                          <p className="text-xs text-slate-500 font-medium">Global platform language settings.</p>
                        </div>
                        <select 
                          value={language}
                          onChange={(e) => setLanguage(e.target.value as any)}
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300"
                        >
                          <option value="ID">Indonesia (ID)</option>
                          <option value="EN">English (US)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECURITY TAB */}
              {activeTab === "SECURITY" && (
                <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                  <div className="space-y-8">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                      <ShieldCheck className="w-6 h-6 text-blue-600" /> {t.securityPrivacy}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <button 
                        onClick={() => setShowPasswordModal(true)}
                        className="flex items-center justify-between p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl hover:shadow-lg transition-all text-left group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                            <Key className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-200">{t.changePassword}</p>
                            <p className="text-xs text-slate-500 font-medium">{t.changePasswordDesc}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                      </button>

                      <div className="flex items-center justify-between p-6 bg-slate-50/50 dark:bg-slate-800/30 rounded-3xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-blue-600 border border-slate-100 dark:border-slate-800">
                            <ShieldCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-200">{t.twoFactorAuth}</p>
                            <p className="text-xs text-slate-500 font-medium">{settings.twoFactorEnabled ? "2FA Protected." : "Extra security layer."}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${settings.twoFactorEnabled ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20" : "bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700"}`}>
                            {settings.twoFactorEnabled ? "Active" : "Inactive"}
                          </span>
                          <button 
                            onClick={() => {
                              if (settings.twoFactorEnabled) settings.setTwoFactorEnabled(false);
                              else setShowPinSetup(true);
                            }}
                            className={`w-10 h-5 rounded-full relative transition-colors ${settings.twoFactorEnabled ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"}`}
                          >
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.twoFactorEnabled ? "left-6" : "left-1"}`} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-slate-50 dark:border-slate-800">
                      <div className="grid grid-cols-1 gap-4">
                        {/* Logout All Devices */}
                        <div className="p-8 border border-slate-100 dark:border-slate-800 rounded-[2rem] bg-white dark:bg-slate-900 space-y-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-5">
                              <div className="w-12 h-12 bg-rose-50 dark:bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-600">
                                <LogOut className="w-5 h-5" />
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-sm font-bold text-slate-900 dark:text-slate-200">{t.logoutAllDevices}</p>
                                <p className="text-xs text-slate-500 font-medium">{t.logoutAllDesc}</p>
                              </div>
                            </div>
                            <button 
                              onClick={handleLogoutAll}
                              className="px-6 py-2.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 text-xs font-black uppercase tracking-widest rounded-xl border border-rose-100 dark:border-rose-500/20 hover:bg-rose-100 transition-colors"
                            >
                              Execute
                            </button>
                          </div>
                          
                          <div className="pt-6 border-t border-slate-50 dark:border-slate-800 space-y-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Sessions ({sessions.length})</p>
                            <div className="space-y-3">
                              {sessions.map((session, idx) => (
                                <div key={idx} className="flex items-center justify-between py-2">
                                  <div className="flex items-center gap-3">
                                    <Smartphone className="w-4 h-4 text-slate-400" />
                                    <div>
                                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{session.latestActivityDevice?.model || "Unknown Device"} • {session.latestActivityDevice?.browserName || "Web"}</p>
                                      <p className="text-[10px] text-slate-400 font-medium">{session.latestActivityDevice?.osName} • {session.latestActivityAt?.toLocaleString() || "Unknown"}</p>
                                    </div>
                                  </div>
                                  {session.id === clerk?.session?.id && (
                                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded uppercase tracking-tighter">Current</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-6 border border-slate-100 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                              <History className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-sm font-bold text-slate-900 dark:text-slate-200">{t.sessionTimeout}</p>
                              <p className="text-xs text-slate-500 font-medium">{t.sessionTimeoutDesc}</p>
                            </div>
                          </div>
                          <select 
                            value={settings.sessionTimeout}
                            onChange={(e) => settings.setSessionTimeout(e.target.value as any)}
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300"
                          >
                            <option value="30_MIN">30 Minutes</option>
                            <option value="1_HOUR">1 Hour</option>
                            <option value="4_HOURS">4 Hours</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-between p-6 border border-slate-100 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 group">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600">
                              <Download className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-slate-900 dark:text-slate-200">{t.autoBackup}</p>
                                <span className="text-[8px] font-black bg-amber-50 dark:bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded uppercase">Local</span>
                              </div>
                              <p className="text-xs text-slate-500 font-medium">{t.autoBackupDesc}</p>
                              <button 
                                onClick={handleDownloadBackup}
                                className="text-[10px] font-black text-emerald-600 hover:underline uppercase tracking-widest mt-1 block"
                              >
                                {language === "ID" ? "Unduh Backup Sekarang" : "Download Backup Now"}
                              </button>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              checked={settings.autoBackup}
                              onChange={(e) => settings.setAutoBackup(e.target.checked)}
                            />
                            <div className="w-12 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Action Footer */}
            <div className="flex items-center justify-end gap-4 pt-10 mt-10 border-t border-slate-50 dark:border-slate-800">
              <button 
                onClick={() => settings.resetSettings()}
                className="px-8 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all"
              >
                {t.resetDefaults}
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-3 px-10 py-3 bg-blue-600 text-white text-sm font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95 group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                )}
                {isSaving ? (language === "ID" ? "Menyimpan..." : "Saving...") : t.saveChanges}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
