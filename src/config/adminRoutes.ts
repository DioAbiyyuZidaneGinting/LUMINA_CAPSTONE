export interface RouteMetadata {
  title: string;
  breadcrumb: string[];
  subtitle?: string;
  contextLabel?: string;
}

export const ADMIN_ROUTE_MAP: Record<string, RouteMetadata> = {
  "/admin/dashboard": {
    title: "Dashboard",
    breadcrumb: ["Beranda", "Dashboard"],
    subtitle: "Ringkasan performa bisnis dan wawasan kecerdasan buatan",
    contextLabel: "Core Intelligence",
  },
  "/admin/products": {
    title: "Produk",
    breadcrumb: ["Beranda", "Produk"],
    subtitle: "Kelola inventaris, harga, dan katalog produk Anda",
    contextLabel: "Inventory Management",
  },
  "/admin/orders": {
    title: "Pesanan",
    breadcrumb: ["Beranda", "Pesanan"],
    subtitle: "Pantau dan kelola pesanan pelanggan secara realtime",
    contextLabel: "Fulfillment Operations",
  },
  "/admin/predictions": {
    title: "Chat AI",
    breadcrumb: ["Beranda", "Chat AI"],
    subtitle: "Konsultasi strategi bisnis dengan asisten cerdas Lumina",
    contextLabel: "Predictive Analytics",
  },
  "/admin/customers": {
    title: "Pelanggan",
    breadcrumb: ["Beranda", "Pelanggan"],
    subtitle: "Analisis profil dan perilaku belanja pelanggan Anda",
    contextLabel: "Customer Relationship",
  },
  "/admin/settings": {
    title: "Pengaturan",
    breadcrumb: ["Beranda", "Pengaturan"],
    subtitle: "Konfigurasi sistem, profil, dan preferensi akun",
    contextLabel: "System Configuration",
  },
};

export const DEFAULT_ROUTE_METADATA: RouteMetadata = {
  title: "Admin",
  breadcrumb: ["Beranda", "Admin"],
  subtitle: "Pusat Operasional Lumina Enterprise AI",
  contextLabel: "Operations",
};
