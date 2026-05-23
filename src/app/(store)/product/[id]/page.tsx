"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";
import { useCart } from "../../../../lib/CartContext";
import { useUser } from "@clerk/nextjs";
import {
  Star,
  ShoppingCart,
  Truck,
  ShieldCheck,
  ChevronRight,
  Minus,
  Plus,
  Share2,
  Heart,
  Store,
} from "lucide-react";
import Link from "next/link";
import { formatIDR } from "../../../components/ui/utils";
import { toast } from "sonner";
import { maskName } from "../../../components/ui/utils";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useUser();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState("Default");
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const [selectedSize, setSelectedSize] = useState("M");
  const [activeTab, setActiveTab] = useState("deskripsi");
  const [realReviews, setRealReviews] = useState<any[]>([]);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);

  const allMockReviews = [
    {
      user: "winter",
      rating: 5,
      comment: "Kualitas barang bagus, bahan sangat adem dan nyaman dipakai.",
      date: "17/4/2026, 22.35.33",
      avatar:
        "https://i.pinimg.com/736x/14/e9/7c/14e97cb6143526336653101cbb75a659.jpg",
      color: "Hitam",
      size: "XL",
      isAnonymous: false,
      image: null,
    },
    // ... rest of mock reviews
  ];

  const allReviews = [...realReviews.map(r => ({
    user: r.is_anonymous ? maskName(r.user_name) : (r.user_name || "Customer"),
    rating: r.rating,
    comment: r.review_text,
    date: new Date(r.created_at).toLocaleString("id-ID"),
    avatar: r.is_anonymous ? "" : (r.user_avatar || "https://ui-avatars.com/api/?name=" + (r.user_name || "Customer")),
    isAnonymous: r.is_anonymous,
    color: r.variant ? r.variant.split(',')[0] : "Default",
    size: r.variant ? r.variant.split(',')[1] || "M" : "M",
    image: null
  })), ...allMockReviews];

  const displayedReviews = showAllReviews ? allReviews : allReviews.slice(0, 4);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const { data, error } = await supabase
          .from("product_reviews")
          .select("*")
          .eq("product_id", id)
          .eq("is_hidden", false)
          .order("created_at", { ascending: false });

        if (!error && data) {
          // If users join failed, just use raw data
          setRealReviews(data);
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
      }
    }

    if (id) {
      fetchReviews();
    }
  }, [id]);

  useEffect(() => {
    async function fetchProduct() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select(`
            *,
            category:categories(name),
            product_images (
              image_url,
              is_primary
            ),
            product_variants (
              id,
              stock,
              size,
              colors (
                name,
                hex_code
              )
            )
          `)
          .eq("id", id)
          .single();

        if (error || !data) {
          console.error("Product not found or error:", error);
          setProduct(null);
          return;
        }

        let totalStock = data.stock || 0;
        let availableColors = ["#000000", "#ffffff", "#4a5568"];
        let availableSizes = ["S", "M", "L", "XL"];
        
        if (data.product_variants && data.product_variants.length > 0) {
           totalStock = data.product_variants.reduce((acc: number, v: any) => acc + (v.stock || 0), 0);
           const colors = data.product_variants.map((v: any) => v.colors?.hex_code).filter(Boolean);
           if (colors.length > 0) availableColors = [...new Set(colors)] as string[];
           
           const sizes = data.product_variants.map((v: any) => v.size).filter(Boolean);
           if (sizes.length > 0) availableSizes = [...new Set(sizes)] as string[];
        }

        const dbImages = data.product_images?.map((img: any) => img.image_url).filter(Boolean) || [];
        const primaryImage = data.product_images?.find((img: any) => img.is_primary)?.image_url 
          || dbImages[0] 
          || data.image_url 
          || "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800";

        const productImages = dbImages.length > 0 ? dbImages : [primaryImage];

        // Fetch Product Metrics
        const { data: metricsData } = await supabase
          .from("product_metrics")
          .select("*")
          .eq("product_id", id)
          .single();

        setProduct({ 
          ...data, 
          name: data.name,
          category: data.category?.name || "Fashion",
          description: data.editorial_narrative || data.description || "Produk berkualitas tinggi dari Lumina.",
          price: Number(data.base_price) || 0,
          original_price: Number(data.original_price) || 0,
          is_flash_sale: data.is_flash_sale || false,
          discount_percent: data.discount_percent || 0,
          stock: totalStock, 
          variants: data.product_variants, 
          availableColors, 
          availableSizes,
          images: productImages,
          image: primaryImage,
          rating: Number(metricsData?.avg_rating) || 0,
          totalReviews: Number(metricsData?.total_reviews) || 0
        });

        if (availableColors.length > 0) setSelectedVariant(availableColors[0]);
        if (availableSizes.length > 0) setSelectedSize(availableSizes[0]);
        
        setActiveImage(primaryImage);

        // Track telemetry for product view
        try {
          const { telemetry } = await import('../../../../lib/telemetry');
          telemetry.track('product_view', { product_id: id as string });
        } catch (e) {}

        // Fetch similar products
        const { data: similarData } = await supabase
          .from("products")
          .select(`
            *,
            product_images (
              image_url,
              is_primary
            )
          `)
          .eq("status", "published")
          .eq("category_id", data.category_id)
          .neq("id", id)
          .limit(4);

        let resolvedSimilar = similarData || [];

        // If not enough similar products, fetch general products
        if (resolvedSimilar.length < 4) {
          const { data: generalData } = await supabase
            .from("products")
            .select(`
              *,
              product_images (
                image_url,
                is_primary
              )
            `)
            .eq("status", "published")
            .neq("id", id)
            .limit(4 - resolvedSimilar.length);

          if (generalData) {
            resolvedSimilar = [...resolvedSimilar, ...generalData];
          }
        }

        const mappedSimilar = resolvedSimilar.map((p: any) => {
          const primaryImg = p.product_images?.find((img: any) => img.is_primary)?.image_url 
            || p.product_images?.[0]?.image_url 
            || p.image_url
            || "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800";

          return {
            id: p.id,
            name: p.name,
            price: Number(p.base_price) || 0,
            image: primaryImg,
          };
        });

        setSimilarProducts(mappedSimilar);

      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (id) fetchProduct();
  }, [id, router]);

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Silakan Login", {
        description: "Anda harus login untuk menambahkan produk ke keranjang.",
      });
      router.push("/sign-in");
      return;
    }

    let resolvedVariantId = null;
    let resolvedStock = product.stock || 0;

    if (product.variants && product.variants.length > 0) {
       const exactVariant = product.variants.find((v: any) => v.size === selectedSize && v.colors?.hex_code === selectedVariant);
       if (exactVariant) {
          resolvedVariantId = exactVariant.id;
          resolvedStock = exactVariant.stock;
       } else {
          resolvedVariantId = product.variants[0].id;
          resolvedStock = product.variants[0].stock;
       }
    }

    if (resolvedStock < quantity) {
      toast.error("Stok Tidak Cukup", { description: `Hanya tersisa ${resolvedStock} pcs untuk varian ini.` });
      return;
    }

    addToCart({
      id: product.id,
      variantId: resolvedVariantId,
      name: product.name,
      price: product.price,
      category: product.category || "",
      images: product.images || [product.image || activeImage],
    } as any);

    toast.success("Berhasil ditambahkan", {
      description: `${product.name} telah masuk ke keranjang.`,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!product) return null;

  const images = product.images || [product.image];

  let currentVariantStock = product.stock || 0;
  if (product.variants && product.variants.length > 0) {
     const exactVariant = product.variants.find((v: any) => v.size === selectedSize && v.colors?.hex_code === selectedVariant);
     if (exactVariant) {
        currentVariantStock = exactVariant.stock;
     } else {
        currentVariantStock = product.variants[0].stock;
     }
  }

  const isOutOfStock = currentVariantStock === 0;

  return (
    <div className="min-h-screen bg-white pb-10">
      {/* Sticky Top Bar (Desktop) */}
      <div
        className={`hidden lg:block fixed top-[72px] left-0 w-full bg-white border-b border-zinc-100 z-40 transition-transform duration-300 transform ${showStickyBar ? "translate-y-0" : "-translate-y-full"}`}
      >
        <div className="max-w-6xl mx-auto px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={activeImage}
              className="w-8 h-8 object-cover rounded-md"
              alt=""
            />
            <span className="font-bold text-black text-sm">{product.name}</span>
          </div>
          {isOutOfStock ? (
             <span className="bg-red-50 text-red-600 px-5 py-2 rounded-full font-bold text-xs">Habis</span>
          ) : (
            <button
              onClick={handleAddToCart}
              className="bg-black text-white px-5 py-2 rounded-full font-bold text-xs hover:bg-zinc-800 transition active:scale-95"
            >
              Beli Sekarang
            </button>
          )}
        </div>
      </div>

      {/* Sticky Bottom Bar (Mobile) */}
      <div
        className={`lg:hidden fixed bottom-0 left-0 w-full bg-white/85 backdrop-blur-xl border-t border-zinc-200/50 z-50 transition-transform duration-300 transform pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 px-4 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] ${showStickyBar ? "translate-y-0" : "translate-y-[150%]"}`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-black text-[13px] truncate">{product.name}</span>
            <span className="font-black text-orange-500 text-sm">{formatIDR(product.price)}</span>
          </div>
          {isOutOfStock ? (
             <span className="bg-red-50 text-red-600 px-6 py-3 rounded-xl font-bold text-xs whitespace-nowrap">Habis</span>
          ) : (
            <button
              onClick={handleAddToCart}
              className="bg-black text-white px-6 py-3 rounded-xl font-bold text-xs hover:bg-zinc-800 transition active:scale-95 whitespace-nowrap shadow-lg shadow-black/20"
            >
              + Keranjang
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] text-zinc-400 mb-8 uppercase tracking-widest">
          <Link href="/" className="hover:text-black transition">
            Store
          </Link>
          <ChevronRight size={8} />
          <span className="text-zinc-300">{product.category}</span>
          <ChevronRight size={8} />
          <span className="text-black font-bold">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Left: Image Gallery */}
          <div className="space-y-4">
            <div className="bg-[#f9f9f9] rounded-2xl aspect-[4/3] flex items-center justify-center group relative p-8 border border-zinc-50 overflow-visible">
              <img
                src={activeImage}
                className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                alt={product.name}
              />
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide px-1">
              {images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`w-16 h-16 rounded-xl flex-shrink-0 bg-white p-2 border-2 transition-all ${activeImage === img ? "border-black shadow-sm" : "border-zinc-100 hover:border-zinc-300"}`}
                >
                  <img
                    src={img}
                    className="w-full h-full object-contain"
                    alt=""
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Info Section */}
          <div className="space-y-8">
            <div className="border-b border-zinc-100 pb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  {product.brand || "Lumina Exclusive"}
                </span>
                <div className="flex gap-4 text-zinc-400">
                  <button className="hover:text-black transition">
                    <Share2 size={16} />
                  </button>
                  <button className="hover:text-black transition">
                    <Heart size={16} />
                  </button>
                </div>
              </div>
              <h1 className="text-2xl md:text-3xl font-medium text-black mb-3 leading-tight tracking-tight">
                {product.name}
              </h1>

              {product.totalReviews > 0 && (
                <div className="flex items-center gap-4 text-xs mb-6">
                  <div className="flex items-center gap-1 text-black font-bold">
                    <Star size={12} fill="black" />
                    {product.rating.toFixed(1)}
                  </div>
                  <span className="text-zinc-300">|</span>
                  <div className="text-zinc-500">{product.totalReviews} Ulasan</div>
                </div>
              )}

              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold text-black">
                  {formatIDR(product.price)}
                </span>
                {product.original_price > product.price && (
                  <span className="text-zinc-300 line-through text-xs">
                    {formatIDR(product.original_price)}
                  </span>
                )}
              </div>
            </div>

            {/* Size Selector */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-[10px] font-black text-black uppercase tracking-widest">
                  Pilih Ukuran
                </h3>
                <button className="text-[10px] text-zinc-400 underline hover:text-black transition">
                  Panduan Ukuran
                </button>
              </div>
              <div className="flex gap-2">
                {(product.availableSizes || ["S", "M", "L", "XL"]).map((size: string) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 rounded-lg text-xs font-bold transition flex items-center justify-center border-2 ${selectedSize === size ? "bg-black text-white border-black" : "bg-white text-zinc-400 border-zinc-100 hover:border-zinc-300"}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selector */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-black uppercase tracking-widest">
                Pilih Warna
              </h3>
              <div className="flex gap-3">
                {(product.availableColors || ["#000000", "#ffffff", "#4a5568"]).map((color: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedVariant(color)}
                    className={`w-8 h-8 rounded-full border-2 transition ${selectedVariant === color ? "border-black" : "border-zinc-200"} p-0.5`}
                  >
                    <div
                      className="w-full h-full rounded-full border border-black/5"
                      style={{ background: color }}
                    ></div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-6 py-6 border-t border-zinc-100">
              <div className="flex items-center bg-zinc-50 rounded-lg p-1 border border-zinc-100">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 md:w-8 md:h-8 flex items-center justify-center text-zinc-400 hover:text-black transition"
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center font-bold text-sm">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={isOutOfStock || quantity >= currentVariantStock}
                  className={`w-10 h-10 md:w-8 md:h-8 flex items-center justify-center transition ${isOutOfStock || quantity >= currentVariantStock ? 'text-zinc-200 cursor-not-allowed' : 'text-zinc-400 hover:text-black'}`}
                >
                  <Plus size={14} />
                </button>
              </div>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${isOutOfStock ? 'text-red-500' : 'text-zinc-400'}`}>
                {isOutOfStock ? 'STOK HABIS' : `Stok: ${currentVariantStock}`}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-[2] text-white h-14 rounded-xl font-bold text-sm transition ${isOutOfStock ? 'bg-zinc-300 cursor-not-allowed' : 'bg-black hover:bg-zinc-800 active:scale-[0.98] shadow-lg shadow-black/10'}`}
              >
                {isOutOfStock ? 'Stok Habis' : 'Beli Sekarang'}
              </button>
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 bg-white border-2 text-black h-14 rounded-xl font-bold text-sm transition flex items-center justify-center ${isOutOfStock ? 'border-zinc-200 text-zinc-300 cursor-not-allowed' : 'border-zinc-100 hover:bg-zinc-50'}`}
              >
                <ShoppingCart size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="flex items-center gap-2 text-[9px] text-zinc-400 font-bold uppercase tracking-widest">
                <Truck size={14} /> Gratis Ongkir
              </div>
              <div className="flex items-center gap-2 text-[9px] text-zinc-400 font-bold uppercase tracking-widest">
                <ShieldCheck size={14} /> Produk Original
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-20">
          <div className="flex gap-6 md:gap-8 border-b border-zinc-100 mb-6 md:mb-8 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab("deskripsi")}
              className={`pb-3 md:pb-4 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${activeTab === "deskripsi" ? "text-black" : "text-zinc-300"}`}
            >
              Deskripsi
              {activeTab === "deskripsi" && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-black"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("detail")}
              className={`pb-3 md:pb-4 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${activeTab === "detail" ? "text-black" : "text-zinc-300"}`}
            >
              Detail Produk
              {activeTab === "detail" && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-black"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("ulasan")}
              className={`pb-3 md:pb-4 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${activeTab === "ulasan" ? "text-black" : "text-zinc-300"}`}
            >
              Ulasan
              {activeTab === "ulasan" && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-black"></div>
              )}
            </button>
          </div>

          <div
            className={`min-h-[200px] ${activeTab === "ulasan" ? "w-full" : "max-w-2xl"}`}
          >
            {activeTab === "deskripsi" && (
              <p className="text-zinc-500 leading-relaxed text-sm animate-in fade-in duration-500">
                {product.description}
              </p>
            )}

            {activeTab === "detail" && (
              <div className="grid grid-cols-2 gap-y-4 gap-x-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {[
                  {
                    label: "Kategori",
                    value: product.category || "Pakaian Atasan",
                  },
                  {
                    label: "Bahan",
                    value: product.material || "Premium Cotton",
                  },
                  { label: "Ukuran", value: "S, M, L, XL" },
                  { label: "Warna", value: "Hitam, Putih, Abu" },
                  { label: "Gender", value: product.gender || "Unisex" },
                  {
                    label: "Style",
                    value: product.style || "Modern Streetwear",
                  },
                  { label: "Brand", value: product.brand || "Lumina" },
                  { label: "Stok", value: product.stock || 24 },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">
                      {item.label}
                    </span>
                    <span className="text-sm font-medium text-black">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "ulasan" && (
              <div className="animate-in fade-in duration-500 py-6">
                <div className="flex items-center justify-between mb-10 border-b border-zinc-50 pb-6">
                  {!showAllReviews && allReviews.length > 4 && (
                    <button
                      onClick={() => setShowAllReviews(true)}
                      className="text-xs font-black text-black bg-zinc-50 px-5 py-2.5 rounded-full hover:bg-black hover:text-white transition-all flex items-center gap-2 uppercase tracking-widest group shadow-sm"
                    >
                      Lihat Semua ({allReviews.length})
                      <ChevronRight
                        size={14}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </button>
                  )}
                </div>

                <div
                  className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${showAllReviews ? "mb-12" : ""}`}
                >
                  {displayedReviews.map((r, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-[28px] p-6 flex flex-col gap-5 border border-zinc-100 shadow-sm relative group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-in fade-in slide-in-from-bottom-6"
                    >
                      {/* QUOTE ICON */}
                      <div className="absolute top-6 right-6 text-orange-400 opacity-20">
                        <svg
                          width="20"
                          height="16"
                          viewBox="0 0 14 12"
                          fill="currentColor"
                        >
                          <path d="M3.5 0C5.433 0 7 1.567 7 3.5C7 5.433 5.433 7 3.5 7C2.96667 7 2.46667 6.86667 2.03333 6.66667C2.33333 8.3 3.73333 9.66667 5.5 10.3333L4.5 12C2.16667 11 0 8.66667 0 5.5V5.5C0 2.46667 2.46667 0 5.5 0H3.5ZM10.5 0C12.433 0 14 1.567 14 3.5C14 5.433 12.433 7 10.5 7C9.96667 7 9.46667 6.86667 9.03333 6.66667C9.33333 8.3 10.7333 9.66667 12.5 10.3333L11.5 12C9.16667 11 7 8.66667 7 5.5V5.5C7 2.46667 9.46667 0 12.5 0H10.5Z" />
                        </svg>
                      </div>

                      <div className="flex gap-4 items-center">
                        {/* PROFILE IMAGE */}
                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-zinc-50 shrink-0 border border-zinc-100 shadow-inner flex items-center justify-center">
                          {r.isAnonymous ? (
                            <div className="w-full h-full bg-gradient-to-br from-zinc-200 to-zinc-300 flex items-center justify-center text-zinc-400 font-bold text-xl">
                              {r.user ? r.user[0].toUpperCase() : "A"}
                            </div>
                          ) : (
                            <img
                              src={r.avatar}
                              alt={r.user}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>

                        {/* CONTENT */}
                        <div className="flex flex-col justify-center flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xs font-black text-black leading-tight line-clamp-1">
                              {product.name}
                            </h3>
                            <div className="flex items-center gap-1 bg-green-50 text-green-600 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-green-100 whitespace-nowrap">
                              <ShieldCheck size={10} />
                              Verified
                            </div>
                          </div>
                          <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                            {r.user}
                          </h4>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {/* STARS */}
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, k) => (
                              <Star
                                key={k}
                                size={12}
                                className={
                                  k < r.rating
                                    ? "text-orange-400 fill-orange-400"
                                    : "text-zinc-100"
                                }
                              />
                            ))}
                          </div>
                          <span className="text-xs font-black text-zinc-300">
                            {r.rating}.0
                          </span>
                        </div>

                        {/* PRODUCT ATTRIBUTES (SIZE/COLOR) */}
                        <div className="flex gap-2 text-[10px] text-zinc-300 font-bold uppercase tracking-wider">
                          <span className="bg-zinc-50 px-2 py-0.5 rounded-md">
                            {r.color}
                          </span>
                          <span className="bg-zinc-50 px-2 py-0.5 rounded-md">
                            {r.size}
                          </span>
                        </div>

                        <p className="text-zinc-600 text-[13px] font-medium leading-relaxed italic">
                          "{r.comment}"
                        </p>

                        <div className="pt-2 border-t border-zinc-50">
                          <p className="text-[10px] text-zinc-300 font-bold uppercase tracking-widest">
                            {r.date}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {showAllReviews && (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={() => setShowAllReviews(false)}
                      className="px-8 py-3 bg-white border border-zinc-200 text-zinc-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black hover:text-white hover:border-black transition-all shadow-sm active:scale-95"
                    >
                      Tampilkan Lebih Sedikit
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div className="mt-32 border-t border-zinc-100 pt-16">
            <h2 className="text-sm font-black text-black uppercase tracking-[0.3em] mb-12 text-center">
              Produk Serupa
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {similarProducts.map((p) => (
                <Link href={`/product/${p.id}`} key={p.id} className="group cursor-pointer">
                  <div className="aspect-[3/4] bg-zinc-50 rounded-xl mb-4 overflow-hidden flex items-center justify-center p-4">
                    <img
                      src={p.image}
                      className="w-full h-full object-contain group-hover:scale-105 transition duration-700"
                      alt={p.name}
                    />
                  </div>
                  <h4 className="text-[10px] font-bold text-black uppercase tracking-widest mb-1 line-clamp-1 font-black">
                    {p.name}
                  </h4>
                  <p className="text-xs font-bold text-zinc-400">
                    {formatIDR(p.price)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
