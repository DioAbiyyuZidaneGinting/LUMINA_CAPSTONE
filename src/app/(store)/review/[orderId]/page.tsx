"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";
import { useUser } from "@clerk/nextjs";
import { 
  Star, 
  Upload, 
  ChevronLeft, 
  CheckCircle2,
  Package,
  Truck,
  CreditCard,
  X
} from "lucide-react";
import Link from "next/link";
import { formatIDR } from "../../../components/ui/utils";
import { toast } from "sonner";

export default function ReviewPage() {
  const { orderId } = useParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [rating, setRating] = useState(0);
  const [qualityRating, setQualityRating] = useState(0);
  const [priceRating, setPriceRating] = useState(0);
  const [shippingRating, setShippingRating] = useState(0);
  const [packagingRating, setPackagingRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewImage, setReviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in");
    }
  }, [user, isLoaded, router]);

  useEffect(() => {
    async function fetchOrder() {
      if (!user || !orderId) return;

      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .single();

        if (error) throw error;
        
        // Prevent reviewing if already reviewed
        if (data.reviewed) {
          toast.info("Ulasan sudah diberikan untuk pesanan ini.");
          router.push("/orders");
          return;
        }

        setOrder(data);
      } catch (err) {
        console.error("Error fetching order:", err);
        toast.error("Gagal memuat data pesanan");
        router.push("/orders");
      } finally {
        setIsLoading(false);
      }
    }

    if (user && orderId) {
      fetchOrder();
    }
  }, [user, orderId, router]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Silakan berikan rating bintang");
      return;
    }

    if (reviewText.length < 5) {
      toast.error("Ulasan terlalu pendek (min. 5 karakter)");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Insert into reviews table
      // Note: In a real app, you'd upload the image to Supabase Storage first.
      // For this prototype, we'll store the base64 or a mock URL.
      const { error: reviewError } = await supabase
        .from("reviews")
        .insert({
          user_id: user?.id,
          order_id: orderId,
          product_id: order.items[0]?.id, // For now, review the first item in the order
          rating,
          quality_rating: qualityRating,
          price_rating: priceRating,
          shipping_rating: shippingRating,
          packaging_rating: packagingRating,
          review_text: reviewText,
          review_image: reviewImage,
          created_at: new Date().toISOString()
        });

      if (reviewError) throw reviewError;

      // 2. Mark order as reviewed
      const { error: orderError } = await supabase
        .from("orders")
        .update({ reviewed: true })
        .eq("id", orderId);

      if (orderError) throw orderError;

      setIsSuccess(true);
      toast.success("Ulasan berhasil dikirim!");
      
      setTimeout(() => {
        router.push("/orders");
      }, 3000);

    } catch (err) {
      console.error("Error submitting review:", err);
      toast.error("Gagal mengirim ulasan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6 animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-500 shadow-xl shadow-green-100">
            <CheckCircle2 size={48} />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-black tracking-tight">Terima Kasih!</h1>
            <p className="text-zinc-500 font-medium">Ulasan Anda sangat berarti bagi kami dan pembeli lainnya.</p>
          </div>
          <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100 text-xs text-zinc-400 font-bold uppercase tracking-widest">
            Mengarahkan Anda kembali dalam beberapa detik...
          </div>
          <Link href="/orders" className="block text-black font-bold underline text-sm hover:opacity-70 transition">
            Kembali ke Pesanan Saya
          </Link>
        </div>
      </div>
    );
  }

  const product = order.items[0];

  return (
    <div className="min-h-screen bg-[#fcfcfc] pb-20 pt-28">
      <div className="max-w-5xl mx-auto px-6">
        <Link href="/orders" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors mb-10 group">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Kembali ke Pesanan
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left: Product Info */}
          <div className="lg:col-span-5 space-y-8">
            <div className="sticky top-32">
              <div className="bg-white rounded-[32px] overflow-hidden border border-zinc-100 shadow-xl shadow-zinc-200/40 p-6">
                <div className="aspect-square rounded-2xl overflow-hidden bg-zinc-50 mb-8 border border-zinc-50">
                  <img src={product.image} className="w-full h-full object-contain" alt={product.name} />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-black text-black leading-tight flex-1">{product.name}</h2>
                    <span className="text-xs font-black text-zinc-300 uppercase tracking-widest ml-4">#{orderId.slice(0, 8)}</span>
                  </div>
                  <div className="flex items-center gap-3 py-4 border-y border-zinc-50">
                    <div className="w-10 h-10 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-400">
                      <Package size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Pesanan Selesai</p>
                      <p className="text-sm font-bold text-black">{formatIDR(product.price)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Review Form */}
          <div className="lg:col-span-7 space-y-10">
            <div className="space-y-2">
              <h1 className="text-4xl font-black text-black tracking-tight">Beri Ulasan</h1>
              <p className="text-zinc-500 font-medium">Bagaimana pengalaman Anda dengan produk ini?</p>
            </div>

            <div className="bg-white rounded-[32px] p-8 md:p-10 border border-zinc-100 shadow-xl shadow-zinc-100/50 space-y-12">
              {/* Overall Rating */}
              <div className="space-y-4 text-center pb-8 border-b border-zinc-50">
                <p className="text-xs font-black text-zinc-300 uppercase tracking-[0.2em]">Rating Keseluruhan</p>
                <div className="flex justify-center gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${rating >= star ? 'bg-orange-400 text-white shadow-lg shadow-orange-200 scale-110' : 'bg-zinc-50 text-zinc-200 hover:bg-zinc-100'}`}
                    >
                      <Star size={24} fill={rating >= star ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Detailed Ratings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                {[
                  { label: "Kualitas Produk", state: qualityRating, setter: setQualityRating, icon: <Package size={14} /> },
                  { label: "Kesesuaian Harga", state: priceRating, setter: setPriceRating, icon: <CreditCard size={14} /> },
                  { label: "Kecepatan Pengiriman", state: shippingRating, setter: setShippingRating, icon: <Truck size={14} /> },
                  { label: "Kualitas Kemasan", state: packagingRating, setter: setPackagingRating, icon: <Star size={14} /> },
                ].map((item, i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                      {item.icon} {item.label}
                    </div>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => item.setter(star)}
                          className={`transition-colors ${item.state >= star ? 'text-orange-400' : 'text-zinc-100 hover:text-zinc-200'}`}
                        >
                          <Star size={18} fill={item.state >= star ? "currentColor" : "none"} />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Text Review */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Ulasan Anda</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Ceritakan kepuasan Anda tentang kualitas, layanan, atau hal lain yang menarik..."
                  className="w-full h-40 bg-zinc-50 rounded-2xl p-6 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black/5 border border-zinc-100 transition-all resize-none"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Foto Produk (Opsional)</label>
                <div className="flex gap-4 items-end">
                  {reviewImage ? (
                    <div className="relative w-32 h-32 rounded-2xl overflow-hidden border border-zinc-100 group">
                      <img src={reviewImage} className="w-full h-full object-cover" alt="Review preview" />
                      <button 
                        onClick={() => setReviewImage(null)}
                        className="absolute top-2 right-2 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <label className="w-32 h-32 rounded-2xl border-2 border-dashed border-zinc-100 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-zinc-300 hover:bg-zinc-50 transition-all text-zinc-400">
                      <Upload size={24} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Unggah</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                  )}
                  <p className="text-[10px] text-zinc-300 italic mb-2">Max. 2MB (JPG, PNG)</p>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full h-16 bg-black text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-zinc-800 transition-all shadow-xl shadow-black/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  "Kirim Ulasan Sekarang"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
