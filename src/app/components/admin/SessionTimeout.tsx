"use client";

import { useEffect, useRef } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import { useClerk } from "@clerk/nextjs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function SessionTimeout() {
  const sessionTimeout = useSettingsStore((state) => state.sessionTimeout);
  const { signOut } = useClerk();
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getTimeoutMs = (timeout: string) => {
    switch (timeout) {
      case "30_MIN": return 30 * 60 * 1000;
      case "1_HOUR": return 60 * 60 * 1000;
      case "4_HOURS": return 4 * 60 * 60 * 1000;
      default: return 30 * 60 * 1000;
    }
  };

  const resetTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(async () => {
      toast.error("Sesi Berakhir", {
        description: "Anda telah otomatis keluar karena tidak ada aktivitas selama beberapa waktu."
      });
      await signOut();
      router.push("/sign-in");
    }, getTimeoutMs(sessionTimeout));
  };

  useEffect(() => {
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    
    const handleActivity = () => {
      resetTimeout();
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    resetTimeout(); // Initial call

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [sessionTimeout, signOut, router]);

  return null;
}
