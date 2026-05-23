"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import {
  Filter,
  Search as SearchIcon,
  Grid,
  List,
  ChevronDown,
  ShoppingCart,
  Eye,
  Star,
  Zap,
  TrendingUp,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { formatIDR } from "../../components/ui/utils";
import { useCart } from "../../../lib/CartContext";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

function ProductCountdown({ endAt }: { endAt: string | null }) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    if (!endAt) return;
    const interval = setInterval(() => {
      const diff = new Date(endAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Expired");
        clearInterval(interval);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft(
          `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
        );
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [endAt]);

  if (!endAt || timeLeft === "Expired") return null;

  return (
    <div className="bg-black/80 backdrop-blur-md text-white text-[10px] font-mono px-3 py-1.5 rounded-full flex items-center gap-1.5 mt-2 shadow border border-white/10 w-fit">
      <Zap size={10} className="text-yellow-400 fill-yellow-400 animate-pulse" />
      <span>{timeLeft}</span>
    </div>
  );
}

function ProductDisplayCard({
  product,
  badge,
  badgeColor = "bg-orange-500",
}: {
  product: any;
  badge?: string;
  badgeColor?: string;
}) {
  const { addToCart } = useCart();
  const { user } = useUser();
  const router = useRouter();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error("Silakan Login", {
        description: "Anda harus login untuk belanja",
      });
      router.push("/sign-in");
      return;
    }
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category || "",
      images: [product.image || ""],
    });
    toast.success("Berhasil", {
      description: `${product.name} masuk keranjang`,
    });
  };

  return (
    <div className="group relative">
      <div className="bg-white rounded-[32px] border border-zinc-100 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col h-full">
        {/* Image Container */}
        <div className="relative aspect-[4/5] bg-zinc-50 overflow-hidden">
          {/* Badges */}
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
            {(badge || product.sales_count > 50) && (
              <div
                className={`${badgeColor} text-white text-[9px] font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 uppercase tracking-widest animate-in slide-in-from-left duration-500`}
              >
                <Star size={10} fill="currentColor" /> {badge || "Best Seller"}
              </div>
            )}
            {product.is_flash_sale && (
              <div className="bg-red-500 text-white text-[9px] font-black px-3 py-1.5 rounded-full shadow-lg shadow-red-200 flex items-center gap-1 uppercase tracking-widest">
                <Zap size={10} fill="currentColor" /> Flash Sale {product.discountPercent > 0 ? `${product.discountPercent}% OFF` : ""}
              </div>
            )}
            {product.is_flash_sale && product.flashSaleEndAt && (
              <ProductCountdown endAt={product.flashSaleEndAt} />
            )}
          </div>

          <Link
            href={`/product/${product.id}`}
            className="block w-full h-full p-8 group-hover:scale-110 transition-transform duration-700"
          >
            <img
              src={product.image}
              className="w-full h-full object-contain"
              alt={product.name}
            />
          </Link>

        </div>

        {/* Content Container */}
        <div className="p-6 space-y-4 flex-1 flex flex-col">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">
                {product.category}
              </span>
              {product.totalReviews > 0 && (
                <div className="flex items-center gap-1 text-orange-400">
                  <Star size={10} fill="currentColor" />
                  <span className="text-[10px] font-black">
                    {product.rating}
                  </span>
                </div>
              )}
            </div>
            <Link href={`/product/${product.id}`}>
              <h3 className="text-lg font-black text-black leading-tight hover:text-orange-500 transition-colors line-clamp-1">
                {product.name}
              </h3>
            </Link>
          </div>

          <div className="pt-4 border-t border-zinc-50 flex flex-col gap-1">
            {product.is_flash_sale && product.originalPrice > 0 && (
              <span className="text-[11px] font-bold text-zinc-400 line-through">
                {formatIDR(product.originalPrice)}
              </span>
            )}
            <div className="flex items-center justify-between">
              <span className={`text-xl font-black ${product.is_flash_sale ? "text-red-500" : "text-black"}`}>
                {formatIDR(product.price)}
              </span>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">
                  Ready Stock
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex gap-2 mt-auto">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-black text-white h-12 rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all active:scale-95 shadow-lg shadow-black/5"
            >
              <ShoppingCart size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Add to Cart
              </span>
            </button>
            <Link
              href={`/product/${product.id}`}
              className="w-12 h-12 bg-zinc-100 text-black rounded-2xl flex items-center justify-center hover:bg-zinc-200 transition-all active:scale-95"
            >
              <Eye size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StoreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { addToCart } = useCart();

  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedColor, setSelectedColor] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState(50000000); // Max price for filter

  const [colors, setColors] = useState<any[]>([
    { name: "All", hex: null },
    { name: "Black", hex: "#000000" },
    { name: "White", hex: "#ffffff" },
    { name: "Beige", hex: "#f5f5dc" },
    { name: "Brown", hex: "#8b4513" },
    { name: "Navy", hex: "#000080" },
    { name: "Cream", hex: "#fffdd0" },
  ]);

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      try {
        // Fetch Categories
        const { data: catsData } = await supabase.from("categories").select("name");
        if (catsData) {
          setCategories(["All", ...catsData.map(c => c.name)]);
        }

        // Fetch Colors
        const { data: colorsData } = await supabase.from("colors").select("name, hex_code");
        if (colorsData && colorsData.length > 0) {
          setColors([{ name: "All", hex: null }, ...colorsData.map(c => ({ name: c.name, hex: c.hex_code }))]);
        }

        // Fetch Metrics
        const { data: metricsData } = await supabase.from("product_metrics").select("*");
        const metricsMap = new Map();
        if (metricsData) {
          metricsData.forEach((m: any) => metricsMap.set(m.product_id, m));
        }

        // Fetch Products with category, images and variants (colors)
        const { data: productsData, error } = await supabase
          .from("products")
          .select(`
            *,
            category:categories(name),
            product_images(image_url, is_primary),
            product_variants(*, colors(*))
          `)
          .eq("status", "published");

        if (error) throw error;

        if (productsData) {
          const mapped = productsData.map((p) => {
            const primaryImage = p.product_images?.find((img: any) => img.is_primary)?.image_url 
              || p.product_images?.[0]?.image_url 
              || p.image_url
              || "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800";

            return {
              id: p.id,
              name: p.name,
              sku: p.sku,
              category: p.category?.name || "Pakaian Atasan",
              description: p.editorial_narrative || "Produk berkualitas tinggi dari Lumina.",
              price: Number(p.discount_price) > 0 ? Number(p.discount_price) : (Number(p.base_price) || 0),
              discountPrice: Number(p.discount_price) || 0,
              image: primaryImage,
              is_flash_sale: p.is_flash_sale || false,
              discountPercent: p.discount_percent || 0,
              originalPrice: Number(p.original_price) || 0,
              flashSaleEndAt: p.flash_sale_end_at || null,
              rating: Number(metricsMap.get(p.id)?.avg_rating) || 0,
              totalReviews: Number(metricsMap.get(p.id)?.total_reviews) || 0,
              sales_count: Number(metricsMap.get(p.id)?.total_sold) || 0,
              weightedScore: Number(metricsMap.get(p.id)?.weighted_score) || 0,
              created_at: p.created_at,
              // Map all colors this product has in its variants
              colorsList: p.product_variants?.map((v: any) => v.colors?.name).filter(Boolean) || []
            };
          });

          setProducts(mapped);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();

    // Subscribe to realtime updates for products
    const channel = supabase.channel('realtime-store')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchProducts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    let result = [...products];

    // Search Filter
    if (searchQuery) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Category Filter
    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Color Filter
    if (selectedColor !== "All") {
      result = result.filter(
        (p) => p.colorsList && p.colorsList.some((col: string) => col.toLowerCase() === selectedColor.toLowerCase()),
      );
    }

    // Price Filter
    result = result.filter(
      (p) => typeof p.price === "number" && p.price <= priceRange,
    );

    // Sorting
    switch (sortBy) {
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        break;
      case "price_low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "best_seller":
        result.sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0));
        break;
      case "rating":
        result.sort((a, b) => {
          const ratingDiff = (b.rating || 0) - (a.rating || 0);
          if (ratingDiff !== 0) return ratingDiff;
          return (b.totalReviews || 0) - (a.totalReviews || 0);
        });
        break;
    }

    console.log("All Products:", products);
    console.log("Filtered Products:", result);
    setFilteredProducts(result);
  }, [
    products,
    searchQuery,
    selectedCategory,
    selectedColor,
    sortBy,
    priceRange,
  ]);

  const handleAddToCart = (product: any) => {
    if (!isLoaded) return;
    if (!user) {
      toast.error("Silakan Login", {
        description: "Anda harus login untuk belanja",
      });
      router.push("/sign-in");
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category || "",
      images: [product.image || ""],
    });
    toast.success("Berhasil", {
      description: `${product.name} masuk keranjang`,
    });
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] pb-20">
      {/* Header / Search Summary */}
      <div className="bg-white border-b border-zinc-100 pt-15 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-5xl font-black text-black tracking-tighter">
                Lumina <span className="text-zinc-300">Store</span>
              </h1>
              <p className="text-zinc-500 font-medium">
                Jelajahi koleksi fashion eksklusif kami
              </p>
            </div>

            <div className="flex items-center gap-4 bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">
                  Total Produk
                </span>
                <span className="text-xl font-black text-black">
                  {filteredProducts.length}
                </span>
              </div>
              <div className="w-px h-10 bg-zinc-200 mx-2"></div>
              <SearchIcon className="text-zinc-300" size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 flex flex-col gap-8 lg:gap-10 shrink-0 w-full overflow-hidden">
            {/* Search within store */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <SearchIcon size={12} /> Cari Produk
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nama produk..."
                className="w-full bg-white border border-zinc-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
              />
            </div>

            {/* Category Filter */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Tag size={12} /> Kategori
              </label>
              <div className="flex overflow-x-auto lg:flex-col gap-2 max-h-80 lg:overflow-y-auto pr-2 pb-2 lg:pb-0 scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent -mx-6 px-6 lg:mx-0 lg:px-0">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`shrink-0 text-left px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      selectedCategory === cat
                        ? "bg-black text-white shadow-lg shadow-black/10 scale-105"
                        : "text-zinc-500 hover:bg-zinc-100"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Filter */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-tr from-orange-400 to-rose-400"></div>{" "}
                Warna
              </label>
              <div className="flex overflow-x-auto gap-3 pb-2 -mx-6 px-6 lg:mx-0 lg:px-0 lg:pb-0 scrollbar-hide">
                {colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`group relative flex flex-col items-center gap-2 transition-all ${
                      selectedColor === color.name
                        ? "scale-110"
                        : "hover:scale-105"
                    }`}
                    title={color.name}
                  >
                    <div
                      className={`w-8 h-8 rounded-full border-2 transition-all shadow-sm ${
                        selectedColor === color.name
                          ? "border-black scale-110 shadow-md"
                          : "border-zinc-100 group-hover:border-zinc-300"
                      }`}
                      style={{
                        backgroundColor: color.hex || "transparent",
                        backgroundImage:
                          color.name === "All"
                            ? "linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 50%, #ccc 50%, #ccc 75%, transparent 75%, transparent)"
                            : "none",
                        backgroundSize: "4px 4px",
                      }}
                    />
                    <span
                      className={`text-[9px] font-black uppercase tracking-tighter transition-colors ${
                        selectedColor === color.name
                          ? "text-black"
                          : "text-zinc-400"
                      }`}
                    >
                      {color.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <TrendingUp size={12} /> Harga Maksimal
              </label>
              <input
                type="range"
                min="0"
                max="50000000"
                step="100000"
                value={priceRange}
                onChange={(e) => setPriceRange(parseInt(e.target.value))}
                className="w-full accent-black"
              />
              <div className="flex justify-between text-[10px] font-bold text-zinc-400">
                <span>Rp 0</span>
                <span>{formatIDR(priceRange)}</span>
              </div>
            </div>
          </aside>

          {/* Main Grid */}
          <main className="flex-1 space-y-20">
            {/* Sort Bar & Main Products */}
            <div className="space-y-8">
              <div className="flex items-center justify-between bg-white border border-zinc-100 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-6">
                  <button className="flex items-center gap-2 text-xs font-black text-black">
                    <Grid size={16} /> All Products
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">
                    Urutkan:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-zinc-50 border-none text-xs font-bold rounded-lg px-4 py-2 focus:ring-0 cursor-pointer"
                  >
                    <option value="newest">Terbaru</option>
                    <option value="best_seller">Paling Laris</option>
                    <option value="rating">Rating Tertinggi</option>
                    <option value="price_low">Harga Terendah</option>
                    <option value="price_high">Harga Tertinggi</option>
                  </select>
                </div>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="aspect-[3/4] bg-zinc-50 rounded-[32px] animate-pulse"
                    ></div>
                  ))}
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredProducts.map((product) => (
                    <ProductDisplayCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-[32px] p-20 text-center border border-zinc-100">
                  <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-300">
                    <SearchIcon size={40} />
                  </div>
                  <h2 className="text-2xl font-black text-black mb-2">
                    Produk Tidak Ditemukan
                  </h2>
                  <p className="text-zinc-500 max-w-xs mx-auto text-sm font-medium">
                    Maaf, kami tidak menemukan produk yang Anda cari. Coba
                    gunakan kata kunci lain.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("All");
                      setSelectedColor("All");
                      setPriceRange(50000000);
                    }}
                    className="mt-8 text-sm font-black uppercase tracking-widest text-black underline hover:opacity-50 transition"
                  >
                    Reset Filter
                  </button>
                </div>
              )}
            </div>

            {/* COLLECTION BANNERS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-zinc-100">
              {/* NEW ARRIVALS BANNER */}
              <div className="relative group overflow-hidden rounded-[40px] h-[400px] bg-zinc-900">
                <img
                  src="https://i.pinimg.com/736x/8e/6c/a2/8e6ca29c22eafdd62edc8a28730d0733.jpg"
                  className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000"
                  alt="New Arrivals"
                />
                <div className="absolute inset-0 p-10 flex flex-col justify-end">
                  <div className="space-y-2">
                    <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black px-4 py-1.5  rounded-full uppercase tracking-widest border border-white/20">
                      Summer 2026
                    </span>
                    <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none mt-3">
                      New Fashion Arrivals
                    </h2>
                    <p className="text-white/60 text-sm font-medium max-w-xs">
                      Koleksi terbaru yang baru saja hadir minggu ini dengan
                      gaya modern minimalis.
                    </p>
                  </div>
                  <Link
                    href="/store/new-arrivals"
                    className="mt-8 bg-white text-black h-14 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs hover:bg-zinc-100 transition-all shadow-2xl"
                  >
                    Show Details{" "}
                    <ChevronDown className="-rotate-90" size={16} />
                  </Link>
                </div>
              </div>

              {/* LUXURY BANNER */}
              <div className="relative group overflow-hidden rounded-[40px] h-[400px] bg-zinc-900">
                <img
                  src="https://i.pinimg.com/736x/97/56/87/97568796c3268b0d0712dcec903bb61e.jpg"
                  className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000"
                  alt="Timeless Luxury"
                />
                <div className="absolute inset-0 p-10 flex flex-col justify-end">
                  <div className="space-y-2">
                    <span className="bg-amber-500/20 backdrop-blur-md text-amber-500 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-amber-500/20">
                      Private Selection
                    </span>
                    <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none italic mt-3">
                      Timeless Luxury
                    </h2>
                    <p className="text-white/60 text-sm font-medium max-w-xs">
                      Barang-barang premium yang tidak pernah kehilangan nilai
                      dan gaya untuk gaya hidup jetset.
                    </p>
                  </div>
                  <Link
                    href="/store/timeless-luxury"
                    className="mt-8 bg-gradient-to-r from-amber-600 to-yellow-500 text-white h-14 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs hover:opacity-90 transition-all shadow-2xl shadow-amber-900/20"
                  >
                    Show Details{" "}
                    <ChevronDown className="-rotate-90" size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default function StorePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
        </div>
      }
    >
      <StoreContent />
    </Suspense>
  );
}
