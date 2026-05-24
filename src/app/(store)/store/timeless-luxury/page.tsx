"use client";

import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ShoppingCart,
  Star,
  Eye,
  ShieldCheck,
  Gem,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";
import { formatIDR } from "../../../components/ui/utils";
import { useCart } from "../../../../lib/CartContext";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

function LuxuryCardSkeleton() {
  return (
    <div className="bg-zinc-900/30 rounded-[48px] border border-white/5 overflow-hidden animate-pulse flex flex-col md:flex-row h-full">
      <div className="w-full md:w-1/2 aspect-square bg-zinc-800/50" />
      <div className="p-10 flex-1 flex flex-col justify-between gap-6">
        <div className="space-y-4">
          <div className="h-3 bg-zinc-800 rounded-full w-1/4" />
          <div className="h-8 bg-zinc-800 rounded-xl w-3/4" />
          <div className="h-4 bg-zinc-800 rounded-full w-full" />
          <div className="h-4 bg-zinc-800 rounded-full w-2/3" />
        </div>
        <div className="h-14 bg-zinc-800 rounded-2xl mt-auto" />
      </div>
    </div>
  );
}

export default function TimelessLuxuryPage() {
  const { addToCart } = useCart();
  const { user } = useUser();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    async function fetchLuxuryProducts() {
      setIsLoading(true);
      try {
        const { data: metricsData } = await supabase
          .from("product_metrics")
          .select("*");
        const metricsMap = new Map();
        if (metricsData) {
          metricsData.forEach((m: any) => metricsMap.set(m.product_id, m));
        }

        // Step 1: look for "Luxury Fashion" category ID
        const { data: catData } = await supabase
          .from("categories")
          .select("id")
          .ilike("name", "%luxury%")
          .limit(1)
          .maybeSingle();

        let luxuryData: any[] | null = null;
        let usedFallback = false;

        if (catData?.id) {
          const { data } = await supabase
            .from("products")
            .select(
              `
              *,
              category:categories(name),
              product_images(image_url, is_primary)
            `,
            )
            .eq("status", "published")
            .eq("category_id", catData.id)
            .order("created_at", { ascending: false });

          if (data && data.length > 0) {
            luxuryData = data;
          }
        }

        // Step 2: fallback to 12 most expensive products
        if (!luxuryData || luxuryData.length === 0) {
          usedFallback = true;
          const { data: fallback } = await supabase
            .from("products")
            .select(
              `
              *,
              category:categories(name),
              product_images(image_url, is_primary)
            `,
            )
            .eq("status", "published")
            .order("base_price", { ascending: false })
            .limit(12);
          luxuryData = fallback || [];
        }

        setIsFallback(usedFallback);

        const mapped = luxuryData.map((p) => {
          const primaryImage =
            p.product_images?.find((img: any) => img.is_primary)?.image_url ||
            p.product_images?.[0]?.image_url ||
            p.image_url ||
            "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800";
          return {
            id: p.id,
            name: p.name,
            category: p.category?.name || "Luxury",
            description:
              p.editorial_narrative ||
              "Item eksklusif dari koleksi premium Lumina.",
            price:
              Number(p.discount_price) > 0
                ? Number(p.discount_price)
                : Number(p.base_price) || 0,
            image: primaryImage,
            rating: Number(metricsMap.get(p.id)?.avg_rating) || 0,
            totalReviews: Number(metricsMap.get(p.id)?.total_reviews) || 0,
          };
        });

        setProducts(mapped);
      } catch (err) {
        console.error("Error fetching luxury products:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLuxuryProducts();
  }, []);

  const handleAddToCart = (product: any) => {
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
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* LUXURY HEADER */}
      <header className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-900/20 via-transparent to-transparent opacity-50" />
        <div className="max-w-[1400px] mx-auto px-8 relative z-10">
          <Link
            href="/store"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-amber-500/60 hover:text-amber-500 transition-colors mb-12"
          >
            <ChevronLeft size={16} /> Back to Store
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-px bg-amber-500/50" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-500">
                  Private Collection
                </span>
              </div>
              <h1 className="text-7xl lg:text-8xl font-black tracking-tighter uppercase leading-none italic">
                Timeless <br />{" "}
                <span
                  style={{
                    WebkitTextStroke: "1px rgba(222, 98, 20, 0.82)",
                    color: "orange",
                  }}
                >
                  Luxury
                </span>
              </h1>
              <p className="text-xl text-zinc-400 max-w-xl font-medium leading-relaxed italic">
                Investasi dalam gaya yang tak lekang oleh waktu. Temukan kurasi
                item paling eksklusif dari rumah mode ternama dunia.
              </p>
              {isFallback && !isLoading && (
                <span className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-400 text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest border border-amber-500/20">
                  <Sparkles size={10} /> Premium Selection — Most Exclusive
                  Items
                </span>
              )}
            </div>
            <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 p-8 rounded-[40px] flex items-center gap-6 shrink-0">
              <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Gem size={28} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  Selected Items
                </span>
                <span className="text-4xl font-black text-white">
                  {isLoading ? (
                    <span className="inline-block w-10 h-10 bg-zinc-800 rounded-lg animate-pulse align-middle" />
                  ) : (
                    products.length
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* LUXURY PRODUCT GRID */}
      <main className="max-w-[1400px] mx-auto px-8 py-20">
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {[1, 2, 3, 4].map((i) => (
              <LuxuryCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-[48px] border border-white/5 bg-zinc-900/20 p-24 text-center">
            <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-8">
              <Gem className="text-amber-500" size={32} />
            </div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-3">
              Coming Soon
            </h2>
            <p className="text-zinc-500 font-medium max-w-xs mx-auto">
              Koleksi eksklusif sedang dikurasi. Pantau terus!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {products.map((product) => (
              <div
                key={product.id}
                className="group relative bg-zinc-900/30 rounded-[48px] border border-white/5 overflow-hidden hover:border-amber-500/30 transition-all duration-700 flex flex-col md:flex-row"
              >
                {/* Image Section */}
                <div className="relative w-full md:w-1/2 aspect-square bg-zinc-900 flex items-center justify-center p-12 overflow-hidden shrink-0">
                  <div className="absolute top-8 left-8 z-20">
                    <span className="bg-gradient-to-r from-amber-600 to-yellow-500 text-white text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-xl shadow-amber-900/40">
                      Luxury
                    </span>
                  </div>
                  <Link
                    href={`/product/${product.id}`}
                    className="block w-full h-full group-hover:scale-110 transition-transform duration-1000"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  </Link>
                </div>

                {/* Info Section */}
                <div className="p-10 flex-1 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">
                        {product.category}
                      </span>
                      {product.totalReviews > 0 && (
                        <div className="flex items-center gap-2 text-amber-400">
                          <Star size={14} fill="currentColor" />
                          <span className="text-sm font-black">
                            {product.rating}
                          </span>
                        </div>
                      )}
                    </div>
                    <Link href={`/product/${product.id}`}>
                      <h3 className="text-3xl font-black text-white leading-tight hover:text-amber-500 transition-colors uppercase italic tracking-tighter">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-zinc-500 leading-relaxed font-medium line-clamp-3">
                      {product.description}
                    </p>
                  </div>

                  <div className="pt-8 border-t border-white/5 flex items-center justify-between mt-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                        Exclusive Price
                      </span>
                      <span className="text-3xl font-black text-amber-500 tracking-tighter">
                        {formatIDR(product.price)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                        Ready Stock
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-6 flex gap-3">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 bg-white text-black h-14 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs hover:bg-amber-500 hover:text-white transition-all active:scale-95 shadow-2xl"
                    >
                      <ShoppingCart size={18} /> Add to Collection
                    </button>
                    <Link
                      href={`/product/${product.id}`}
                      className="w-14 h-14 bg-zinc-800 text-white rounded-2xl flex items-center justify-center hover:bg-zinc-700 transition-all active:scale-95"
                    >
                      <Eye size={20} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* TRUST SECTION */}
      <section className="py-40 border-t border-white/5">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: <ShieldCheck className="text-amber-500" size={32} />,
                title: "Authenticity Guaranteed",
                desc: "Kami menjamin keaslian 100% untuk setiap produk luxury yang kami kurasi.",
              },
              {
                icon: <Gem className="text-amber-500" size={32} />,
                title: "Premium Selection",
                desc: "Hanya item paling ikonik dan langka yang masuk dalam koleksi Timeless Luxury kami.",
              },
              {
                icon: <Star className="text-amber-500" size={32} />,
                title: "Concierge Service",
                desc: "Nikmati layanan bantuan belanja eksklusif untuk pengalaman belanja yang tak terlupakan.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="space-y-6 p-10 bg-zinc-900/20 rounded-[40px] border border-white/5 hover:border-amber-500/20 transition-all"
              >
                {item.icon}
                <h3 className="text-xl font-black uppercase italic tracking-tight">
                  {item.title}
                </h3>
                <p className="text-zinc-500 font-medium leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
