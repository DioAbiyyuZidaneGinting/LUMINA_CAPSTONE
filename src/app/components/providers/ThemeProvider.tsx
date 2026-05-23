"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSettingsStore } from "@/store/settingsStore";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const theme = useSettingsStore((state) => state.theme);

  useEffect(() => {
    const root = window.document.documentElement;
    
    const applyTheme = () => {
      root.classList.remove("light", "dark");
      
      if (pathname.startsWith("/admin")) {
        // Admin panel follows user selected theme
        if (theme === "DARK") {
          root.classList.add("dark");
        } else if (theme === "LIGHT") {
          root.classList.add("light");
        } else {
          // SYSTEM
          if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            root.classList.add("dark");
          } else {
            root.classList.add("light");
          }
        }
      } else {
        // Storefront is permanently light
        root.classList.add("light");
      }
    };

    applyTheme();

    // Listen for system theme changes if in SYSTEM mode (not strictly needed now since we override based on path, but we keep it for potential future proofing)
    if (theme === "SYSTEM") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => applyTheme();
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme, pathname]);

  return <>{children}</>;
}
