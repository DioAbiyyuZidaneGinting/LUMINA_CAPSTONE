"use client";

import { useState, useEffect } from "react";
import { Package, User, Clock, FileText, MessageCircle, MapPin } from "lucide-react";
import { DrawerType } from "./OrderActionManager";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { useTranslation } from "@/store/languageStore";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";
import { toast } from "sonner";

interface OrderDetailsDrawerProps {
  orderId: string; // This is the database UUID dbId!
  onNavigate: (view: DrawerType, newOrderId?: string) => void;
}

export default function OrderDetailsDrawer({ orderId, onNavigate }: OrderDetailsDrawerProps) {
  const { format } = useFormatCurrency();
  const { t, formatDate } = useTranslation();
  const supabase = useSupabaseClient();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch deep relational order details from Supabase
  useEffect(() => {
    async function fetchOrderDetail() {
      if (!orderId) return;
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("orders")
          .select(`
            *,
            items:order_items (
              id,
              quantity,
              price,
              subtotal,
              product:products (
                id,
                name,
                sku,
                images:product_images (
                  image_url,
                  is_primary
                )
              ),
              variant:product_variants (
                id,
                size,
                color:colors (
                  name,
                  hex_code
                )
              )
            )
          `)
          .eq("id", orderId)
          .single();

        if (error) throw error;
        setOrder(data);
      } catch (err) {
        console.error("Gagal mengambil detail pesanan:", err);
        toast.error("Gagal mengambil detail pesanan dari database.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrderDetail();
  }, [orderId]);

  const getProductImage = (item: any) => {
    const images = item.product?.images || [];
    const primary = images.find((img: any) => img.is_primary);
    return primary?.image_url || images[0]?.image_url || "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400";
  };

  const getVariantDetails = (item: any) => {
    if (!item.variant) return "";
    const parts = [];
    if (item.variant.size) parts.push(`Size: ${item.variant.size}`);
    if (item.variant.color?.name) parts.push(`Color: ${item.variant.color.name}`);
    return parts.join(" • ");
  };

  if (isLoading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800 dark:border-white mb-4"></div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Memuat detail pesanan...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-12 text-center">
        <p className="text-sm font-semibold text-slate-400">Detail pesanan tidak ditemukan.</p>
      </div>
    );
  }

  const initials = order.customer_name
    ? order.customer_name
        .split(" ")
        .map((p: string) => p[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "??";

  const totalItemsCount = order.items
    ? order.items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0)
    : 0;

  const orderNumber = order.order_number || `#${order.id.substring(0, 8)}`;
  const displayStatus = (order.status || "pending").toUpperCase();
  const paymentStatus = (order.payment_status || "pending").toUpperCase() === "PAID" ? "PAID" : "PENDING";

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Overview Hero */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm relative overflow-hidden transition-colors">
        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{orderNumber}</h2>
            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${
              paymentStatus === "PAID"
                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20"
                : "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-500/20"
            }`}>
              {paymentStatus === "PAID" ? t("orders.detail.paid") || "Paid" : "Pending"}
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Clock className="w-4 h-4" /> {t("orders.detail.placedOn") || "Placed on"} {formatDate(order.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate("CHAT")}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <MessageCircle className="w-4 h-4" /> Hubungi
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Items & Summary */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Line Items */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-slate-400" /> {t("orders.detail.fulfillmentItems") || "Produk yang Dibeli"}
              </h3>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {t("orders.table.items", { count: totalItemsCount }, totalItemsCount) || `${totalItemsCount} items`}
              </span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {(order.items || []).map((item: any, i: number) => {
                const img = getProductImage(item);
                const variantText = getVariantDetails(item);
                return (
                  <div key={i} className="p-6 flex gap-4">
                    <div className="w-16 h-16 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 bg-slate-50 dark:bg-slate-800">
                      <img src={img} alt={item.product?.name || "Product"} className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.product?.name || "Product"}</h4>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 font-mono mt-1">
                        SKU: {item.product?.sku || "N/A"} {variantText ? ` • ${variantText}` : ""}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {t("orders.detail.qty") || "Qty"}: {item.quantity}
                        </span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{format(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Payment Breakdown */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" /> {t("orders.detail.financialBreakdown") || "Rincian Pembayaran"}
              </h3>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Subtotal ({totalItemsCount} Produk)</span>
                <span className="text-slate-900 dark:text-white font-semibold">{format(order.total_amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Biaya Pengiriman</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider text-[10px]">GRATIS</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Metode Pembayaran</span>
                <span className="text-slate-900 dark:text-white font-semibold uppercase">{order.payment_method || "Transfer Bank"}</span>
              </div>
              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                <span className="text-base font-bold text-slate-900 dark:text-white">{t("orders.detail.totalPaid") || "Total Bayar"}</span>
                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{format(order.total_amount)}</span>
              </div>
            </div>
          </section>

        </div>

        {/* Right Col: Customer & Shipping Address */}
        <div className="space-y-8">
          
          {/* Customer Profile Card */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" /> {t("orders.detail.customerProfile") || "Profil Pelanggan"}
              </h3>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-bold text-lg flex items-center justify-center border border-indigo-200 dark:border-indigo-500/20 shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{order.customer_name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Lumina OS Buyer</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Kontak Customer</p>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{order.phone || "Tidak ada nomor telepon"}</p>
                </div>
              </div>
            </div>
          </section>

          {/* RESTORED: Shipping Address & City Card */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" /> Alamat Pengiriman
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Penerima</p>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{order.customer_name}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Alamat Lengkap</p>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                  {order.address || "Tidak ada alamat lengkap"}
                </p>
              </div>
              {order.city && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Kota / Kabupaten</p>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{order.city}</p>
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
