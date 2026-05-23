"use client";

import { useState, useMemo, useCallback, useRef, useEffect, forwardRef } from "react";
import {
  Plus,
  Search as SearchIcon,
  X,
  Upload,
  Check,
  Trash2,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Layers,
  ShieldCheck,
  Sparkles,
  Shirt,
  Box,
  Eye,
  Edit2,
  MoreVertical,
  Palette as PaletteIcon,
  Hash,
  AlertCircle,
  Copy,
  Scissors,
  FileText,
  Clock,
  TrendingUp,
  Zap,
  LayoutGrid,
  Globe,
  Settings,
  MousePointer2,
  RefreshCw,
  Archive,
  ArrowUpRight,
  BarChart3,
  Flame,
  Target,
  Users,
  Compass,
  ZapOff,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { useLanguageStore, translations } from "@/store/languageStore";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { useNotificationStore } from "@/store/notificationStore";
import { supabase } from "@/lib/supabase";
import { getCategoryFallbackImage } from "@/app/components/ui/utils";

const logDev = (...args: any[]) => {
  if (process.env.NODE_ENV === "development") {
    console.log(...args);
  }
};

// --- Types ---
interface Product {
  id: string;
  name: string;
  sku: string;
  brand: string;
  brandId?: string | null;
  collection: string;
  collectionId?: string | null;
  category: string;
  categoryId?: string | null;
  subcategory: string;
  subcategoryId?: string | null;
  price: number;
  discountPrice?: number;
  productionCost?: number;
  stock: number;
  totalStock: number;
  status: "Draft" | "Published" | "Archived";
  image: string;
  material?: string;
  gsm?: string;
  fitProfile?: string;
  careLabel?: string;
  origin?: string;
  editorialDescription?: string;
  isFlashSale?: boolean;
  discountPercent?: number;
  originalPrice?: number;
  flashSaleEndAt?: string | null;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isLimitedEdition?: boolean;
  isSustainableCertified?: boolean;
  slug?: string;
}

interface Variant {
  id: string;
  size: string;
  color: string;
  colorHex: string;
  stock: number;
  sku: string;
  price: number;
}

interface ProductImage {
  id: string;
  url: string;
  isPrimary: boolean;
  file?: File;
}

interface ColorOption {
  name: string;
  hex: string;
}

// --- Fashion Fit Mapping Engine ---

const FIT_PROFILES_MAPPING: Record<string, string[]> = {
  "Kaos": ["Slim Fit", "Regular Fit", "Relaxed Fit", "Oversized Fit", "Boxy Fit", "Cropped Fit", "Longline Fit", "Muscle Fit"],
  "Kemeja": ["Slim Fit", "Regular Fit", "Tailored Fit", "Relaxed Fit", "Oversized Fit"],
  "Hoodie": ["Regular Fit", "Relaxed Fit", "Oversized Fit", "Boxy Fit", "Drop Shoulder Fit"],
  "Sweater": ["Regular Fit", "Relaxed Fit", "Oversized Fit", "Boxy Fit", "Drop Shoulder Fit"],
  "Jaket": ["Slim Fit", "Regular Fit", "Relaxed Fit", "Oversized Fit", "Structured Fit", "Bomber Fit"],
  "Blazer": ["Tailored Fit", "Slim Fit", "Modern Fit", "Classic Fit", "Italian Fit"],
  "Jas": ["Tailored Fit", "Slim Fit", "Modern Fit", "Classic Fit", "Italian Fit"],
  "Tuxedo": ["Tailored Fit", "Slim Fit", "Modern Fit", "Classic Fit", "Italian Fit"],
  "Tank top": ["Slim Fit", "Regular Fit", "Athletic Fit", "Compression Fit"],
  "Polo shirt": ["Slim Fit", "Regular Fit", "Relaxed Fit"],
  "Celana jeans": ["Skinny Fit", "Slim Fit", "Straight Fit", "Relaxed Fit", "Wide Leg Fit", "Baggy Fit", "Tapered Fit"],
  "Celana chino": ["Slim Fit", "Straight Fit", "Relaxed Fit", "Tailored Fit"],
  "Celana cargo": ["Relaxed Fit", "Baggy Fit", "Straight Fit", "Tapered Fit"],
  "Jogger": ["Slim Fit", "Relaxed Fit", "Athletic Fit", "Tapered Fit"],
  "Short pants": ["Slim Fit", "Regular Fit", "Relaxed Fit"],
  "Legging": ["Compression Fit", "Slim Fit", "Sculpt Fit"],
  "Rok": ["A-Line Fit", "Straight Fit", "Flowy Fit", "Pleated Fit"],
  "Dress": ["Bodycon Fit", "A-Line Fit", "Flowy Fit", "Empire Fit", "Shift Fit"],
  "Jumpsuit": ["Slim Fit", "Relaxed Fit", "Tailored Fit"],
  "Kaftan": ["Loose Fit", "Relaxed Fit", "Flowy Fit", "Modest Fit"],
  "Gamis": ["Loose Fit", "Relaxed Fit", "Flowy Fit", "Modest Fit"],
  "Jersey": ["Athletic Fit", "Regular Fit", "Compression Fit"],
  "Compression wear": ["Compression Fit", "Second Skin Fit"],
  "Training pants": ["Athletic Fit", "Slim Fit", "Relaxed Fit"],
  "Sneakers": ["Narrow Fit", "Regular Fit", "Wide Fit", "Extra Wide Fit", "Snug Fit", "Locked-In Fit"],
  "Loafers": ["Narrow Fit", "Regular Fit", "Wide Fit", "Extra Wide Fit", "Snug Fit", "Locked-In Fit"],
  "Boots": ["Narrow Fit", "Regular Fit", "Wide Fit", "Extra Wide Fit", "Snug Fit", "Locked-In Fit"],
  "Sandal": ["Narrow Fit", "Regular Fit", "Wide Fit", "Extra Wide Fit", "Snug Fit", "Locked-In Fit"],
  "Heels": ["Narrow Fit", "Regular Fit", "Wide Fit", "Extra Wide Fit", "Snug Fit", "Locked-In Fit"],
  "Flat shoes": ["Narrow Fit", "Regular Fit", "Wide Fit", "Extra Wide Fit", "Snug Fit", "Locked-In Fit"],
  "Sepatu olahraga": ["Narrow Fit", "Regular Fit", "Wide Fit", "Extra Wide Fit", "Snug Fit", "Locked-In Fit"],
  "Sepatu formal": ["Narrow Fit", "Regular Fit", "Wide Fit", "Extra Wide Fit", "Snug Fit", "Locked-In Fit"],
  "Leather shoes": ["Narrow Fit", "Regular Fit", "Wide Fit", "Extra Wide Fit", "Snug Fit", "Locked-In Fit"],
};

const NO_FIT_SUBCATEGORIES = [
  "Jam tangan", "Kacamata", "Topi", "Belt", "Dasi", "Scarf", "Dompet", "Tas",
  "Tote bag", "Backpack", "Sling bag", "Handbag", "Duffel bag",
  "Cincin", "Kalung", "Gelang", "Anting"
];



// --- Reusable UI Components ---

const Badge = ({ children, variant = "default" }: { children: React.ReactNode; variant?: string }) => {
  const styles: any = {
    default: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700",
    emerald: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20",
    rose: "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20",
    amber: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20",
    zinc: "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white",
  };
  return <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${styles[variant] || styles.default}`}>{children}</span>;
};

const Toggle = ({ label, active, onToggle }: { label: string; active: boolean; onToggle: () => void }) => (
  <div className="flex items-center justify-between py-1">
    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{label}</span>
    <button onClick={onToggle} className={`w-8 h-4 rounded-full relative transition-all duration-300 ${active ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-800"}`}>
      <motion.div animate={{ left: active ? "18px" : "4px" }} className="absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm" />
    </button>
  </div>
);

const InputField = ({ label, placeholder, type = "text", value, onChange, prefix, suffix, className, disabled }: any) => (
  <div className={`space-y-1 ${className}`}>
    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative group">
      {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-xs">{prefix}</span>}
      <input
        type={type} placeholder={placeholder} disabled={disabled} value={value} onChange={(e) => onChange?.(e.target.value)}
        className={`w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all placeholder:text-slate-300 dark:text-white ${prefix ? "pl-9" : ""} ${suffix ? "pr-9" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      />
      {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-[10px]">{suffix}</span>}
    </div>
  </div>
);

const SelectField = ({ label, options, value, onChange }: any) => (
  <div className="space-y-1">
    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative group">
      <select
        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 appearance-none transition-all dark:text-white"
        value={value} onChange={(e) => onChange?.(e.target.value)}
      >
        <option value="" disabled>Select {label}</option>
        {options.map((opt: any) => {
          const optValue = typeof opt === "object" ? opt.id || opt.value : opt;
          const optLabel = typeof opt === "object" ? opt.name || opt.label : opt;
          return <option key={optValue} value={optValue}>{optLabel}</option>;
        })}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
    </div>
  </div>
);

// --- Supabase DB Sync Engine ---

const fetchProductsFromDb = async () => {
  try {
    const { data: productsData, error: productsError } = await supabase
      .from("products")
      .select(`
        *,
        brand:brands!products_brand_id_fkey (
          id,
          name
        ),
        category:categories!products_category_id_fkey (
          id,
          name
        ),
        subcategory:sub_categories!products_subcategory_id_fkey (
          id,
          name
        ),
        collection:collections!products_collection_id_fkey (
          id,
          name
        )
      `);

    logDev("QUERY_RESULT productsData", productsData);
    logDev("QUERY_ERROR productsError", productsError);

    if (productsError) throw productsError;

    const { data: variantsData, error: variantsError } = await supabase
      .from("product_variants")
      .select("*, colors(*)");

    logDev("QUERY_RESULT variantsData", variantsData);
    logDev("QUERY_ERROR variantsError", variantsError);

    const { data: imagesData, error: imagesError } = await supabase
      .from("product_images")
      .select("*");

    logDev("QUERY_RESULT imagesData", imagesData);
    logDev("QUERY_ERROR imagesError", imagesError);

    const mapped: Product[] = (productsData || []).map(p => {
      const pVariants = (variantsData || []).filter(v => v.product_id === p.id);
      const pImages = (imagesData || []).filter(img => img.product_id === p.id);

      const totalStock = pVariants.reduce((sum, v) => sum + v.stock, 0);
      const primaryImage = pImages.find(img => img.is_primary)?.image_url || 
                           pImages[0]?.image_url || 
                           "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800";

      return {
        id: p.id,
        name: p.name,
        sku: p.sku,
        brand: p.brand?.name || "Lumina Core",
        brandId: p.brand?.id || p.brand_id,
        collection: p.collection?.name || "Permanent",
        collectionId: p.collection?.id || p.collection_id,
        category: p.category?.name || "Pakaian Atasan",
        categoryId: p.category?.id || p.category_id,
        subcategory: p.subcategory?.name || "General",
        subcategoryId: p.subcategory?.id || p.subcategory_id,
        price: Number(p.base_price) || 0,
        discountPrice: Number(p.discount_price) || 0,
        productionCost: Number(p.production_cost) || 0,
        stock: totalStock,
        totalStock: totalStock + 15,
        status: p.status === "published" ? "Published" : p.status === "archived" ? "Archived" : "Draft",
        image: primaryImage,
        material: p.material_composition || "",
        gsm: p.fabric_weight_gsm ? `${p.fabric_weight_gsm} GSM` : "",
        fitProfile: p.fit_profile || "Not Applicable",
        careLabel: p.care_label || "",
        origin: p.country_of_origin || "",
        editorialDescription: p.editorial_narrative || "",
        isFlashSale: p.is_flash_sale || false,
        discountPercent: p.discount_percent || 0,
        originalPrice: Number(p.original_price) || 0,
        flashSaleEndAt: p.flash_sale_end_at || null,
        isFeatured: p.is_featured || false,
        isNewArrival: p.is_new_arrival || false,
        isLimitedEdition: p.is_limited_edition || false,
        isSustainableCertified: p.is_sustainable_certified || false
      };
    });

    return mapped;
  } catch (err) {
    console.error("Failed to fetch products from Supabase:", err);
    return null;
  }
};

const saveProductToDb = async (product: Product, variantsList: Variant[], imagesList: ProductImage[], activeToggles: Record<string, boolean>) => {
  try {
    const brandId = product.brandId || null;
    const categoryId = product.categoryId || null;
    const subcategoryId = product.subcategoryId || null;
    const collectionId = product.collectionId || null;

    const dbProduct = {
      name: product.name,
      sku: product.sku,
      brand_id: brandId,
      category_id: categoryId,
      subcategory_id: subcategoryId,
      collection_id: collectionId,
      material_composition: product.material || "",
      fabric_weight_gsm: parseInt(product.gsm?.replace(/\D/g, "")) || null,
      fit_profile: product.fitProfile || "Not Applicable",
      care_label: product.careLabel || "",
      country_of_origin: product.origin || "",
      is_sustainable_certified: activeToggles["Sustainable Certified"] || false,
      base_price: product.price,
      discount_price: product.discountPrice || 0,
      production_cost: product.productionCost || 0,
      is_active: product.status === "Published",
      is_featured: activeToggles["Featured Product"] || false,
      is_new_arrival: activeToggles["New Arrival"] || false,
      is_limited_edition: activeToggles["Limited Edition"] || false,
      slug: product.slug || product.sku.toLowerCase(),
      editorial_narrative: product.editorialDescription || "",
      status: product.status.toLowerCase(),
      is_flash_sale: activeToggles["Flash Sale"] || false,
      discount_percent: product.discountPercent || 0,
      original_price: product.originalPrice || product.price,
      flash_sale_end_at: product.flashSaleEndAt || null
    };

    let savedProductId = product.id;
    const { data: existing, error: existingError } = await supabase.from("products").select("id").eq("sku", product.sku).maybeSingle();
    logDev("QUERY_RESULT existing", existing);
    logDev("QUERY_ERROR existingError", existingError);
    if (existingError) throw existingError;
    
    if (existing) {
      const { data: updateData, error: updateError } = await supabase.from("products").update(dbProduct).eq("id", existing.id).select();
      logDev("QUERY_RESULT updateData", updateData);
      logDev("QUERY_ERROR updateError", updateError);
      if (updateError) throw updateError;
      savedProductId = existing.id;
    } else {
      const { data: inserted, error: insertError } = await supabase.from("products").insert(dbProduct).select("id").single();
      logDev("QUERY_RESULT inserted", inserted);
      logDev("QUERY_ERROR insertError", insertError);
      if (insertError) throw insertError;
      savedProductId = inserted?.id || product.id;
    }

    // Update Variants Logic
    let existingVariants: any[] = [];
    if (existing) {
      const { data } = await supabase.from("product_variants").select("*").eq("product_id", savedProductId);
      existingVariants = data || [];

      // We DO NOT delete all variants anymore. We handle images below:
      const { data: delImg, error: delImgError } = await supabase.from("product_images").delete().eq("product_id", savedProductId).select();
      if (delImgError) throw delImgError;

      // Clean up orphaned images from Storage
      if (delImg && delImg.length > 0) {
        const retainedUrls = imagesList.map(img => img.url);
        const pathsToDelete = delImg
          .filter((img: any) => !retainedUrls.includes(img.image_url))
          .map((img: any) => {
            try {
              const parts = img.image_url.split('/product_images/');
              return parts.length > 1 ? parts[1] : null;
            } catch (e) {
              return null;
            }
          })
          .filter(Boolean) as string[];

        if (pathsToDelete.length > 0) {
          const { error: removeError } = await supabase.storage.from("product_images").remove(pathsToDelete);
          if (removeError) console.error("Failed to remove old images from storage:", removeError);
        }
      }
    }

    const keptVariantIds = new Set<string>();

    for (const v of variantsList) {
      let colorId = null;
      const { data: colData } = await supabase.from("colors").select("id").eq("name", v.color).maybeSingle();

      if (colData) {
        colorId = colData.id;
      } else {
        const { data: newCol } = await supabase.from("colors").insert({ name: v.color, hex_code: v.colorHex }).select("id").single();
        colorId = newCol?.id;
      }

      if (colorId) {
        await supabase.from("product_colors").upsert({ product_id: savedProductId, color_id: colorId });

        const existingMatch = existingVariants.find(ev => ev.size === v.size && ev.color_id === colorId);
        
        if (existingMatch) {
          keptVariantIds.add(existingMatch.id);
          const { error: updVError } = await supabase.from("product_variants").update({
            stock: v.stock,
            custom_sku: v.sku || null
          }).eq("id", existingMatch.id);
          if (updVError) throw updVError;
        } else {
          const { data: insV, error: insVError } = await supabase.from("product_variants").insert({
            product_id: savedProductId,
            color_id: colorId,
            size: v.size,
            stock: v.stock,
            custom_sku: v.sku || null
          }).select().single();
          if (insVError) throw insVError;
          if (insV) keptVariantIds.add(insV.id);
        }
      }
    }

    // Handle removed variants (Soft delete by setting stock to 0 if constrained, otherwise hard delete)
    for (const ev of existingVariants) {
      if (!keptVariantIds.has(ev.id)) {
        const { error: delVError } = await supabase.from("product_variants").delete().eq("id", ev.id);
        if (delVError) {
          // If we hit a constraint error (like 409 Conflict due to order_items foreign key), we soft delete:
          await supabase.from("product_variants").update({ stock: 0 }).eq("id", ev.id);
        }
      }
    }

    for (const img of imagesList) {
      if (img.url) {
        let finalImageUrl = img.url;

        if (img.file) {
          const fileExt = img.file.name.split('.').pop();
          const fileName = `${savedProductId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("product_images")
            .upload(filePath, img.file);

          if (uploadError) {
            console.error("Failed to upload image:", uploadError);
            throw uploadError;
          }

          const { data: publicUrlData } = supabase.storage
            .from("product_images")
            .getPublicUrl(filePath);

          finalImageUrl = publicUrlData.publicUrl;
        }

        const { data: insImg, error: insImgError } = await supabase.from("product_images").insert({
          product_id: savedProductId,
          image_url: finalImageUrl,
          is_primary: img.isPrimary
        }).select();
        logDev("QUERY_RESULT insImg", insImg);
        logDev("QUERY_ERROR insImgError", insImgError);
        if (insImgError) throw insImgError;
      }
    }

    return savedProductId;
  } catch (err) {
    console.error("Failed to save product to Supabase:", err);
    throw err;
  }
};


// --- Modal: Complex Fashion Registration ---

const AddProductModal = ({ isOpen, onClose, onAddProduct, initialData }: { isOpen: boolean; onClose: () => void; onAddProduct: (product: Product, variants: Variant[], images: ProductImage[], activeToggles: Record<string, boolean>) => void; initialData?: Product | null }) => {
  const { language } = useLanguageStore();
  const t = translations[language];

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [slug, setSlug] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [collection, setCollection] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [productionCost, setProductionCost] = useState("");
  const [material, setMaterial] = useState("");
  const [gsm, setGsm] = useState("");
  const [fitProfile, setFitProfile] = useState("");
  const [careLabel, setCareLabel] = useState("");
  const [origin, setOrigin] = useState("");
  const [editorialDescription, setEditorialDescription] = useState("");

  // New status and flash sale states
  const [status, setStatus] = useState<"Draft" | "Published" | "Archived">("Draft");
  const [isFlashSale, setIsFlashSale] = useState(false);
  const [discountPercent, setDiscountPercent] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [flashSaleEndAt, setFlashSaleEndAt] = useState("");

  const [isSkuModified, setIsSkuModified] = useState(false);
  const [isSlugModified, setIsSlugModified] = useState(false);
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);

  const refreshCategories = async () => {
    try {
      const { data: categoriesData } = await supabase.from("categories").select("*").order("name");
      if (categoriesData) setDbCategories(categoriesData);
    } catch (e) {
      console.error(e);
    }
  };

  const [dbBrands, setDbBrands] = useState<any[]>([]);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [dbSubcategories, setDbSubcategories] = useState<any[]>([]);
  const [dbCollections, setDbCollections] = useState<any[]>([]);

  const brandName = useMemo(() => {
    const found = dbBrands.find(b => b.id === brand);
    return found ? found.name : "";
  }, [brand, dbBrands]);

  const categoryName = useMemo(() => {
    const found = dbCategories.find(c => c.id === category);
    return found ? found.name : "";
  }, [category, dbCategories]);

  const subcategoryName = useMemo(() => {
    const found = dbSubcategories.find(s => s.id === subcategory);
    return found ? found.name : "";
  }, [subcategory, dbSubcategories]);

  const collectionName = useMemo(() => {
    const found = dbCollections.find(c => c.id === collection);
    return found ? found.name : "";
  }, [collection, dbCollections]);

  useEffect(() => {
    if (!isOpen) return;

    const loadMasterData = async () => {
      try {
        const { data: brandsData, error: brandsError } = await supabase.from("brands").select("*").order("name");
        logDev("QUERY_RESULT brandsData", brandsData);
        logDev("QUERY_ERROR brandsError", brandsError);
        if (brandsData) setDbBrands(brandsData);

        const { data: categoriesData, error: categoriesError } = await supabase.from("categories").select("*").order("name");
        logDev("QUERY_RESULT categoriesData", categoriesData);
        logDev("QUERY_ERROR categoriesError", categoriesError);
        if (categoriesData) setDbCategories(categoriesData);

        const { data: collectionsData, error: collectionsError } = await supabase.from("collections").select("*").order("name");
        logDev("QUERY_RESULT collectionsData", collectionsData);
        logDev("QUERY_ERROR collectionsError", collectionsError);
        if (collectionsData) setDbCollections(collectionsData);

        const { data: colorsData, error: colorsError } = await supabase.from("colors").select("*").order("name");
        logDev("QUERY_RESULT colorsData", colorsData);
        logDev("QUERY_ERROR colorsError", colorsError);
        if (colorsData && colorsData.length > 0) {
          const mappedColors = colorsData.map(c => ({ name: c.name, hex: c.hex_code }));
          setPalette(mappedColors);
          setSelectedColor(mappedColors[0]);
        }
      } catch (err) {
        console.error("Failed to load master data from Supabase:", err);
      }
    };

    loadMasterData();
  }, [isOpen]);

  useEffect(() => {
    if (!category) {
      setDbSubcategories([]);
      return;
    }

    const loadSubcategories = async () => {
      try {
        const { data: subData, error: subError } = await supabase
          .from("sub_categories")
          .select("*")
          .eq("category_id", category)
          .order("name");

        logDev("QUERY_RESULT subData", subData);
        logDev("QUERY_ERROR subError", subError);

        if (subData) {
          setDbSubcategories(subData);
        }
      } catch (err) {
        console.error("Failed to load subcategories:", err);
      }
    };

    loadSubcategories();
  }, [category]);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name); setSku(initialData.sku);
      setBrand(initialData.brandId || "");
      setCategory(initialData.categoryId || "");
      setSubcategory(initialData.subcategoryId || "");
      setCollection(initialData.collectionId || "");
      setPrice(initialData.price.toString());
      setDiscountPrice(initialData.discountPrice?.toString() || "");
      setProductionCost(initialData.productionCost?.toString() || "");
      setMaterial(initialData.material || ""); setGsm(initialData.gsm || "");
      setFitProfile(initialData.fitProfile || ""); setCareLabel(initialData.careLabel || "");
      setOrigin(initialData.origin || ""); setEditorialDescription(initialData.editorialDescription || "");
      setSlug(initialData.sku.toLowerCase()); setIsSkuModified(true); setIsSlugModified(true);

      setStatus(initialData.status || "Draft");
      setIsFlashSale(initialData.isFlashSale || false);
      setDiscountPercent(initialData.discountPercent?.toString() || "");
      setOriginalPrice(initialData.originalPrice?.toString() || "");
      setFlashSaleEndAt(initialData.flashSaleEndAt ? new Date(initialData.flashSaleEndAt).toISOString().slice(0, 16) : "");

      setActiveToggles({
        "Featured Product": initialData.isFeatured || false,
        "New Arrival": initialData.isNewArrival || false,
        "Limited Edition": initialData.isLimitedEdition || false,
        "Sustainable Certified": initialData.isSustainableCertified || false
      });

      const loadProductDetails = async () => {
        try {
          const { data: vData, error: vError } = await supabase
            .from("product_variants")
            .select("*, colors(*)")
            .eq("product_id", initialData.id);

          logDev("QUERY_RESULT loadProductDetails vData", vData);
          logDev("QUERY_ERROR loadProductDetails vError", vError);

          const { data: imgData, error: imgError } = await supabase
            .from("product_images")
            .select("*")
            .eq("product_id", initialData.id);

          logDev("QUERY_RESULT loadProductDetails imgData", imgData);
          logDev("QUERY_ERROR loadProductDetails imgError", imgError);

          if (vData && vData.length > 0) {
            setVariants(vData.map((v: any, idx: number) => ({
              id: v.id || `v-${idx}`,
              size: v.size,
              color: v.colors?.name || "Onyx Black",
              colorHex: v.colors?.hex_code || "#000000",
              stock: v.stock,
              sku: v.custom_sku || "",
              price: Number(initialData.price)
            })));
          }

          if (imgData && imgData.length > 0) {
            setImages(imgData.map((img: any, idx: number) => ({
              id: img.id || `img-${idx}`,
              url: img.image_url,
              isPrimary: img.is_primary
            })));
          } else {
            setImages([{ id: "img-default", url: initialData.image, isPrimary: true }]);
          }
        } catch (e) {
          console.error("Failed to load details:", e);
          setImages([{ id: "img-default", url: initialData.image, isPrimary: true }]);
        }
      };
      
      loadProductDetails();
    } else {
      setName(""); setSku(""); setBrand(""); setCategory(""); setSubcategory("");
      setCollection(""); setPrice(""); setDiscountPrice(""); setProductionCost(""); setMaterial(""); setGsm(""); setFitProfile("");
      setCareLabel(""); setOrigin(""); setEditorialDescription("");
      setImages([]);
      setVariants([{ id: "v1", size: "M", color: "Onyx Black", colorHex: "#000000", stock: 10, sku: "", price: 0 }]);
      setIsSkuModified(false); setIsSlugModified(false);
      setStatus("Draft");
      setIsFlashSale(false);
      setDiscountPercent("");
      setOriginalPrice("");
      setFlashSaleEndAt("");
      setActiveToggles({
        "Featured Product": false,
        "New Arrival": true,
        "Limited Edition": false,
        "Sustainable Certified": false
      });
    }
  }, [initialData, isOpen]);

  const [activeToggles, setActiveToggles] = useState<Record<string, boolean>>({
    "Featured Product": false, "New Arrival": true, "Limited Edition": false, "Sustainable Certified": false
  });

  const [images, setImages] = useState<ProductImage[]>([]);
  const [variants, setVariants] = useState<Variant[]>([
    { id: "v1", size: "M", color: "Onyx Black", colorHex: "#000000", stock: 10, sku: "", price: 0 }
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [palette, setPalette] = useState<ColorOption[]>([]);
  const [selectedColor, setSelectedColor] = useState<ColorOption>({ name: "Onyx Black", hex: "#000000" });
  const [customHex, setCustomHex] = useState("#f3f3f3");
  const [customName, setCustomName] = useState("");

  const dynamicFitOptions = useMemo(() => {
    if (!subcategoryName) return [];
    return FIT_PROFILES_MAPPING[subcategoryName] || [];
  }, [subcategoryName]);

  const isFitRequired = useMemo(() => {
    if (!subcategoryName) return false;
    return !NO_FIT_SUBCATEGORIES.includes(subcategoryName) && (dynamicFitOptions.length > 0 || categoryName === "Alas Kaki");
  }, [subcategoryName, categoryName, dynamicFitOptions]);

  useEffect(() => {
    if (!isSlugModified && name) {
      setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  }, [name, isSlugModified]);

  useEffect(() => {
    if (!isSkuModified && (name || categoryName || brandName)) {
      const catPart = categoryName ? categoryName.split(" ").map(w => w[0]).join("").toUpperCase() : "XXX";
      const brandPart = brandName ? brandName.split(" ").map(w => w[0]).join("").toUpperCase() : "LUM";
      const namePart = name ? name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 3) : "000";
      const randomPart = Math.floor(100 + Math.random() * 900);
      setSku(`LUM-${catPart}-${brandPart}-${namePart}-${randomPart}`);
    }
  }, [name, categoryName, brandName, isSkuModified]);

  const toggleSwitch = (label: string) => setActiveToggles(prev => ({ ...prev, [label]: !prev[label] }));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        url: URL.createObjectURL(file),
        isPrimary: images.length === 0,
        file: file,
      }));
      setImages(prev => [...prev, ...newImages]);
      toast.success(`${files.length} image(s) added.`);
    }
  };

  const handleDeleteImage = (imgId: string) => {
    setImages(prev => {
      const filtered = prev.filter(img => img.id !== imgId);
      if (prev.find(img => img.id === imgId)?.isPrimary && filtered.length > 0) {
        filtered[0].isPrimary = true;
      }
      return filtered;
    });
  };

  const handleSetPrimaryImage = (imgId: string) => {
    setImages(prev => prev.map(img => ({
      ...img,
      isPrimary: img.id === imgId
    })));
  };

  const addVariant = () => {
    setVariants(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      size: "M", color: selectedColor.name, colorHex: selectedColor.hex,
      stock: 0, sku: "", price: 0,
    }]);
  };

  const updateVariantColor = (variantId: string, color: ColorOption) => {
    setVariants(prev => prev.map(v => v.id === variantId ? { ...v, color: color.name, colorHex: color.hex } : v));
  };

  const addCustomColor = async () => {
    if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(customHex)) return toast.error("Invalid Hex");
    const finalName = customName.trim() || `Shade ${customHex}`;
    
    try {
      const { data, error } = await supabase
        .from("colors")
        .insert({ name: finalName, hex_code: customHex })
        .select()
        .single();

      logDev("QUERY_RESULT addCustomColor data", data);
      logDev("QUERY_ERROR addCustomColor error", error);

      if (error) {
        if (error.code === '23505') {
          toast.error("Warna atau kode Hex ini sudah terdaftar.");
          return;
        }
        throw error;
      }

      const newColor = { name: data.name, hex: data.hex_code };
      setPalette(prev => [...prev, newColor]);
      setSelectedColor(newColor);
      setCustomName("");
      toast.success(`Warna ${finalName} berhasil disimpan ke database.`);
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan warna ke database.");
    }
  };

  const handleSave = () => {
    if (!name || !category || !brand) return toast.error("Fill required fields.");
    setIsSaving(true);
    const newProduct: Product = {
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      name, sku, 
      brand: brandName, brandId: brand,
      category: categoryName, categoryId: category, 
      subcategory: subcategoryName || "General", subcategoryId: subcategory || null,
      collection: collectionName || "Permanent", collectionId: collection || null,
      price: parseInt(price.toString().replace(/\D/g, "")) || 0,
      discountPrice: parseInt(discountPrice.toString().replace(/\D/g, "")) || 0,
      productionCost: parseInt(productionCost.toString().replace(/\D/g, "")) || 0,
      stock: variants.reduce((acc, v) => acc + (v.stock || 0), 0),
      totalStock: variants.reduce((acc, v) => acc + (v.stock || 0), 0) + 15,
      status: status,
      image: images.find(img => img.isPrimary)?.url || initialData?.image || "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800",
      material, gsm, fitProfile, careLabel, origin, editorialDescription,
      isFlashSale: isFlashSale,
      discountPercent: parseInt(discountPercent.toString()) || 0,
      originalPrice: parseInt(originalPrice.toString().replace(/\D/g, "")) || 0,
      flashSaleEndAt: flashSaleEndAt || null,
      slug: slug
    };
    setTimeout(() => {
      onAddProduct(newProduct, variants, images, {
        ...activeToggles,
        "Flash Sale": isFlashSale
      });
      setIsSaving(false);
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/40 backdrop-blur-md" />
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 30 }}
        className="bg-white dark:bg-slate-950 w-full max-w-5xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col relative z-10 border border-slate-100 dark:border-slate-800 h-full max-h-[92vh]"
      >
        <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-900 flex items-center justify-between shrink-0 bg-white dark:bg-slate-950">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg"><Shirt className="w-5 h-5 text-white" /></div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{initialData ? t.editAssetModal : t.registerAssetModal}</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t.modalSubtitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition-all"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-5 space-y-4">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-widest ml-1">{t.assetImagery}</label>
                
                {/* Main Preview Box */}
                <div className="aspect-square bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-800 rounded-[28px] flex flex-col items-center justify-center group relative overflow-hidden">
                  {images.find(img => img.isPrimary) ? (
                    <img src={images.find(img => img.isPrimary)?.url} className="w-full h-full object-cover animate-in fade-in" />
                  ) : (
                    <div onClick={() => fileInputRef.current?.click()} className="text-center space-y-2 cursor-pointer w-full h-full flex flex-col justify-center items-center">
                      <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm mx-auto mb-2"><Upload className="w-6 h-6 text-blue-600" /></div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t.selectCampaign}</p>
                    </div>
                  )}
                </div>

                {/* Thumbnails grid */}
                <div className="grid grid-cols-4 gap-3 mt-4">
                  {images.map((img) => (
                    <div key={img.id} className={`aspect-square rounded-2xl overflow-hidden border-2 relative group/thumb cursor-pointer ${img.isPrimary ? "border-blue-600 shadow-lg" : "border-slate-200 dark:border-slate-800"}`} onClick={() => handleSetPrimaryImage(img.id)}>
                      <img src={img.url} className="w-full h-full object-cover" />
                      
                      {/* Delete Button */}
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteImage(img.id); }} className="absolute top-1 right-1 w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity hover:bg-rose-700 shadow">
                        <X className="w-3 h-3" />
                      </button>

                      {/* Primary Indicator Badge */}
                      {img.isPrimary && (
                        <div className="absolute bottom-1 left-1 bg-blue-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-md uppercase">
                          Primary
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Upload button thumb */}
                  <div onClick={() => fileInputRef.current?.click()} className="aspect-square bg-slate-50 dark:bg-slate-900/30 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center hover:bg-slate-100 cursor-pointer text-slate-400 hover:text-blue-600 transition-all">
                    <Plus className="w-5 h-5" />
                  </div>
                </div>

                <input type="file" multiple hidden ref={fileInputRef} onChange={handleImageUpload} accept="image/*" />
              </div>
            </div>

            <div className="col-span-12 lg:col-span-7 space-y-4">
              <div className="bg-slate-50/50 dark:bg-slate-900/30 p-6 rounded-[28px] border border-slate-100 dark:border-slate-800 grid grid-cols-1 gap-4">
                <InputField label={t.assetName} placeholder="Minimalist Oversized Tee" value={name} onChange={setName} />
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative group">
                    <InputField label={t.assetSku} placeholder="Generating..." value={sku} onChange={(v: string) => { setSku(v); setIsSkuModified(true); }} />
                    {!isSkuModified && <span className="absolute top-[1px] right-2 text-[8px] font-bold text-emerald-500 uppercase">Auto</span>}
                  </div>
                  <SelectField label={t.brand} options={dbBrands} value={brand} onChange={setBrand} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center pr-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.category}</label>
                      <button
                        type="button"
                        onClick={() => setIsManageCategoriesOpen(true)}
                        className="text-[9px] font-black text-blue-600 dark:text-blue-400 hover:underline uppercase tracking-widest"
                      >
                        + Manage
                      </button>
                    </div>
                    <div className="relative group">
                      <select
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 appearance-none transition-all dark:text-white"
                        value={category} onChange={(e) => { setCategory(e.target.value); setSubcategory(""); }}
                      >
                        <option value="" disabled>Select {t.category}</option>
                        {dbCategories.map((opt: any) => {
                          const optValue = typeof opt === "object" ? opt.id || opt.value : opt;
                          const optLabel = typeof opt === "object" ? opt.name || opt.label : opt;
                          return <option key={optValue} value={optValue}>{optLabel}</option>;
                        })}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <SelectField label={t.subcategory} options={dbSubcategories} value={subcategory} onChange={setSubcategory} />
                </div>
                <SelectField label={t.collection} options={dbCollections} value={collection} onChange={setCollection} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center gap-3"><Scissors className="w-4 h-4 text-blue-600" /><h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-900 dark:text-white">{t.fabricationSilhouette}</h3></div>
             <div className="bg-slate-50/50 dark:bg-slate-900/30 p-6 rounded-[28px] border border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputField label={t.material} placeholder="e.g. 100% Organic Cotton" value={material} onChange={setMaterial} />
                <InputField label={t.gsm} placeholder="e.g. 240 GSM" value={gsm} onChange={setGsm} />
                {isFitRequired ? (
                   <SelectField label={categoryName === "Alas Kaki" ? t.shoeFit : t.fitProfile} options={dynamicFitOptions} value={fitProfile} onChange={setFitProfile} />
                ) : (
                  <div className="space-y-1.5 opacity-40 grayscale pointer-events-none">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t.fitProfile}</label>
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 text-xs font-bold text-slate-400 border border-slate-200 dark:border-slate-700">Not Applicable</div>
                  </div>
                )}
                <InputField label={t.careLabel} placeholder="Hand wash cold" value={careLabel} onChange={setCareLabel} />
                <InputField label={t.origin} placeholder="Italy, Indonesia" value={origin} onChange={setOrigin} />
                <div className="flex flex-col justify-end pb-1.5"><Badge variant="amber">Sustainable Certified</Badge></div>
             </div>
          </div>

          <div className="grid grid-cols-12 gap-10">
            <div className="col-span-12 lg:col-span-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] p-8 space-y-6 shadow-sm h-full">
                <div className="flex items-center gap-3"><DollarSign className="w-5 h-5 text-blue-600" /><h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white">{t.commercialStrategy}</h3></div>
                <div className="grid grid-cols-2 gap-6">
                  <InputField label={t.basePrice} prefix="Rp" placeholder="0" className="col-span-2" value={price} onChange={setPrice} />
                  <InputField label={t.discountPrice} prefix="Rp" placeholder="0" value={discountPrice} onChange={setDiscountPrice} />
                  <InputField label={t.productionCost} prefix="Rp" placeholder="0" value={productionCost} onChange={setProductionCost} />
                </div>
                {/* Flash Sale Section */}
                <div className="pt-6 border-t border-slate-50 dark:border-slate-800/50 space-y-4">
                  <Toggle label="Set as Flash Sale" active={isFlashSale} onToggle={() => setIsFlashSale(!isFlashSale)} />
                  {isFlashSale && (
                    <div className="space-y-4 pt-2">
                      <div className="grid grid-cols-2 gap-4">
                        <InputField label="Original Price" prefix="Rp" placeholder="0" value={originalPrice} onChange={setOriginalPrice} />
                        <InputField label="Discount %" suffix="%" placeholder="0" type="number" value={discountPercent} onChange={setDiscountPercent} />
                      </div>
                      <InputField label="Flash Sale Ends At" type="datetime-local" placeholder="" value={flashSaleEndAt} onChange={setFlashSaleEndAt} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-6 space-y-6">
              <div className="bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 rounded-[32px] p-8 space-y-6">
                <div className="flex items-center gap-3 mb-2"><ShieldCheck className="w-5 h-5 text-blue-600" /><h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white">{t.assetVisibility}</h3></div>
                
                {/* Status Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Status</label>
                  <div className="relative group">
                    <select
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 appearance-none transition-all dark:text-white"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                    >
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                      <option value="Archived">Archived</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-10 gap-y-2 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                  {Object.keys(activeToggles).map(label => <Toggle key={label} label={label} active={activeToggles[label]} onToggle={() => toggleSwitch(label)} />)}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-12 border-t border-slate-50 dark:border-slate-900 pt-12">
            <div className="space-y-8 bg-slate-50/50 dark:bg-slate-900/30 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-3"><div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-sm"><PaletteIcon className="w-5 h-5 text-blue-600" /></div><div><h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white">{t.colorEngine}</h3><p className="text-[9px] text-slate-400 font-bold uppercase">{t.defineVariants}</p></div></div>
                <div className="flex flex-wrap items-end gap-4 bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <div className="space-y-1.5"><label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t.pickColor}</label><input type="color" value={customHex} onChange={(e) => setCustomHex(e.target.value)} className="w-12 h-12 rounded-xl border-4 border-slate-50 dark:border-slate-900 shadow-sm cursor-pointer" /></div>
                  <InputField label={t.hexCode} placeholder="#000000" value={customHex} onChange={setCustomHex} className="w-28" />
                  <InputField label={t.colorName} placeholder="Midnight Sea" value={customName} onChange={setCustomName} className="w-40" />
                  <button onClick={addCustomColor} className="h-[46px] px-8 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"><Plus className="w-4 h-4" /> {t.registerColor}</button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {palette.map(c => (
                  <button key={c.hex} onClick={() => setSelectedColor(c)} className={`group relative flex items-center gap-3 p-3 rounded-2xl border-2 transition-all duration-300 ${selectedColor.hex === c.hex ? 'border-blue-600 bg-white dark:bg-slate-800 shadow-xl scale-105' : 'border-transparent bg-slate-100/50 dark:bg-slate-900 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700'}`}>
                    <div className="w-8 h-8 rounded-full shadow-inner shrink-0 border border-black/5" style={{ backgroundColor: c.hex }} />
                    <div className="flex-1 min-w-0"><p className={`text-[9px] font-bold uppercase truncate ${selectedColor.hex === c.hex ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>{c.name}</p><p className="text-[8px] text-slate-400 font-mono">{c.hex.toUpperCase()}</p></div>
                    {selectedColor.hex === c.hex && <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-md"><Check className="w-3 h-3" /></div>}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between"><div className="flex items-center gap-3"><Layers className="w-5 h-5 text-blue-600" /><h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white">{t.assetVariants}</h3></div><button onClick={addVariant} className="px-8 py-3 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/10"><Plus className="w-4 h-4" /> {t.addVariant}</button></div>
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {variants.map(v => (
                    <motion.div key={v.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] p-8 grid grid-cols-12 gap-8 items-start hover:shadow-2xl hover:shadow-slate-200/40 transition-all duration-700">
                      <div className="col-span-12 md:col-span-2">
                        <SelectField 
                          label={t.sizeFit} 
                          options={["XS", "S", "M", "L", "XL", "Free Size"]} 
                          value={v.size}
                          onChange={(val: string) => setVariants(prev => prev.map(vt => vt.id === v.id ? { ...vt, size: val } : vt))}
                        />
                      </div>
                      <div className="col-span-12 md:col-span-5 space-y-3">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t.assignedColor}</label>
                        <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                          {palette.map(c => (
                            <button key={c.hex} onClick={() => updateVariantColor(v.id, c)} className={`w-8 h-8 rounded-full border-2 transition-all relative group/clr ${v.colorHex === c.hex ? 'border-blue-600 scale-110 shadow-md' : 'border-white dark:border-slate-900 hover:scale-110'}`} style={{ backgroundColor: c.hex }}>
                              {v.colorHex === c.hex && <Check className="w-3 h-3 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-md" />}
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 px-2"><p className="text-[10px] font-bold text-slate-900 dark:text-white uppercase">{v.color}</p><span className="text-[10px] text-slate-400 font-mono uppercase">{v.colorHex}</span></div>
                      </div>
                      <div className="col-span-12 md:col-span-2"><InputField label={t.units} type="number" placeholder="0" value={v.stock} onChange={(val: string) => setVariants(prev => prev.map(vt => vt.id === v.id ? { ...vt, stock: parseInt(val) || 0 } : vt))} /></div>
                      <div className="col-span-12 md:col-span-2">
                        <InputField 
                          label={t.customSku} 
                          placeholder={t.optional} 
                          value={v.sku}
                          onChange={(val: string) => setVariants(prev => prev.map(vt => vt.id === v.id ? { ...vt, sku: val } : vt))}
                        />
                      </div>
                      <div className="col-span-12 md:col-span-1 flex justify-end pt-8"><button onClick={() => setVariants(variants.filter(vt => vt.id !== v.id))} className="p-3 text-slate-300 hover:text-rose-500 bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all shadow-sm"><Trash2 className="w-4 h-4" /></button></div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-10 border-t border-slate-50 dark:border-slate-900 pt-12">
              <div className="col-span-12 lg:col-span-12 space-y-6">
                <div className="flex items-center gap-3"><Globe className="w-5 h-5 text-blue-600" /><h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white">{t.narrativeSeo}</h3></div>
                <div className="grid grid-cols-1 gap-6">
                  <div className="relative group">
                    <InputField label={t.urlSlug} placeholder="Generating..." value={slug} onChange={(v: string) => { setSlug(v); setIsSlugModified(true); }} suffix=".lumina" />
                    {!isSlugModified && <span className="absolute top-[1px] right-2 text-[8px] font-bold text-emerald-500 uppercase">Auto</span>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">{t.editorialNarrative}</label>
                    <textarea 
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px] px-6 py-5 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all placeholder:text-slate-300 dark:text-white min-h-[160px] custom-scrollbar" 
                      placeholder={t.describeCraft} 
                      value={editorialDescription}
                      onChange={(e) => setEditorialDescription(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-10 py-8 border-t border-slate-50 dark:border-slate-900 bg-white dark:bg-slate-950 flex items-center justify-between shrink-0 sticky bottom-0 z-50">
          <button onClick={onClose} className="px-8 py-4 bg-slate-50 dark:bg-slate-900 text-slate-500 text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">{t.discard}</button>
          <div className="flex items-center gap-4">
            <button className="px-8 py-4 text-slate-900 dark:text-white text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition-all">{t.saveDraft}</button>
            <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-3 px-12 py-4 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50 group">
              {isSaving ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <>{initialData ? t.updateAsset : t.registerAssetModal} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
            </button>
          </div>
          <ManageCategoriesModal
            isOpen={isManageCategoriesOpen}
            onClose={() => setIsManageCategoriesOpen(false)}
            onRefresh={refreshCategories}
          />
        </div>
      </motion.div>
    </div>
  );
};

const AssetIntelligence = ({ isOpen, onClose, product }: { isOpen: boolean, onClose: () => void, product: Product | null }) => {
  const { language } = useLanguageStore();
  const t = translations[language];

  if (!product) return null;
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[150]" />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-full w-full max-w-xl bg-white dark:bg-slate-900 shadow-2xl z-[160] overflow-y-auto flex flex-col border-l dark:border-slate-800">
            <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20"><Sparkles className="w-6 h-6 text-white" /></div>
                <div><h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tighter">{t.assetIntelligence}</h2><p className="text-xs text-slate-400 font-medium">{product.name} — {product.sku}</p></div>
              </div>
              <button onClick={onClose} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-slate-100 transition-all"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="p-10 space-y-10 flex-1">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[32px] space-y-4 border border-slate-100 dark:border-slate-800"><Flame className="w-6 h-6 text-rose-500" /><div className="space-y-1"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.velocity}</p><p className="text-2xl font-black text-slate-900 dark:text-white">8.4x</p></div></div>
                <div className="bg-emerald-50 dark:bg-emerald-500/10 p-6 rounded-[32px] space-y-4 border border-emerald-100 dark:border-emerald-500/20"><Target className="w-6 h-6 text-emerald-600" /><div className="space-y-1"><p className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest">{t.sellThrough}</p><p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">92%</p></div></div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 space-y-4">
                 <div className="flex items-center gap-3"><Zap className="w-5 h-5 text-amber-500" /><h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-900 dark:text-white">{t.aiStrategy}</h4></div>
                 <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic">"{t.recommendation} <span className="text-slate-900 dark:text-white font-bold not-italic">"{product.subcategory}"</span>. {t.stockAlloc} <span className="text-slate-900 dark:text-white font-bold not-italic">{product.fitProfile}</span> {t.upcomingSeason}"</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default function ProductsPage() {
  const { language } = useLanguageStore();
  const t = translations[language];
  const { format, formatAbbreviated } = useFormatCurrency();
  const { addNotification } = useNotificationStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [intelligenceProduct, setIntelligenceProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const dbProducts = await fetchProductsFromDb();
      if (dbProducts) {
        setProducts(dbProducts);
      } else {
        setProducts([]);
      }
    } catch (e) {
      console.error("Failed to connect to database:", e);
      toast.error("Database connection failed.");
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddOrUpdateProduct = async (
    newProduct: Product,
    variantsList?: Variant[],
    imagesList?: ProductImage[],
    activeToggles?: Record<string, boolean>
  ) => {
    const isEdit = !!editingProduct;
    try {
      await saveProductToDb(
        newProduct,
        variantsList || [{ id: "v1", size: "M", color: "Onyx Black", colorHex: "#000000", stock: newProduct.stock, sku: "", price: newProduct.price }],
        imagesList || [{ id: "img-default", url: newProduct.image, isPrimary: true }],
        activeToggles || { "Featured Product": false, "New Arrival": true, "Limited Edition": false, "Sustainable Certified": false, "Flash Sale": false }
      );
      
      await loadData();

      addNotification({
        title: isEdit ? "Produk Diperbarui" : "Produk Baru Terdaftar",
        description: `${newProduct.name} (${newProduct.sku}) telah ${isEdit ? "diperbarui" : "ditambahkan"} ke database.`,
        type: "SUCCESS",
        source: "Products"
      });
      
      toast.success(isEdit ? "Produk diperbarui di database." : "Produk berhasil disimpan ke database.");
      setEditingProduct(null);
    } catch (e) {
      console.error(e);
      toast.error("Gagal menyimpan ke database. Data disimpan secara lokal.");
      setProducts(prev => {
        const exists = prev.find(p => p.id === newProduct.id);
        if (exists) return prev.map(p => p.id === newProduct.id ? newProduct : p);
        return [newProduct, ...prev];
      });
    }
  };

  const handleAction = async (id: string, action: string) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    try {
      if (action === "Delete") { 
        const { data: imgData } = await supabase.from("product_images").select("image_url").eq("product_id", id);
        
        const { data: delData, error: delError } = await supabase.from("products").delete().eq("id", id).select();
        logDev("QUERY_RESULT delData", delData);
        logDev("QUERY_ERROR delError", delError);
        if (delError) throw delError;

        if (imgData && imgData.length > 0) {
          const pathsToDelete = imgData
            .map((img: any) => {
              const parts = img.image_url.split('/product_images/');
              return parts.length > 1 ? parts[1] : null;
            })
            .filter(Boolean) as string[];
          if (pathsToDelete.length > 0) {
            await supabase.storage.from("product_images").remove(pathsToDelete);
          }
        }

        await loadData();
        addNotification({
          title: "Produk Dihapus",
          description: `${product.name} telah dihapus dari database.`,
          type: "WARNING",
          source: "Products"
        });
        toast.error("Asset removed from database."); 
      }
      else if (action === "Duplicate") {
        const { data: vData, error: vError } = await supabase.from("product_variants").select("*, colors(*)").eq("product_id", id);
        logDev("QUERY_RESULT duplicate vData", vData);
        logDev("QUERY_ERROR duplicate vError", vError);
        if (vError) throw vError;

        const { data: imgData, error: imgError } = await supabase.from("product_images").select("*").eq("product_id", id);
        logDev("QUERY_RESULT duplicate imgData", imgData);
        logDev("QUERY_ERROR duplicate imgError", imgError);
        if (imgError) throw imgError;

        const copy: Product = { 
          ...product, 
          id: Math.random().toString(36).substr(2, 9), 
          name: `${product.name} (Copy)`, 
          sku: `${product.sku}-COPY` 
        };

        const mappedVariants: Variant[] = (vData || []).map((v, i) => ({
          id: `v-${i}`,
          size: v.size,
          color: v.colors?.name || "Onyx Black",
          colorHex: v.colors?.hex_code || "#000000",
          stock: v.stock,
          sku: v.custom_sku || "",
          price: product.price
        }));

        const mappedImages: ProductImage[] = (imgData || []).map((img, i) => ({
          id: `img-${i}`,
          url: img.image_url,
          isPrimary: img.is_primary
        }));

        const toggles = {
          "Featured Product": product.isFeatured || false,
          "New Arrival": product.isNewArrival || false,
          "Limited Edition": product.isLimitedEdition || false,
          "Sustainable Certified": product.isSustainableCertified || false,
          "Flash Sale": product.isFlashSale || false
        };

        await saveProductToDb(copy, mappedVariants, mappedImages, toggles);
        await loadData();

        addNotification({
          title: "Produk Diduplikasi",
          description: `Salinan dari ${product.name} telah disimpan ke database.`,
          type: "INFO",
          source: "Products"
        });
        toast.success("Asset duplicated in database.");
      } else if (action === "Archive") { 
        const { data: archData, error: archError } = await supabase.from("products").update({ status: 'archived', is_active: false }).eq("id", id).select();
        logDev("QUERY_RESULT archData", archData);
        logDev("QUERY_ERROR archError", archError);
        if (archError) throw archError;

        await loadData();
        addNotification({
          title: "Produk Diarsipkan",
          description: `${product.name} kini ditandai diarsipkan.`,
          type: "INFO",
          source: "Products"
        });
        toast.success("Asset archived in database."); 
      } else if (action === "Unarchive") { 
        const { data: archData, error: archError } = await supabase.from("products").update({ status: 'published', is_active: true }).eq("id", id).select();
        logDev("QUERY_RESULT archData", archData);
        logDev("QUERY_ERROR archError", archError);
        if (archError) throw archError;

        await loadData();
        addNotification({
          title: "Produk Diaktifkan",
          description: `${product.name} kini ditandai aktif kembali.`,
          type: "SUCCESS",
          source: "Products"
        });
        toast.success("Asset activated in database."); 
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to perform action in database. Executing locally.");
      if (action === "Delete") {
        setProducts(prev => prev.filter(p => p.id !== id));
      } else if (action === "Archive") {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, status: "Archived" } : p));
      } else if (action === "Unarchive") {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, status: "Published" } : p));
      }
    }
  };

  const filteredProducts = useMemo(() => products.filter(p => (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase())) && (filterStatus === "ALL" || p.status === filterStatus)), [products, searchQuery, filterStatus]);

  const inventoryValue = products.reduce((acc, p) => acc + (p.price * (p.stock || 0)), 0);

  return (
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-slate-950 p-6 md:p-8 max-w-[1600px] mx-auto space-y-8 font-sans selection:bg-blue-600 selection:text-white transition-colors">
      <AnimatePresence>
        {(isModalOpen || editingProduct) && <AddProductModal isOpen={true} onClose={() => { setIsModalOpen(false); setEditingProduct(null); }} onAddProduct={handleAddOrUpdateProduct} initialData={editingProduct} />}
      </AnimatePresence>
      <AssetIntelligence isOpen={!!intelligenceProduct} onClose={() => setIntelligenceProduct(null)} product={intelligenceProduct} />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-blue-600 rounded-full shadow-lg shadow-blue-600/20" />
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{t.inventoryTitle}</h1>
          </div>
          <p className="text-slate-400 dark:text-slate-500 font-medium text-sm max-w-lg leading-snug">{t.inventorySubtitle}</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-3 px-8 py-3.5 bg-blue-600 text-white text-[9px] font-black uppercase tracking-[0.15em] rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95 group">
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" /> {t.registerAsset}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: t.activeSku, value: products.length, icon: Layers, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10" },
          { label: t.inventoryValue, value: formatAbbreviated(inventoryValue), icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
          { label: t.lowStockAlerts, value: `${products.filter(p => p.stock < 10).length} ${t.alerts}`, subValue: `${products.filter(p => p.stock < 5).length} ${t.critical}`, icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-500/10" },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 shadow-sm hover:shadow-xl hover:shadow-blue-200/10 transition-all flex items-center justify-between group">
            <div className="space-y-1">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-xl font-black text-slate-900 dark:text-white group-hover:translate-x-1 transition-transform origin-left">{stat.value}</p>
                {stat.subValue && <span className="text-[8px] font-black text-rose-500 uppercase tracking-tight">{stat.subValue}</span>}
              </div>
            </div>
            <div className={`p-2.5 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="relative flex-1 group">
        <SearchIcon className="w-5 h-5 text-slate-300 dark:text-slate-700 absolute left-5 top-1/2 -translate-y-1/2 group-focus-within:text-blue-600 transition-colors" />
        <input 
          type="text" 
          placeholder={t.searchPlaceholder} 
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-14 pr-6 py-3.5 text-xs font-bold focus:outline-none focus:ring-[8px] focus:ring-blue-600/5 transition-all shadow-sm dark:text-white" 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Syncing Database...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[28px] space-y-3">
              <p className="text-sm font-bold text-slate-400">No products found</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredProducts.map(p => <ProductCard key={p.id} product={p} onEdit={() => setEditingProduct(p)} onAction={handleAction} onShowIntelligence={() => setIntelligenceProduct(p)} />)}
            </AnimatePresence>
          )}
        </div>
      )}
    </div>
  );
}

const ProductCard = forwardRef<
  HTMLDivElement,
  {
    product: Product;
    onEdit: () => void;
    onAction: (id: string, action: string) => void;
    onShowIntelligence: () => void;
  }
>(({ product, onEdit, onAction, onShowIntelligence }, ref) => {
  const { language } = useLanguageStore();
  const t = translations[language];
  const { format } = useFormatCurrency();

  const [showActions, setShowActions] = useState(false);
  const actionRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => { if (actionRef.current && !actionRef.current.contains(e.target as Node)) setShowActions(false); };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <motion.div ref={ref} layout initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[28px] p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 group transition-all duration-500 shadow-sm relative hover:shadow-xl hover:shadow-blue-200/10 w-full overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50/30 dark:bg-slate-800/10 rounded-tr-[28px] rounded-bl-[80px] pointer-events-none" />
      
      <div className="flex items-center gap-4 w-full md:w-auto">
        {/* Product Image */}
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden shrink-0 border border-slate-50 dark:border-slate-800 relative group/img shadow-sm bg-slate-50">
          <img src={product.image} className="w-full h-full object-cover transform group-hover/img:scale-110 transition-transform duration-700" />
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
            <Eye className="w-4 h-4 text-white" />
          </div>
        </div>
        
        {/* Mobile Title */}
        <div className="flex-1 md:hidden space-y-1">
          <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight leading-tight line-clamp-2">{product.name}</h2>
          <Badge variant={product.status === "Published" ? "emerald" : "zinc"}>{product.status}</Badge>
        </div>
      </div>

      <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-start md:items-center">
        {/* Info Section */}
        <div className="col-span-1 md:col-span-6 space-y-3">
          <div className="space-y-1 hidden md:block">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-tight">{product.name}</h2>
              <Badge variant={product.status === "Published" ? "emerald" : "zinc"}>{product.status}</Badge>
            </div>
            <div className="flex items-center gap-2.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              <span className="text-slate-900 dark:text-slate-300">{product.brand}</span>
              <div className="w-1 h-1 bg-slate-200 dark:bg-slate-800 rounded-full" />
              <span>{product.subcategory}</span>
              {product.fitProfile && (
                <>
                  <div className="w-1 h-1 bg-slate-200 dark:bg-slate-800 rounded-full" />
                  <span className="text-blue-600 font-black">{product.fitProfile}</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-6 pt-3 border-t border-slate-50 dark:border-slate-800">
            <div className="space-y-0.5">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{t.baseSku}</p>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">{product.sku}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{t.globalStock}</p>
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${product.stock < 10 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{product.stock} <span className="text-[10px] text-slate-400 font-medium">U</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Price Section */}
        <div className="col-span-1 md:col-span-3 space-y-1 md:border-l md:border-slate-100 dark:md:border-slate-800 md:pl-6 flex flex-col justify-center border-t border-slate-100 dark:border-slate-800 md:border-t-0 pt-3 md:pt-0">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{t.msrpPrice}</p>
          <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{format(product.price)}</p>
          {product.gsm && <p className="text-[8px] font-bold text-slate-400 uppercase">{product.gsm} {t.quality}</p>}
        </div>

        {/* Actions Section */}
        <div className="col-span-1 md:col-span-3 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t border-slate-100 dark:border-slate-800 md:border-t-0">
          <div className="flex items-center gap-2 relative" ref={actionRef}>
            <button onClick={onEdit} className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all shadow-sm active:scale-90" title={t.edit}>
              <Edit2 className="w-4 h-4" />
            </button>
            <button onClick={() => setShowActions(!showActions)} className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all shadow-sm active:scale-90">
              <MoreVertical className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {showActions && (
                <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute top-full right-0 mt-2 w-44 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl z-[100] overflow-hidden py-1.5 rounded-2xl">
                  {["Duplicate", product.status === "Archived" ? "Unarchive" : "Archive", "Delete"].map(action => (
                    <button key={action} onClick={() => { onAction(product.id, action); setShowActions(false); }} className={`w-full px-5 py-2.5 text-left text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${action === 'Delete' ? 'text-rose-500' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                      {action === "Duplicate" ? t.duplicate : action === "Archive" ? t.archive : action === "Unarchive" ? "Unarchive" : t.delete}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button onClick={onShowIntelligence} className="flex items-center gap-2 text-[9px] font-black text-slate-400 hover:text-blue-600 dark:text-slate-500 dark:hover:text-white uppercase tracking-[0.15em] transition-all group/view">
            {t.assetIntelligence} <ChevronRight className="w-4 h-4 group-hover/view:translate-x-1.5 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
});

ProductCard.displayName = "ProductCard";

// --- Modal: Category Manager ---

interface ManageCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

const ManageCategoriesModal = ({ isOpen, onClose, onRefresh }: ManageCategoriesModalProps) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatSlug, setNewCatSlug] = useState("");
  const [newCatImage, setNewCatImage] = useState<File | null>(null);
  
  // Edit state
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editImage, setEditImage] = useState<File | null>(null);
  const [optimisticPreview, setOptimisticPreview] = useState<string | null>(null);

  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (data) setCategories(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const validateImage = (file: File): string | null => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedMimeTypes.includes(file.type)) {
      return "Format file tidak didukung. Harap upload gambar JPG, PNG, WEBP, atau GIF.";
    }
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return "Ukuran gambar terlalu besar. Maksimal 5MB.";
    }
    return null;
  };

  const checkDuplicateSlug = (slug: string, excludeId?: string): boolean => {
    const normSlug = slug.trim().toLowerCase();
    return categories.some(c => c.slug.toLowerCase().trim() === normSlug && c.id !== excludeId);
  };

  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new window.Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          
          if (width > 1600) {
            height = Math.round((height * 1600) / width);
            width = 1600;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Failed to get canvas context"));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error("Canvas export failed"));
            },
            "image/webp",
            0.85
          );
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      toast.error("Nama kategori tidak boleh kosong.");
      return;
    }

    const slug = newCatSlug.trim() || newCatName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    if (checkDuplicateSlug(slug)) {
      toast.error("Slug kategori sudah digunakan. Harap gunakan slug unik.");
      return;
    }

    let compressedBlob: Blob | null = null;
    if (newCatImage) {
      const valError = validateImage(newCatImage);
      if (valError) {
        toast.error(valError);
        return;
      }
      setIsUploading(true);
      try {
        compressedBlob = await compressImage(newCatImage);
      } catch (err: any) {
        toast.error("Gagal kompresi gambar: " + err.message);
        setIsUploading(false);
        return;
      }
    } else {
      setIsUploading(true);
    }

    let insertedId: string | null = null;
    let filePath: string | null = null;

    try {
      // Step 1: Insert category
      const { data: inserted, error: insertError } = await supabase
        .from("categories")
        .insert({ name: newCatName.trim(), slug })
        .select()
        .single();

      if (insertError) throw insertError;
      insertedId = inserted.id;

      if (compressedBlob && insertedId) {
        filePath = `categories/${insertedId}/cover.webp`;

        // Step 2: Upload to storage (upsert if exists)
        const { error: uploadError } = await supabase.storage
          .from("category_images")
          .upload(filePath, compressedBlob, { upsert: true, contentType: "image/webp" });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("category_images")
          .getPublicUrl(filePath);

        const finalImageUrl = publicUrlData.publicUrl;

        // Step 3: Update DB with public URL
        const { error: updateError } = await supabase
          .from("categories")
          .update({ image_url: finalImageUrl })
          .eq("id", insertedId);

        if (updateError) throw updateError;
      }

      setNewCatName("");
      setNewCatSlug("");
      setNewCatImage(null);
      setOptimisticPreview(null);
      await fetchCategories();
      onRefresh();
      toast.success("Category added successfully.");
    } catch (err: any) {
      // Rollback handling: delete orphan uploaded file and inserted category row
      if (filePath) {
        await supabase.storage.from("category_images").remove([filePath]);
      }
      if (insertedId) {
        await supabase.from("categories").delete().eq("id", insertedId);
      }
      toast.error("Failed to add category: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveEdit = async (cat: any) => {
    if (!editName.trim()) {
      toast.error("Nama kategori tidak boleh kosong.");
      return;
    }

    const slug = editSlug.trim() || editName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    if (checkDuplicateSlug(slug, cat.id)) {
      toast.error("Slug kategori sudah digunakan. Harap gunakan slug unik.");
      return;
    }

    let compressedBlob: Blob | null = null;
    if (editImage) {
      const valError = validateImage(editImage);
      if (valError) {
        toast.error(valError);
        return;
      }
      setIsSavingEdit(true);
      try {
        compressedBlob = await compressImage(editImage);
      } catch (err: any) {
        toast.error("Gagal kompresi gambar: " + err.message);
        setIsSavingEdit(false);
        return;
      }
    } else {
      setIsSavingEdit(true);
    }

    let filePath: string | null = null;
    let didUpload = false;

    try {
      let finalImageUrl = cat.image_url;

      if (compressedBlob) {
        filePath = `categories/${cat.id}/cover.webp`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from("category_images")
          .upload(filePath, compressedBlob, { upsert: true, contentType: "image/webp" });

        if (uploadError) throw uploadError;
        didUpload = true;

        const { data: publicUrlData } = supabase.storage
          .from("category_images")
          .getPublicUrl(filePath);

        finalImageUrl = publicUrlData.publicUrl;
      }

      // Update name, slug, image_url
      const { error: updateError } = await supabase
        .from("categories")
        .update({ name: editName.trim(), slug, image_url: finalImageUrl })
        .eq("id", cat.id);

      if (updateError) throw updateError;

      setEditingCatId(null);
      setEditImage(null);
      setOptimisticPreview(null);
      await fetchCategories();
      onRefresh();
      toast.success("Category updated successfully.");
    } catch (err: any) {
      // Rollback file if upload succeeded but database write failed
      if (didUpload && filePath && !cat.image_url) {
        await supabase.storage.from("category_images").remove([filePath]);
      }
      toast.error("Failed to update category: " + err.message);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    try {
      const { count, error: countError } = await supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("category_id", id);

      if (countError) throw countError;

      const productCount = count || 0;
      let confirmMsg = `Are you sure you want to delete the category "${name}"?`;
      if (productCount > 0) {
        confirmMsg = `Kategori ini memiliki ${productCount} produk. Menghapusnya akan memutus relasi produk tersebut. Lanjutkan?`;
      }

      if (!confirm(confirmMsg)) return;

      // Clean up storage files if any
      const { data: cat } = await supabase.from("categories").select("image_url").eq("id", id).single();
      if (cat?.image_url) {
        const parts = cat.image_url.split('/category_images/');
        if (parts.length > 1) {
          const filePath = parts[1];
          await supabase.storage.from("category_images").remove([filePath]);
        }
      }

      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;

      await fetchCategories();
      onRefresh();
      toast.success("Category deleted successfully.");
    } catch (err: any) {
      toast.error("Failed to delete category: " + err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Manage Categories</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {/* Add Category Form */}
          <form onSubmit={handleAddCategory} className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Add New Category</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-tight block mb-1">Name</label>
                <input
                  type="text"
                  placeholder="e.g. Streetwear"
                  value={newCatName}
                  onChange={(e) => {
                    setNewCatName(e.target.value);
                    setNewCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                  }}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-tight block mb-1">Slug</label>
                <input
                  type="text"
                  placeholder="streetwear"
                  value={newCatSlug}
                  onChange={(e) => setNewCatSlug(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none dark:text-white"
                  required
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              {optimisticPreview && (
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 relative">
                  <img src={optimisticPreview} className="w-full h-full object-cover" alt="New Upload Preview" />
                </div>
              )}
              <div className="flex-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-tight block mb-1">Cover Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    if (file) {
                      const err = validateImage(file);
                      if (err) {
                        toast.error(err);
                        return;
                      }
                      setNewCatImage(file);
                      setOptimisticPreview(URL.createObjectURL(file));
                    }
                  }}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-blue-50 dark:file:bg-slate-800 file:text-blue-700 dark:file:text-white hover:file:bg-blue-100 dark:hover:file:bg-slate-700"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isUploading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold uppercase tracking-widest text-[9px] py-2.5 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Category"
              )}
            </button>
          </form>

          {/* List of existing categories */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Existing Categories</h4>
            {loading ? (
              <div className="text-center py-6 text-xs text-slate-400">Loading categories...</div>
            ) : categories.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">No categories created yet.</div>
            ) : (
              <div className="space-y-2">
                {categories.map((cat) => (
                  <div key={cat.id} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                    {editingCatId === cat.id ? (
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex-shrink-0 relative">
                            <img
                              src={optimisticPreview || cat.image_url || getCategoryFallbackImage(cat.name, cat.slug)}
                              alt="Optimistic Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[8px] font-bold text-slate-500 uppercase tracking-tight block mb-0.5">Name</label>
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => {
                                  setEditName(e.target.value);
                                  setEditSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                                }}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-bold focus:outline-none dark:text-white"
                                required
                              />
                            </div>
                            <div>
                              <label className="text-[8px] font-bold text-slate-500 uppercase tracking-tight block mb-0.5">Slug</label>
                              <input
                                type="text"
                                value={editSlug}
                                onChange={(e) => setEditSlug(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-bold focus:outline-none dark:text-white"
                                required
                              />
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="text-[8px] font-bold text-slate-500 uppercase tracking-tight block mb-1">Replace Image</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              if (file) {
                                const err = validateImage(file);
                                if (err) {
                                  toast.error(err);
                                  return;
                                }
                                setEditImage(file);
                                setOptimisticPreview(URL.createObjectURL(file));
                              }
                            }}
                            className="w-full text-xs text-slate-400 file:mr-3 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[9px] file:font-black file:uppercase file:bg-blue-50 dark:file:bg-slate-800 file:text-blue-700 dark:file:text-white hover:file:bg-blue-100"
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-1.5 border-t border-slate-100 dark:border-slate-850">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCatId(null);
                              setEditImage(null);
                              setOptimisticPreview(null);
                            }}
                            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-850 text-slate-500 hover:bg-slate-205 rounded-lg text-[9px] font-bold uppercase tracking-wider"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(cat)}
                            disabled={isSavingEdit}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 disabled:opacity-50"
                          >
                            {isSavingEdit ? (
                              <>
                                <span className="w-2.5 h-2.5 border border-white/20 border-t-white rounded-full animate-spin inline-block" />
                                Saving...
                              </>
                            ) : (
                              "Save"
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex-shrink-0 relative">
                            <img
                              src={cat.image_url ? `${cat.image_url}?v=${cat.updated_at ? new Date(cat.updated_at).getTime() : Date.now()}` : getCategoryFallbackImage(cat.name, cat.slug)}
                              alt={cat.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white">{cat.name}</div>
                            <div className="text-[9px] text-slate-400">Slug: {cat.slug}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCatId(cat.id);
                              setEditName(cat.name);
                              setEditSlug(cat.slug);
                              setEditImage(null);
                              setOptimisticPreview(null);
                            }}
                            className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-blue-600 hover:text-blue-700 rounded-xl transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                            className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 hover:text-rose-700 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

