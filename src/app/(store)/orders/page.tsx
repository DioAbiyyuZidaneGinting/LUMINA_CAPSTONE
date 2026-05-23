"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useUser } from "@clerk/nextjs";
import { formatIDR } from "../../components/ui/utils";
import { 
  ShoppingBag, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ChevronRight,
  CreditCard,
  MapPin,
  Calendar,
  Star
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function OrdersPage() {
  const { user, isLoaded } = useUser();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in");
    }
  }, [user, isLoaded, router]);

  useEffect(() => {
    async function fetchOrders() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("orders")
          .select(`
            *,
            order_items (
              quantity,
              price,
              products (
                name,
                product_images (
                  image_url
                )
              )
            )
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          if (error.code === "42P01") {
            console.warn("Table 'orders' does not exist yet.");
            setOrders([]);
          } else {
            throw error;
          }
        } else {
          const mappedOrders = (data || []).map((order: any) => ({
            ...order,
            items: order.order_items?.map((item: any) => ({
              name: item.products?.name,
              quantity: item.quantity,
              price: item.price,
              image: item.products?.product_images?.[0]?.image_url
            })) || []
          }));
          setOrders(mappedOrders);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      fetchOrders();
      const channel = supabase.channel('customer-orders-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${user.id}` }, () => {
          fetchOrders();
        })
        .subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const generateOrderCode = (id: string) => {
    // Generate a simple numeric hash from the UUID
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = (hash << 5) - hash + id.charCodeAt(i);
      hash |= 0;
    }
    const absHash = Math.abs(hash);
    return `#LUMINA-${(absHash % 9000) + 1000}`;
  };

  const isAdmin = (user?.publicMetadata?.role as string)?.toLowerCase() === "admin" || 
                  (user?.unsafeMetadata?.role as string)?.toLowerCase() === "admin";

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;
      
      // Update local state
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
      case "selesai":
      case "completed":
        return "bg-green-50 text-green-600 border-green-100";
      case "pending":
      case "menunggu":
        return "bg-amber-50 text-amber-600 border-amber-100";
      case "shipped":
      case "dikirim":
        return "bg-blue-50 text-blue-600 border-blue-100";
      case "cancelled":
      case "dibatalkan":
        return "bg-red-50 text-red-600 border-red-100";
      default:
        return "bg-zinc-50 text-zinc-600 border-zinc-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
      case "selesai":
      case "completed":
        return <CheckCircle size={14} />;
      case "shipped":
      case "dikirim":
        return <Package size={14} />;
      case "cancelled":
      case "dibatalkan":
        return <XCircle size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc] pb-20">
      {/* Sub Header / Page Title */}
      <div className="bg-white border-b border-zinc-100 pt-20">
        <div className="max-w-5xl mx-auto px-6 py-12 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-black tracking-tight">Pesanan Saya</h1>
            <p className="text-zinc-500 font-medium mt-1">Pantau status pengiriman produk Anda</p>
          </div>
          <Link href="/" className="text-xs font-black uppercase tracking-widest bg-black text-white px-8 py-4 rounded-full hover:bg-zinc-800 transition-all shadow-xl shadow-black/10">
            Lanjut Belanja
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {orders.length === 0 ? (
          <div className="bg-white rounded-[32px] p-20 text-center shadow-sm border border-zinc-100">
            <div className="w-24 h-24 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-8 text-zinc-300">
              <ShoppingBag size={48} />
            </div>
            <h2 className="text-2xl font-black text-black mb-2">Belum Ada Pesanan</h2>
            <p className="text-zinc-500 mb-10 max-w-xs mx-auto font-medium">
              Sepertinya Anda belum melakukan pemesanan apapun. Mulai belanja produk impian Anda sekarang!
            </p>
            <Link
              href="/"
              className="inline-flex bg-black text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-zinc-800 transition shadow-2xl shadow-black/20 active:scale-95"
            >
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-[32px] shadow-sm border border-zinc-100 overflow-hidden hover:shadow-2xl hover:border-zinc-200 transition-all duration-500"
              >
                {/* Order Meta */}
                <div className="px-8 py-6 bg-zinc-50/50 border-b border-zinc-100 flex flex-wrap items-center justify-between gap-6">
                  <div className="space-y-1">
                    <h2 className="text-lg font-black text-black tracking-tight">
                      Pesanan {order.items?.[0]?.name || "Produk Lumina"}
                    </h2>
                    <div className="flex items-center gap-3 text-xs font-bold">
                      <span className="text-zinc-400">{generateOrderCode(order.id)}</span>
                      <span className="w-1 h-1 bg-zinc-200 rounded-full"></span>
                      <span className="text-zinc-400">{new Date(order.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}</span>
                    </div>
                  </div>
                  
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span>{order.status}</span>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="p-8">
                  <div className="flex items-center gap-8">
                    <div className="w-24 h-24 bg-zinc-50 rounded-[24px] overflow-hidden flex-shrink-0 border border-zinc-100 p-4">
                      <img
                        src={order.items?.[0]?.image || order.items?.[0]?.images?.[0] || "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400"}
                        alt={order.items?.[0]?.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0 space-y-4">
                      <div>
                        <h3 className="text-xl font-black text-black tracking-tight truncate">
                          {order.items?.[0]?.name}
                        </h3>
                        {order.items?.length > 1 && (
                          <p className="text-zinc-400 text-xs font-bold mt-1">
                            Dan {order.items.length - 1} produk lainnya
                          </p>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-6 items-center">
                        <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold bg-zinc-50 px-3 py-1.5 rounded-lg">
                          <Package size={14} />
                          <span>{order.items?.[0]?.quantity || 1} Item</span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold bg-zinc-50 px-3 py-1.5 rounded-lg">
                          <CreditCard size={14} />
                          <span>{order.payment_method}</span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold bg-zinc-50 px-3 py-1.5 rounded-lg max-w-[200px]">
                          <MapPin size={14} />
                          <span className="truncate">{order.customer_name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest mb-1">Total Belanja</p>
                      <p className="text-2xl font-black text-black">{formatIDR(order.total_amount)}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-8 py-6 bg-zinc-50/30 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Link
                      href={`/orders/${order.id}`}
                      className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-all group"
                    >
                      Lihat Detail
                      <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Admin Specific Action */}
                    {isAdmin && order.status.toLowerCase() !== "shipped" && order.status.toLowerCase() !== "selesai" && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, "shipped")}
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition shadow-lg shadow-blue-100"
                      >
                        Tandai Terkirim
                      </button>
                    )}

                    {/* Customer Review Action */}
                    {(order.status.toLowerCase() === "shipped" || order.status.toLowerCase() === "selesai" || order.status.toLowerCase() === "paid") && (
                      order.reviewed ? (
                        <div className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-50 text-green-600 border border-green-100 text-[10px] font-black uppercase tracking-widest">
                          <CheckCircle size={14} />
                          Review Selesai
                        </div>
                      ) : (
                        <Link
                          href={`/review/${order.id}`}
                          className="bg-black text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition shadow-2xl shadow-black/20 flex items-center gap-2"
                        >
                          <Star size={14} className="fill-white" />
                          Beri Ulasan
                        </Link>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
