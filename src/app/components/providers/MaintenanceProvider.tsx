"use client";

import { usePathname } from "next/navigation";
import { useSettingsStore } from "@/store/settingsStore";
import { HardHat, Hammer, Sparkles, Rocket } from "lucide-react";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

export function MaintenanceProvider({ children }: { children: React.ReactNode }) {
  const maintenanceMode = useSettingsStore((state) => state.maintenanceMode);
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Identify Admin
  const isAdmin = isLoaded && (
    user?.publicMetadata?.role === "admin" || 
    user?.emailAddresses.some(e => e.emailAddress === "dio13abiyyu@gmail.com") ||
    pathname.startsWith("/admin")
  );

  // Bypass paths (always accessible)
  const isBypassPath = pathname.startsWith("/sign-in") || 
                       pathname.startsWith("/sign-up") || 
                       pathname.startsWith("/api") ||
                       pathname.startsWith("/auth-callback") ||
                       pathname.startsWith("/maintenance");

  // If maintenance is on, user is NOT an admin, and NOT on a bypass path -> show maintenance UI
  // We use isLoaded to avoid flickering the maintenance page for admins while Clerk loads
  if (isLoaded && maintenanceMode && !isAdmin && !isBypassPath) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-violet-500/10 blur-[120px] rounded-full animate-pulse delay-700" />
        </div>

        <div className="w-full max-w-2xl text-center space-y-10 animate-in fade-in zoom-in-95 duration-1000">
          <div className="relative inline-block">
            <div className="w-32 h-32 bg-gradient-to-tr from-blue-600 to-violet-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-blue-500/20 rotate-6 hover:rotate-0 transition-transform duration-500 group">
              <HardHat className="w-16 h-16 text-white group-hover:scale-110 transition-transform" />
            </div>
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl shadow-xl flex items-center justify-center animate-bounce">
              <Sparkles className="w-6 h-6 text-amber-500" />
            </div>
            <div className="absolute -bottom-4 -left-4 w-10 h-10 bg-white dark:bg-slate-900 rounded-2xl shadow-xl flex items-center justify-center animate-pulse delay-300">
              <Hammer className="w-5 h-5 text-blue-500" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Sistem Sedang <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">Maintenance</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-medium leading-relaxed">
              Kami sedang melakukan pembaruan besar untuk memberikan pengalaman belanja yang lebih cerdas dan cepat bagi Anda. Kami akan segera kembali dengan fitur-fitur baru yang luar biasa!
            </p>
          </div>

          <div className="flex flex-col items-center gap-6 pt-4">
            <div className="flex gap-3">
              {[0, 1, 2].map((i) => (
                <div 
                  key={i} 
                  className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" 
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center gap-3">
              <Rocket className="w-4 h-4 text-blue-600 animate-pulse" />
              <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Peningkatan Sistem 85% Selesai</span>
            </div>
          </div>

          <div className="pt-10">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Estimasi Selesai: 2 Jam Lagi</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
