import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatAbbreviatedIDR(amount: number): string {
  if (amount >= 1e9) {
    return `Rp ${(amount / 1e9).toFixed(1).replace('.', ',')} M`;
  }
  if (amount >= 1e6) {
    return `Rp ${(amount / 1e6).toFixed(1).replace('.', ',')} Jt`;
  }
  return formatIDR(amount);
}

const CATEGORY_FALLBACKS: Record<string, string> = {
  "pakaian-dalam": "/images/category-fallbacks/pakaian-dalam.svg",
  "formal-wear": "/images/category-fallbacks/formal-wear.svg",
  "luxury-fashion": "/images/category-fallbacks/luxury-fashion.svg",
  "streetwear": "/images/category-fallbacks/streetwear.svg",
  "sportswear": "/images/category-fallbacks/sportswear.svg",
  "aksesoris-fashion": "/images/category-fallbacks/aksesoris-fashion.svg",
  "pakaian-atasan": "/images/category-fallbacks/pakaian-atasan.svg",
  "alas-kaki": "/images/category-fallbacks/alas-kaki.svg",
  "fashion-muslim": "/images/category-fallbacks/fashion-muslim.svg",
  "perhiasan": "/images/category-fallbacks/perhiasan.svg",
  "sustainable-fashion": "/images/category-fallbacks/sustainable-fashion.svg",
  "pakaian-bawahan": "/images/category-fallbacks/pakaian-bawahan.svg",
  "tas": "/images/category-fallbacks/tas.svg",
  "pakaian-terusan": "/images/category-fallbacks/pakaian-terusan.svg",
  "fashion-vintage": "/images/category-fallbacks/fashion-vintage.svg"
};

const FALLBACK_RULES = [
  { keys: ["alas kaki", "sepatu", "footwear"], path: "/images/category-fallbacks/alas-kaki.svg" },
  { keys: ["muslim", "hijab", "modest"], path: "/images/category-fallbacks/fashion-muslim.svg" },
  { keys: ["tas", "bag", "handbag"], path: "/images/category-fallbacks/tas.svg" },
  { keys: ["streetwear", "hoodie"], path: "/images/category-fallbacks/streetwear.svg" },
  { keys: ["perhiasan", "jewelry"], path: "/images/category-fallbacks/perhiasan.svg" },
  { keys: ["sportswear", "olahraga", "sport"], path: "/images/category-fallbacks/sportswear.svg" },
  { keys: ["luxury", "mewah"], path: "/images/category-fallbacks/luxury-fashion.svg" },
  { keys: ["dalam", "underwear"], path: "/images/category-fallbacks/pakaian-dalam.svg" },
  { keys: ["formal", "jas", "suit"], path: "/images/category-fallbacks/formal-wear.svg" },
  { keys: ["aksesoris", "accessory", "accessories"], path: "/images/category-fallbacks/aksesoris-fashion.svg" },
  { keys: ["sustainable", "eco"], path: "/images/category-fallbacks/sustainable-fashion.svg" },
  { keys: ["terusan", "dress"], path: "/images/category-fallbacks/pakaian-terusan.svg" },
  { keys: ["vintage", "retro"], path: "/images/category-fallbacks/fashion-vintage.svg" },
  { keys: ["atasan", "shirt", "baju", "topwear", "top"], path: "/images/category-fallbacks/pakaian-atasan.svg" },
  { keys: ["bawahan", "pants", "celana", "trousers", "bottom"], path: "/images/category-fallbacks/pakaian-bawahan.svg" }
];

export function getCategoryFallbackImage(name: string, slug?: string): string {
  // 1. Exact slug match
  if (slug) {
    const normSlug = slug.toLowerCase().trim();
    if (CATEGORY_FALLBACKS[normSlug]) {
      return CATEGORY_FALLBACKS[normSlug];
    }
  }

  // 2. Exact normalized name match (kebab-case)
  const normName = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
  if (CATEGORY_FALLBACKS[normName]) {
    return CATEGORY_FALLBACKS[normName];
  }

  // 3. Fuzzy match contains mapping
  const query = name.toLowerCase().trim();
  for (const rule of FALLBACK_RULES) {
    if (rule.keys.some(key => query.includes(key))) {
      return rule.path;
    }
  }

  return "/images/category-fallbacks/default.svg";
}

export function maskName(name: string): string {
  if (!name) return "Anonymous";
  const parts = name.split(" ");
  return parts.map(p => {
    if (p.length <= 2) return p[0] + "*";
    if (p.length > 5) return p[0] + "*".repeat(p.length - 4) + p.slice(-3);
    return p[0] + "*".repeat(p.length - 1);
  }).join(" ");
}
