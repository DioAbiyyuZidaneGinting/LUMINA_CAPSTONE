"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useCart } from "../../../lib/CartContext";
import { toast } from "sonner";
import { 
  ChevronRight, 
  ShoppingBag, 
  Clock, 
  Timer, 
  TrendingDown, 
  Zap,
  ArrowRight,
  Eye,
  ShoppingCart
} from "lucide-react";
import { formatIDR } from "../../components/ui/utils";
import { supabase } from "../../../lib/supabase";

export default function FlashSalePage() {
  const { user, isLoaded } = useUser();
  const { addToCart } = useCart();
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const fetchFlashSales = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(name),
          product_images(image_url, is_primary)
        `)
        .eq("status", "published")
        .eq("is_flash_sale", true);

      if (error) throw error;

      if (data) {
        const mapped = data.map((p) => {
          const primaryImage = p.product_images?.find((img: any) => img.is_primary)?.image_url 
            || p.product_images?.[0]?.image_url 
            || p.image_url
            || "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800";

          return {
            id: p.id,
            name: p.name,
            sku: p.sku,
            category: p.category?.name || "",
            description: p.editorial_narrative || "Produk promo flash sale dari Lumina.",
            price: Number(p.discount_price) > 0 ? Number(p.discount_price) : (Number(p.base_price) || 0),
            original_price: Number(p.original_price) || Number(p.base_price) || 0,
            discount_price: Number(p.discount_price) || 0,
            discount_percent: p.discount_percent || 0,
            image: primaryImage,
            is_flash_sale: p.is_flash_sale || false,
            flash_sale_end_at: p.flash_sale_end_at || null,
          };
        });
        setProducts(mapped);
      }
    } catch (e) {
      console.error("Failed to load flash sale products:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFlashSales();

    const channel = supabase.channel('realtime-sales')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchFlashSales();
      })
      .subscribe();

    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(timer);
    };
  }, []);

  // Filter out any flash sale items that have expired
  const activeProducts = products.filter(p => {
    if (!p.flash_sale_end_at) return true;
    return new Date(p.flash_sale_end_at).getTime() > now;
  });

  useEffect(() => {
    if (activeProducts.length > 0) {
      const firstProduct = activeProducts[0];
      if (firstProduct.flash_sale_end_at) {
        const diff = new Date(firstProduct.flash_sale_end_at).getTime() - now;
        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff / (1000 * 60)) % 60);
          const seconds = Math.floor((diff / 1000) % 60);
          setTimeLeft({ hours, minutes, seconds });
          return;
        }
      }
    }
    setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
  }, [activeProducts, now]);

  const handleBuyNow = (product: any) => {
    if (!isLoaded) return;
    
    if (!user) {
      toast.error("Silakan Login", {
        description: "Anda harus login untuk melakukan pembelian.",
      });
      router.push("/sign-in");
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.discount_price || product.price,
      category: product.category || "",
      images: [product.image || ""],
    });

    toast.success("Berhasil ditambahkan", {
      description: "Produk berhasil ditambahkan ke keranjang",
    });
    
    router.push("/cart");
  };

  const heroProduct = activeProducts[0];
  const gridProducts = activeProducts.slice(1);

  return (
    <div className="min-h-screen bg-white pb-20 pt-10">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl md:text-5xl font-black text-black tracking-tighter">Flash <span className="text-red-500">Sale</span></h1>
              <div className="bg-red-500 text-white p-2 rounded-xl animate-pulse">
                <Zap size={24} fill="currentColor" />
              </div>
            </div>
            <p className="text-zinc-500 font-medium">Penawaran spesial dengan diskon terbatas untuk waktu yang singkat.</p>
          </div>

          {/* Countdown Timer */}
          {activeProducts.length > 0 && (
            <div className="flex gap-4">
              {[
                { label: "JAM", value: timeLeft.hours },
                { label: "MENIT", value: timeLeft.minutes },
                { label: "DETIK", value: timeLeft.seconds }
              ].map((unit, i) => (
                <div key={i} className="flex flex-col items-center bg-[#fcfcfc] border border-zinc-100 rounded-[24px] w-20 py-4 shadow-xl shadow-zinc-100/50">
                  <span className="text-2xl font-black text-black tabular-nums">
                    {unit.value.toString().padStart(2, '0')}
                  </span>
                  <span className="text-[10px] font-black text-zinc-300 tracking-widest mt-1">{unit.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
          </div>
        ) : activeProducts.length === 0 ? (
          <div className="bg-[#fcfcfc] rounded-[40px] border border-zinc-100 p-20 text-center shadow-sm">
            <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-300">
              <Zap size={40} />
            </div>
            <h2 className="text-2xl font-black text-black mb-2">
              Tidak Ada Flash Sale Aktif
            </h2>
            <p className="text-zinc-500 max-w-sm mx-auto text-sm font-medium">
              Saat ini tidak ada promo flash sale yang sedang berlangsung. Pantau terus halaman ini untuk promo menarik berikutnya!
            </p>
            <Link
              href="/store"
              className="mt-8 inline-flex items-center justify-center bg-black text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-zinc-800 transition-all"
            >
              Jelajahi Store
            </Link>
          </div>
        ) : (
          <>
            {/* Hero Featured Product */}
            {heroProduct && (
              <div className="bg-white rounded-[40px] p-8 md:p-12 border border-zinc-100 shadow-2xl shadow-zinc-200/40 mb-16 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-zinc-50/50 -skew-x-12 translate-x-1/2 pointer-events-none"></div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                  {/* Image Side */}
                  <Link href={`/product/${heroProduct.id}`} className="bg-white rounded-[32px] aspect-[4/3] flex items-center justify-center p-8 group-hover:scale-105 transition-transform duration-700 cursor-pointer">
                    <img 
                      src={heroProduct.image} 
                      className="w-full h-full object-contain max-h-[300px]" 
                      alt={heroProduct.name} 
                    />
                  </Link>

                  {/* Content Side */}
                  <div className="space-y-8">
                    <div className="inline-flex items-center gap-2 bg-red-500 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-200">
                      <TrendingDown size={14} />
                      Limited Offer {heroProduct.discount_percent > 0 ? `-${heroProduct.discount_percent}%` : ""}
                    </div>

                    <div className="space-y-4">
                      <Link href={`/product/${heroProduct.id}`}>
                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-black tracking-tight leading-tight hover:text-red-500 transition-colors cursor-pointer line-clamp-3">{heroProduct.name}</h2>
                      </Link>
                      <p className="text-zinc-500 text-lg font-medium leading-relaxed max-w-md line-clamp-3">
                        {heroProduct.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 md:gap-6">
                      <span className="text-2xl md:text-4xl font-black text-red-500 shrink-0">{formatIDR(heroProduct.price)}</span>
                      {heroProduct.original_price > 0 && (
                        <span className="text-xl md:text-2xl font-bold text-zinc-300 line-through decoration-zinc-200 shrink-0">{formatIDR(heroProduct.original_price)}</span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <button 
                        onClick={() => handleBuyNow(heroProduct)}
                        className="inline-flex justify-center flex-1 items-center gap-2 md:gap-4 bg-black text-white px-6 py-4 md:px-10 md:py-5 rounded-xl md:rounded-[24px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-[10px] md:text-xs hover:bg-zinc-800 transition-all shadow-xl shadow-black/20 active:scale-95 group"
                      >
                        Buy Now
                        <ShoppingCart size={16} className="group-hover:translate-x-2 transition-transform md:w-[18px]" />
                      </button>
                      <Link 
                        href={`/product/${heroProduct.id}`}
                        className="inline-flex justify-center flex-1 items-center gap-2 md:gap-4 bg-white border-2 border-zinc-100 text-black px-6 py-4 md:px-10 md:py-5 rounded-xl md:rounded-[24px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-[10px] md:text-xs hover:bg-zinc-50 transition-all active:scale-95 group"
                      >
                        Details
                        <Eye size={16} className="group-hover:scale-110 transition-transform md:w-[18px]" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Product Grid */}
            {gridProducts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {gridProducts.map((p) => (
                  <div key={p.id} className="group">
                    <div className="bg-white rounded-[32px] p-4 border border-zinc-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col h-full">
                      <Link href={`/product/${p.id}`} className="bg-zinc-50 rounded-[24px] aspect-[4/5] flex items-center justify-center p-6 mb-6 relative overflow-hidden cursor-pointer">
                        {p.discount_percent > 0 && (
                          <div className="absolute top-4 left-4 z-10 bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg shadow-red-100">
                            -{p.discount_percent}%
                          </div>
                        )}
                        <img 
                          src={p.image} 
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" 
                          alt={p.name} 
                        />
                      </Link>
                      
                      <div className="text-center space-y-4 px-2 pb-2 flex-1 flex flex-col justify-between">
                        <div>
                          <Link href={`/product/${p.id}`}>
                            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest hover:text-black transition-colors cursor-pointer mb-2 line-clamp-1">{p.name}</h3>
                          </Link>
                          <div className="flex flex-col items-center">
                            <span className="text-lg font-black text-red-500">{formatIDR(p.price)}</span>
                            {p.original_price > 0 && (
                              <span className="text-xs font-bold text-zinc-300 line-through">{formatIDR(p.original_price)}</span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2 pt-4 border-t border-zinc-50">
                          <button 
                            onClick={() => handleBuyNow(p)}
                            className="w-full py-3 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
                          >
                            <ShoppingCart size={14} />
                            Buy Now
                          </button>
                          <Link 
                            href={`/product/${p.id}`}
                            className="w-full py-3 bg-zinc-50 text-zinc-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2"
                          >
                            <Eye size={14} />
                            Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
