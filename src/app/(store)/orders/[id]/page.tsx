"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";
import { useUser } from "@clerk/nextjs";
import { formatIDR } from "../../../components/ui/utils";
import { 
  Package, 
  MapPin, 
  CreditCard, 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  Truck, 
  ShoppingBag,
  Info,
  Star
} from "lucide-react";
import Link from "next/link";
import ReviewModal from "../../../components/ReviewModal";

export default function OrderDetailPage() {
  const { id } = useParams();
  const { user, isLoaded } = useUser();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<any>(null);
  
  const [productReviews, setProductReviews] = useState<any[]>([]);
  const [storeReview, setStoreReview] = useState<any>(null);

  const openReviewModal = (target: any) => {
    setReviewTarget(target);
    setIsReviewModalOpen(true);
  };

  useEffect(() => {
    async function fetchOrder() {
      if (!user || !id) return;

      try {
        const { data, error } = await supabase
          .from("orders")
          .select(`
            *,
            order_items (
              quantity,
              price,
              product_id,
              products (
                name,
                product_images (
                  image_url
                )
              )
            )
          `)
          .eq("id", id)
          .single();

        if (error) throw error;
        
        if (data) {
          data.items = data.order_items?.map((item: any) => ({
            product_id: item.product_id,
            name: item.products?.name,
            quantity: item.quantity,
            price: item.price,
            image: item.products?.product_images?.[0]?.image_url
          })) || [];
        }
        
        setOrder(data);

        // Fetch existing reviews for this order
        const { data: prData } = await supabase
          .from("product_reviews")
          .select("*")
          .eq("order_id", id);
        if (prData) setProductReviews(prData);

        const { data: srData } = await supabase
          .from("store_reviews")
          .select("*")
          .eq("order_id", id);
        if (srData && srData.length > 0) setStoreReview(srData[0]);

      } catch (err) {
        console.error("Error fetching order details:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (user && id) {
      fetchOrder();

      const channel = supabase.channel(`order-detail-${id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `id=eq.${id}` }, () => {
          fetchOrder();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, id]);

  const generateOrderCode = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = (hash << 5) - hash + id.charCodeAt(i);
      hash |= 0;
    }
    const absHash = Math.abs(hash);
    return `#LUMINA-${(absHash % 9000) + 1000}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "selesai":
      case "paid":
        return "text-green-600 bg-green-50 border-green-100";
      case "shipped":
      case "dikirim":
        return "text-blue-600 bg-blue-50 border-blue-100";
      case "pending":
      case "menunggu":
        return "text-amber-600 bg-amber-50 border-amber-100";
      default:
        return "text-zinc-600 bg-zinc-50 border-zinc-100";
    }
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#fcfcfc] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-6 text-zinc-300">
          <Info size={40} />
        </div>
        <h2 className="text-2xl font-black text-black mb-2">Pesanan Tidak Ditemukan</h2>
        <p className="text-zinc-500 mb-8 max-w-xs mx-auto">Kami tidak dapat menemukan data pesanan yang Anda cari.</p>
        <Link href="/orders" className="bg-black text-white px-8 py-3 rounded-full font-black uppercase tracking-widest text-[10px]">
          Kembali ke Daftar Pesanan
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc] pb-20">
      {/* Header */}
      <div className="bg-white border-b border-zinc-100 pt-20">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <Link href="/orders" className="inline-flex items-center gap-2 text-zinc-400 hover:text-black transition-colors mb-8 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-widest">Daftar Pesanan</span>
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-black text-black tracking-tight">Detail Pesanan</h1>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <p className="text-zinc-500 font-medium">
                {generateOrderCode(order.id)} • {new Date(order.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Items & Timeline */}
        <div className="lg:col-span-2 space-y-10">
          {/* Order Items */}
          <section className="bg-white rounded-[32px] border border-zinc-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-zinc-50 bg-zinc-50/30">
              <h2 className="text-xl font-black text-black tracking-tight flex items-center gap-3">
                <ShoppingBag size={20} className="text-zinc-400" />
                Daftar Produk
              </h2>
            </div>
            <div className="divide-y divide-zinc-50">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="p-8 flex items-center gap-6 group">
                  <div className="w-24 h-24 bg-zinc-50 rounded-[24px] overflow-hidden border border-zinc-100 p-4 flex-shrink-0">
                    <img 
                      src={item.image || item.images?.[0] || "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400"} 
                      alt={item.name}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-black text-black tracking-tight mb-1">{item.name}</h3>
                    <p className="text-zinc-400 text-xs font-bold">{item.quantity} x {formatIDR(item.price)}</p>
                    
                    {(order.status.toLowerCase() === 'completed' || order.status.toLowerCase() === 'selesai') && (
                      <button 
                        onClick={() => {
                          const existingReview = productReviews.find(r => r.product_id === item.product_id);
                          openReviewModal({
                            type: 'product',
                            orderId: order.id,
                            productId: item.product_id,
                            productName: item.name,
                            existingReview: existingReview ? {
                              rating: existingReview.rating,
                              review_text: existingReview.review_text,
                              is_anonymous: existingReview.is_anonymous
                            } : undefined
                          });
                        }}
                        className={`mt-3 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-colors ${productReviews.find(r => r.product_id === item.product_id) ? 'text-zinc-400 hover:text-black' : 'text-indigo-500 hover:text-indigo-600'}`}
                      >
                        <Star size={12} className={productReviews.find(r => r.product_id === item.product_id) ? "fill-zinc-400" : "fill-indigo-500"} />
                        {productReviews.find(r => r.product_id === item.product_id) ? 'Edit Ulasan Produk' : 'Beri Ulasan Produk'}
                      </button>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-black">{formatIDR(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Timeline */}
          <section className="bg-white rounded-[32px] border border-zinc-100 shadow-sm p-8 space-y-8">
            <h2 className="text-xl font-black text-black tracking-tight flex items-center gap-3">
              <Clock size={20} className="text-zinc-400" />
              Status Pengiriman
            </h2>
            <div className="relative space-y-8 pl-8">
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-zinc-100"></div>
              
              <div className="relative flex items-start gap-6">
                <div className={`absolute left-[-26px] w-4 h-4 rounded-full border-4 border-white z-10 ${order.status.toLowerCase() === 'selesai' || order.status.toLowerCase() === 'completed' ? 'bg-green-500' : 'bg-zinc-200'}`}></div>
                <div>
                  <p className={`text-sm font-black ${order.status.toLowerCase() === 'selesai' || order.status.toLowerCase() === 'completed' ? 'text-green-600' : 'text-zinc-400'}`}>Pesanan Selesai</p>
                  <p className="text-xs text-zinc-400 font-medium">Terima kasih telah berbelanja di Lumina</p>
                </div>
              </div>

              <div className="relative flex items-start gap-6">
                <div className={`absolute left-[-26px] w-4 h-4 rounded-full border-4 border-white z-10 ${order.status.toLowerCase() === 'shipped' || order.status.toLowerCase() === 'dikirim' ? 'bg-blue-500' : 'bg-zinc-200'}`}></div>
                <div>
                  <p className={`text-sm font-black ${order.status.toLowerCase() === 'shipped' || order.status.toLowerCase() === 'dikirim' ? 'text-blue-600' : 'text-zinc-400'}`}>Pesanan Dikirim</p>
                  <p className="text-xs text-zinc-400 font-medium">Paket sedang dalam perjalanan menuju lokasi Anda</p>
                </div>
              </div>

              <div className="relative flex items-start gap-6">
                <div className={`absolute left-[-26px] w-4 h-4 rounded-full border-4 border-white z-10 ${order.status.toLowerCase() === 'processing' || order.status.toLowerCase() === 'diproses' || order.status.toLowerCase() === 'pending' ? 'bg-amber-500' : 'bg-zinc-200'}`}></div>
                <div>
                  <p className={`text-sm font-black ${order.status.toLowerCase() === 'processing' || order.status.toLowerCase() === 'diproses' || order.status.toLowerCase() === 'pending' ? 'text-amber-500' : 'text-zinc-400'}`}>Pesanan Diproses</p>
                  <p className="text-xs text-zinc-400 font-medium">{new Date(order.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Address & Summary */}
        <div className="space-y-10">
          {/* Shipping Address */}
          <section className="bg-white rounded-[32px] border border-zinc-100 shadow-sm p-8 space-y-6">
            <h2 className="text-lg font-black text-black tracking-tight flex items-center gap-3">
              <MapPin size={20} className="text-zinc-400" />
              Alamat Pengiriman
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-black text-black">{order.customer_name}</p>
                <p className="text-xs text-zinc-500 leading-relaxed mt-1">
                  {order.customer_address || "Alamat tidak tersedia"}
                </p>
              </div>
            </div>
          </section>

          {/* Payment Method */}
          <section className="bg-white rounded-[32px] border border-zinc-100 shadow-sm p-8 space-y-6">
            <h2 className="text-lg font-black text-black tracking-tight flex items-center gap-3">
              <CreditCard size={20} className="text-zinc-400" />
              Metode Pembayaran
            </h2>
            <div className="bg-zinc-50 p-4 rounded-2xl flex items-center gap-4 border border-zinc-100">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <CreditCard size={20} className="text-black" />
              </div>
              <div>
                <p className="text-sm font-black text-black uppercase">{order.payment_method}</p>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Instant Payment</p>
              </div>
            </div>
          </section>

          {/* Summary */}
          <section className="bg-black rounded-[32px] p-8 text-white space-y-6 shadow-2xl shadow-black/20">
            <h2 className="text-lg font-black tracking-tight flex items-center gap-3 text-zinc-400">
              Ringkasan Belanja
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Subtotal ({order.items.length} Produk)</span>
                <span className="font-bold">{formatIDR(order.total_amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Biaya Pengiriman</span>
                <span className="font-bold text-green-400">GRATIS</span>
              </div>
              <div className="pt-4 border-t border-zinc-800 flex flex-wrap justify-between items-end gap-4">
                <span className="text-sm text-zinc-400 font-bold uppercase tracking-widest shrink-0">Total Bayar</span>
                <span className="text-xl sm:text-2xl font-black text-right text-indigo-400 break-words max-w-full">
                  {formatIDR(order.total_amount)}
                </span>
              </div>
            </div>
            
            {(order.status.toLowerCase() === 'completed' || order.status.toLowerCase() === 'selesai') && (
              <button 
                onClick={() => openReviewModal({ 
                  type: 'store', 
                  orderId: order.id,
                  existingReview: storeReview ? {
                    rating: storeReview.rating,
                    review_text: storeReview.review_text,
                    is_anonymous: storeReview.is_anonymous
                  } : undefined
                })}
                className={`w-full mt-4 py-4 rounded-xl border flex items-center justify-center gap-2 transition-all group ${storeReview ? 'border-zinc-800 bg-black text-white hover:bg-zinc-800' : 'border-zinc-800 text-white hover:bg-white hover:text-black hover:border-white'}`}
              >
                <Star size={16} className={`transition-colors ${storeReview ? 'text-orange-400 fill-orange-400' : 'text-zinc-400 group-hover:text-black group-hover:fill-black'}`} />
                <span className="text-xs font-black uppercase tracking-widest">
                  {storeReview ? 'Edit Pengalaman Belanja' : 'Nilai Pengalaman Belanja'}
                </span>
              </button>
            )}
          </section>
        </div>
      </div>

      <ReviewModal 
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        target={reviewTarget}
        onSuccess={() => {
          alert("Terima kasih! Ulasan Anda berhasil disimpan.");
        }}
      />
    </div>
  );
}
