"use client";

import { useState, useEffect } from "react";

import {
  Home,
  Package,
  ShoppingBag,
  BarChart3,
  Users,
  Settings,
  LogOut,
  ShieldCheck,
  Monitor,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
} from "lucide-react";

import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebarStore } from "@/store/sidebarStore";

const menus = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: Home,
  },
  {
    label: "Produk",
    href: "/admin/products",
    icon: Package,
  },
  {
    label: "Pesanan",
    href: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    label: "Chat AI",
    href: "/admin/predictions",
    icon: BarChart3,
  },
  {
    label: "Pelanggan",
    href: "/admin/customers",
    icon: Users,
  },
  {
    label: "Pengaturan",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { isOpenMobile, closeMobile } = useSidebarStore();

  useEffect(() => {
    setIsMounted(true);
    const savedState = localStorage.getItem("adminSidebarCollapsed");
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("adminSidebarCollapsed", JSON.stringify(newState));
  };

  if (!isMounted) return <aside className="w-[260px] bg-sidebar text-sidebar-foreground border-r border-sidebar-border shrink-0 z-40 transition-all duration-300 ease-in-out hidden md:flex"></aside>;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={closeMobile}
        />
      )}
      
      <aside className={`${isCollapsed ? 'w-[72px]' : 'w-[260px]'} bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col shrink-0 z-50 transition-all duration-300 ease-in-out fixed inset-y-0 left-0 md:relative overflow-hidden ${isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      <div className={`h-16 flex items-center border-b border-sidebar-border shrink-0 overflow-hidden transition-all duration-300 ease-in-out relative ${isCollapsed ? 'justify-center' : 'justify-between px-6'}`}>
        <div className={`flex items-center gap-3 shrink-0 transition-all duration-300 ease-in-out absolute left-6 ${isCollapsed ? 'opacity-0 -translate-x-4 pointer-events-none' : 'opacity-100 translate-x-0'}`}>
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
            <ShieldCheck className="text-primary-foreground w-5 h-5" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <h1 className="text-sm font-black tracking-tight text-foreground uppercase leading-none mb-0.5 whitespace-nowrap">
              LUMINA
            </h1>
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none whitespace-nowrap">
              Enterprise AI
            </span>
          </div>
        </div>
        
        <button 
          onClick={toggleSidebar}
          className={`text-muted-foreground hover:text-foreground transition-all duration-300 p-2 rounded-lg hover:bg-sidebar-accent shrink-0 flex items-center justify-center ${isCollapsed ? 'mx-auto' : 'ml-auto relative z-10'}`}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <Menu className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>
      </div>

      <div className="px-4 py-8 flex-1 overflow-y-auto overflow-x-hidden">
        <div className="mb-8">
          <p className={`text-[10px] font-black tracking-widest text-muted-foreground uppercase px-3 flex items-center gap-2 whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'h-0 opacity-0 mb-0' : 'h-4 opacity-100 mb-4'}`}>
            <Monitor className="w-3 h-3 shrink-0" /> <span>Core Intelligence</span>
          </p>
          <nav className="space-y-1">
            {menus.map((menu) => {
              const Icon = menu.icon;
              const active = pathname === menu.href;
              return (
                <Link
                  key={menu.href}
                  href={menu.href}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2.5 rounded-xl text-sm transition-all duration-300 ease-in-out group relative ${
                    active
                      ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:text-primary hover:bg-sidebar-accent font-medium"
                  }`}
                  title={isCollapsed ? menu.label : undefined}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"}`}
                  />
                  <span className={`truncate whitespace-nowrap transition-all duration-300 ease-in-out ${isCollapsed ? 'w-0 opacity-0 md:w-0' : 'w-full opacity-100'}`}>
                    {menu.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isCollapsed ? 'h-0 opacity-0 mb-0' : 'h-[88px] opacity-100'}`}>
          <div className="p-3 bg-muted/50 rounded-2xl border border-border h-full">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
              <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" /> AI Governance
            </p>
            <p className="text-[10px] text-muted-foreground leading-relaxed font-medium text-wrap">
              System is operating under active AI constraints with 98% drift
              tolerance.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-sidebar-border shrink-0">
        <button
          onClick={async () => {
            await signOut();
            window.location.href = "/sign-in";
          }}
          className={`w-full flex items-center text-left ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2.5 rounded-xl text-sm font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-300 ease-in-out group`}
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0 text-muted-foreground group-hover:text-destructive transition-colors" />
          <span className={`text-left truncate whitespace-nowrap transition-all duration-300 ease-in-out ${isCollapsed ? 'w-0 opacity-0' : 'w-full opacity-100'}`}>Logout</span>
        </button>
      </div>
    </aside>
    </>
  );
}
