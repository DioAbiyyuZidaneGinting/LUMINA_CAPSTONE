"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { useSettingsStore } from "@/store/settingsStore";

export function StorefrontProtector({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const maintenanceMode = useSettingsStore((state) => state.maintenanceMode);

  useEffect(() => {
    if (!isLoaded) return;

    const role = (user?.publicMetadata?.role as string) || (user?.unsafeMetadata?.role as string);
    const isAdminEmail = user?.emailAddresses.some(e => e.emailAddress === "dio13abiyyu@gmail.com");
    const isAdmin = role?.toLowerCase() === "admin" || isAdminEmail;

    // 1. If Admin, always allow access but suggest dashboard if on root
    if (isAdmin) {
      if (pathname === "/") {
        router.push("/admin/dashboard");
      }
      return;
    }

    // 2. If NOT Admin and Maintenance is ON, redirect to /maintenance
    // Avoid infinite loop if already on /maintenance
    if (maintenanceMode && pathname !== "/maintenance") {
      router.push("/maintenance");
    }

    // 3. If Maintenance is OFF and user is on /maintenance, redirect back to home
    if (!maintenanceMode && pathname === "/maintenance") {
      router.push("/");
    }
    
  }, [isLoaded, user, router, pathname, maintenanceMode]);

  return <>{children}</>;
}
