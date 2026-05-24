"use client";

import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ShoppingCart,
  Star,
  Eye,
  Zap,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";
import { formatIDR } from "../../../components/ui/utils";
import { useCart } from "../../../../lib/CartContext";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

function CardSkeleton() {
  return (
    <div className="bg-white rounded-[40px] border border-zinc-100 overflow-hidden animate-pulse flex flex-col h-full">
      <div className="aspect-[4/5] bg-zinc-100" />
      <div className="p-6 space-y-4 flex-1">
        <div className="h-3 bg-zinc-100 rounded-full w-1/3" />
        <div className="h-5 bg-zinc-100 rounded-full w-3/4" />
        <div className="h-4 bg-zinc-100 rounded-full w-1/2" />
        <div className="h-12 bg-zinc-100 rounded-2xl mt-auto" />
      </div>
    </div>
  );
}

export default function NewArrivalsPage() {
  const { addToCart } = useCart();
  const { user } = useUser();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchNewArrivals() {
      setIsLoading(true);
      try {
        const { data: metricsData } = await supabase
          .from("product_metrics")
          .select("*");
        const metricsMap = new Map();
        if (metricsData) {
          metricsData.forEach((m: any) => metricsMap.set(m.product_id, m));
        }

        const { data, error } = await supabase
          .from("products")
          .select(
            `
            *,
            category:categories(name),
            product_images(image_url, is_primary)
          `,
          )
          .eq("status", "published")
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (data) {
          const mapped = data.map((p) => {
            const primaryImage =
              p.product_images?.find((img: any) => img.is_primary)?.image_url ||
              p.product_images?.[0]?.image_url ||
              p.image_url ||
              "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800";
            return {
              id: p.id,
              name: p.name,
              category: p.category?.name || "Fashion",
              price:
                Number(p.discount_price) > 0
                  ? Number(p.discount_price)
                  : Number(p.base_price) || 0,
              originalPrice: Number(p.original_price) || 0,
              is_flash_sale: p.is_flash_sale || false,
              image: primaryImage,
              rating: Number(metricsMap.get(p.id)?.avg_rating) || 0,
              totalReviews: Number(metricsMap.get(p.id)?.total_reviews) || 0,
              created_at: p.created_at,
            };
          });
          setProducts(mapped);
        }
      } catch (err) {
        console.error("Error fetching new arrivals:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchNewArrivals();
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
    <div className="min-h-screen bg-white">
      {/* HEADER */}
      <header className="pt-32 pb-16 border-b border-zinc-100 bg-zinc-50/50">
        <div className="max-w-[1400px] mx-auto px-8">
          <Link
            href="/store"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors mb-8"
          >
            <ChevronLeft size={16} /> Back to Store
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="bg-black text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                  Summer 2026
                </span>
                <span className="text-zinc-300">/</span>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  New Arrivals
                </span>
              </div>
              <h1 className="text-6xl lg:text-7xl font-black text-black tracking-tighter uppercase leading-none">
                New Fashion <br />{" "}
                <span className="text-orange-500">Arrivals</span>
              </h1>
              <p className="text-lg text-zinc-500 max-w-xl font-medium leading-relaxed">
                Jelajahi koleksi terbaru kami yang dirancang untuk kenyamanan
                dan gaya modern Anda. Setiap item dipilih dengan teliti untuk
                kualitas terbaik.
              </p>
            </div>
            <div className="flex items-center gap-4 bg-white p-6 rounded-[32px] border border-zinc-100 shadow-xl shadow-zinc-200/50 shrink-0">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">
                  Total Items
                </span>
                <span className="text-3xl font-black text-black">
                  {isLoading ? (
                    <span className="inline-block w-10 h-8 bg-zinc-100 rounded-lg animate-pulse align-middle" />
                  ) : (
                    products.length
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* PRODUCT GRID */}
      <main className="max-w-[1400px] mx-auto px-8 py-20">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 lg:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-zinc-50 rounded-[40px] p-20 text-center">
            <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="text-zinc-300" size={32} />
            </div>
            <h2 className="text-3xl font-black text-black mb-2 uppercase tracking-tighter">
              Coming Soon
            </h2>
            <p className="text-zinc-400 font-medium max-w-xs mx-auto">
              Koleksi baru sedang dalam perjalanan. Pantau terus!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 lg:gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="group relative h-full flex flex-col bg-white rounded-[40px] border border-zinc-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/5] bg-zinc-50 overflow-hidden">
                  <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
                    <span className="bg-black text-white text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-lg">
                      NEW
                    </span>
                    {product.is_flash_sale && (
                      <span className="bg-red-500 text-white text-[9px] font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 uppercase tracking-widest">
                        <Zap size={9} fill="currentColor" /> Sale
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/product/${product.id}`}
                    className="block w-full h-full p-10 group-hover:scale-110 transition-transform duration-700"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  </Link>
                </div>

                {/* Info Container */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="space-y-1 flex-1">
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
                      <h3 className="text-lg font-black text-black leading-tight hover:text-orange-500 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>
                  </div>

                  <div className="pt-4 border-t border-zinc-50 mt-4 flex flex-col gap-1">
                    {product.is_flash_sale && product.originalPrice > 0 && (
                      <span className="text-[11px] font-bold text-zinc-400 line-through">
                        {formatIDR(product.originalPrice)}
                      </span>
                    )}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xl font-black ${product.is_flash_sale ? "text-red-500" : "text-black"}`}
                      >
                        {formatIDR(product.price)}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">
                          Ready Stock
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 flex gap-2 mt-auto">
                    <button
                      onClick={() => handleAddToCart(product)}
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
            ))}
          </div>
        )}
      </main>

      {/* FOOTER CTA */}
      <section className="bg-zinc-50 py-32 mt-20">
        <div className="max-w-4xl mx-auto px-8 text-center space-y-8">
          <h2 className="text-5xl font-black text-black tracking-tighter uppercase leading-none">
            Don&apos;t Miss Out on <br /> The{" "}
            <span className="text-zinc-300">Full Collection</span>
          </h2>
          <p className="text-zinc-500 font-medium">
            Jelajahi ratusan produk fashion lainnya di store kami dengan
            berbagai pilihan kategori dan penawaran menarik.
          </p>
          <Link href="/store">
            <button className="bg-black text-white px-12 py-6 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-2xl shadow-black/20">
              Browse All Products
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
