"use client";

import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "@/store/languageStore";
import { useUser } from "@clerk/nextjs";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";
import { processOrderTransaction } from "@/lib/inventory/processOrder";

interface AddSalesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddSalesModal({ isOpen, onClose }: AddSalesModalProps) {
  const { t } = useTranslation();
  const { user } = useUser();
  const supabase = useSupabaseClient();

  const [products, setProducts] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedVariant, setSelectedVariant] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [paymentMethod, setPaymentMethod] = useState("Transfer Bank");
  const [paymentStatus, setPaymentStatus] = useState("paid");
  const [orderStatus, setOrderStatus] = useState("processing");

  // Load Products on Open
  useEffect(() => {
    if (!isOpen) return;

    async function loadProducts() {
      try {
        setIsLoadingProducts(true);
        const { data, error } = await supabase
          .from("products")
          .select("id, name, base_price")
          .order("name");

        if (error) throw error;
        setProducts(data || []);
      } catch (err: any) {
        console.error("Gagal memuat produk:", err);
        toast.error("Gagal memuat katalog produk", {
          description: err.message,
        });
      } finally {
        setIsLoadingProducts(false);
      }
    }

    loadProducts();
  }, [isOpen]);

  // Load Variants when Selected Product Changes
  useEffect(() => {
    if (!selectedProduct) {
      setVariants([]);
      setSelectedVariant("");
      return;
    }

    async function loadVariants() {
      try {
        const { data, error } = await supabase
          .from("product_variants")
          .select("*, colors(*)")
          .eq("product_id", selectedProduct);

        if (error) throw error;
        setVariants(data || []);
        setSelectedVariant("");
      } catch (err: any) {
        console.error("Gagal memuat varian:", err);
        toast.error("Gagal memuat varian produk");
      }
    }

    loadVariants();
  }, [selectedProduct]);

  if (!isOpen) return null;

  // Calculate pricing based on cascading hierarchy
  const prod = products.find(p => p.id === selectedProduct);
  const selectedVariantObj = variants.find(v => v.id === selectedVariant);
  
  const unitPrice = selectedVariantObj
    ? Number(selectedVariantObj.price || selectedVariantObj.price_override || prod?.base_price || 0)
    : Number(prod?.base_price || 0);

  const subtotalAmount = unitPrice * Number(quantity || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      toast.error("Nama Pelanggan wajib diisi!");
      return;
    }
    if (!phone.trim()) {
      toast.error("No. Telepon wajib diisi!");
      return;
    }
    if (!address.trim()) {
      toast.error("Alamat Lengkap wajib diisi!");
      return;
    }
    if (!city.trim()) {
      toast.error("Kota / Kabupaten wajib diisi!");
      return;
    }
    if (!selectedProduct) {
      toast.error("Pilih produk yang dijual!");
      return;
    }
    if (Number(quantity) <= 0) {
      toast.error("Jumlah kuantitas harus minimal 1!");
      return;
    }

    try {
      setIsSubmitting(true);

      if (!user?.id) {
        toast.error("Sesi autentikasi admin tidak ditemukan!", {
          description: "Harap masuk kembali ke akun Clerk Anda.",
        });
        setIsSubmitting(false);
        return;
      }

      // Generate dynamic unique order number
      const orderNumber = `LUMINA-${Math.floor(100000 + Math.random() * 900000)}`;
      const userId = user.id;

      const orderPayload = {
        order_number: orderNumber,
        user_id: userId,
        customer_name: customerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        customer_address: `${address.trim()}, ${city.trim()}`,
        city: city.trim(),
        total_amount: subtotalAmount,
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        status: orderStatus,
        stock_deducted: true
      };

      const orderItemPayload = {
        product_id: selectedProduct,
        variant_id: selectedVariant || null,
        name: prod?.name || "Unknown Product",
        quantity: Number(quantity),
        price: unitPrice,
        subtotal: subtotalAmount
      };

      await processOrderTransaction(orderPayload, [orderItemPayload]);

      toast.success("Transaksi Penjualan Berhasil Disimpan!", {
        description: `Order ${orderNumber} telah terdaftar.`,
      });

      // Reset form & Close
      setCustomerName("");
      setPhone("");
      setAddress("");
      setCity("");
      setSelectedProduct("");
      setSelectedVariant("");
      setQuantity("1");
      setPaymentMethod("Transfer Bank");
      setPaymentStatus("paid");
      setOrderStatus("processing");
      onClose();
    } catch (err: any) {
      console.error("Gagal menyimpan penjualan:", err);
      toast.error("Gagal menyimpan transaksi", {
        description: err.message || "Terjadi kesalahan pada database Supabase.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl z-[101] overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 transition-colors">
        
        {/* Header */}
        <div className="p-8 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {t("orders.modal.addSales") || "Input Penjualan Baru"}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t("orders.modal.subtitle") || "Log transaksi penjualan manual langsung ke database."}
              </p>
            </div>
            <button 
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
            
            {/* Section 1: Customer Info */}
            <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800/60 rounded-xl p-6 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                Informasi Pelanggan & Alamat Pengiriman
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Nama Lengkap *</label>
                  <input 
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">No. Kontak / Telepon *</label>
                  <input 
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: +62 812 3456 7890"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm transition-colors"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Alamat Lengkap Jalan *</label>
                  <input 
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Contoh: Jl. Jendral Sudirman No. 45 Blok C"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Kota / Kabupaten *</label>
                  <input 
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Contoh: Jakarta Selatan"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Catalog Products & Quantity */}
            <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800/60 rounded-xl p-6 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                Detail Transaksi Produk
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pilih Produk *</label>
                  <select 
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    required
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm transition-colors"
                  >
                    <option value="" disabled className="text-slate-400">-- Pilih Produk --</option>
                    {isLoadingProducts ? (
                      <option disabled>Memuat katalog...</option>
                    ) : (
                      products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))
                    )}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pilih Varian</label>
                  <select 
                    value={selectedVariant}
                    onChange={(e) => setSelectedVariant(e.target.value)}
                    disabled={!selectedProduct || variants.length === 0}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-800 shadow-sm transition-colors"
                  >
                    <option value="">{variants.length === 0 ? "Tidak Ada Varian" : "-- Pilih Varian --"}</option>
                    {variants.map(v => {
                      const label = `${v.size} - ${v.custom_sku || 'NO-SKU'}${v.colors?.name ? ` (${v.colors.name})` : ''}`;
                      return (
                        <option key={v.id} value={v.id}>{label}</option>
                      );
                    })}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Jumlah Unit *</label>
                  <input 
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Payment & Operational Status */}
            <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800/60 rounded-xl p-6 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                Status Pembayaran & Pemenuhan
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Metode Pembayaran</label>
                  <select 
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm transition-colors"
                  >
                    <option value="Transfer Bank">Transfer Bank</option>
                    <option value="E-Wallet">E-Wallet (OVO/Dana)</option>
                    <option value="Kartu Kredit">Kartu Kredit</option>
                    <option value="COD">COD (Bayar di Tempat)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Status Pembayaran</label>
                  <select 
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm transition-colors"
                  >
                    <option value="paid">Lunas (Paid)</option>
                    <option value="pending">Tertunda (Pending)</option>
                    <option value="failed">Gagal (Failed)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Status Alur Pemenuhan</label>
                  <select 
                    value={orderStatus}
                    onChange={(e) => setOrderStatus(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm transition-colors"
                  >
                    <option value="pending">Menunggu (Pending)</option>
                    <option value="processing">Diproses (Processing)</option>
                    <option value="shipped">Dikirim (Shipped)</option>
                    <option value="completed">Selesai (Completed)</option>
                    <option value="cancelled">Dibatalkan (Cancelled)</option>
                  </select>
                </div>
              </div>
            </div>
            
          </div>

          {/* Footer Billing Details & Actions */}
          <div className="p-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4">
            
            {/* Live Pricing Panel */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Estimasi Total Tagihan</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  Rp {subtotalAmount.toLocaleString("id-ID")}
                </span>
                {selectedProduct && (
                  <span className="text-[11px] font-medium text-slate-400">
                    ({quantity} x Rp {unitPrice.toLocaleString("id-ID")})
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Kembali
              </button>
              
              <button 
                type="submit"
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-black uppercase tracking-widest px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Transaksi"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
