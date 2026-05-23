"use client";

import { useCart } from "../../../lib/CartContext";
import { formatIDR } from "../../components/ui/utils";
import { supabase } from "../../../lib/supabase";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { processOrderTransaction } from "../../../lib/inventory/processOrder";
import { ChevronLeft, CreditCard, Truck, MapPin, User, Phone, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { telemetry } from "../../../lib/telemetry";

export default function CheckoutPage() {
  const { cart, clearCart, appliedVoucher } = useCart();
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: "",
    phone: "",
    address: "",
    province_city: "",
    payment_method: "Transfer Bank",
  });

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in");
    }
  }, [user, isLoaded, router]);

  useEffect(() => {
    if (isLoaded && cart.length === 0) {
      router.push("/cart");
    }
  }, [cart, isLoaded, router]);

  useEffect(() => {
    if (cart.length > 0) {
      try {
        telemetry.track('checkout_start');
      } catch (e) {}
    }
  }, [cart.length]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = appliedVoucher ? subtotal * appliedVoucher.discount : 0;
  const shippingFee = 0; // Free shipping as per cart page
  const finalTotal = subtotal - discountAmount + shippingFee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isFormComplete =
    formData.customer_name.trim() !== "" &&
    formData.phone.trim() !== "" &&
    formData.address.trim() !== "" &&
    formData.province_city.trim() !== "" &&
    formData.payment_method !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isFormComplete) return;

    if (cart.length === 0) {
      toast.error("Keranjang Kosong", {
        description: "Silakan tambahkan produk sebelum melakukan checkout.",
      });
      return;
    }

    setIsSubmitting(true);

    const orderNumber = `LUMINA-${Math.floor(100000 + Math.random() * 900000)}`;

    const orderData = {
      order_number: orderNumber,
      user_id: user.id,
      customer_name: formData.customer_name,
      phone: formData.phone,
      address: formData.address,
      customer_address: `${formData.address}, ${formData.province_city}`,
      city: formData.province_city,
      total_amount: Math.round(finalTotal),
      payment_method: formData.payment_method,
      payment_status: "pending",
      status: "pending",
    };

    // DEBUG LOGGING
    console.log("Memulai proses pembuatan pesanan...");
    console.log("Order Data:", orderData);

    // Map to ProcessOrderItem format
    const processItems = cart.map(item => ({
      product_id: item.id.toString(),
      variant_id: ((item as any).variantId || (item as any).variant_id || null) as string | null,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.price * item.quantity,
      image: (item as any).image || (item.images && item.images[0])
    }));

    try {
      await processOrderTransaction(orderData as any, processItems);

      try {
        telemetry.trackPurchase(orderNumber, Math.round(finalTotal), 'IDR');
      } catch (e) {}

      toast.success("Pesanan Berhasil!");
      clearCart();
      router.push("/orders");
    } catch (err: any) {
      console.error("Runtime Error:", err);
      
      if (err.code === "42P01") {
        toast.error("Gagal: Tabel 'orders' Belum Ada", {
          description: "Pastikan Anda sudah menjalankan SQL migrasi.",
        });
      } else {
        toast.error("Gagal Membuat Pesanan", {
          description: err.message || "Gagal menghubungkan ke database.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded || cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* TOP STEPS */}
      <div className="w-full bg-white border-b border-zinc-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-4 py-6">
          {/* STEP 1 - COMPLETED */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
              <CheckCircle2 size={16} />
            </div>
            <span className="text-sm font-semibold text-green-600">
              Keranjang
            </span>
          </div>

          <div className="w-16 h-[2px] bg-green-200" />

          {/* STEP 2 - ACTIVE */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold shadow-md ring-4 ring-zinc-50">
              2
            </div>
            <span className="text-sm font-bold text-black">Checkout</span>
          </div>

          <div className="w-16 h-[2px] bg-zinc-200" />

          {/* STEP 3 - INACTIVE */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-zinc-200 text-zinc-400 flex items-center justify-center text-xs font-bold">
              3
            </div>
            <span className="text-sm font-medium text-zinc-400">Ulasan</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b border-zinc-100 px-6 py-4 lg:hidden">
        <div className="flex items-center gap-4">
          <Link
            href="/cart"
            className="text-zinc-400 hover:text-black transition"
          >
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-lg font-bold text-black">Checkout</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <form id="checkout-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Shipping Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100">
              <div className="flex items-center gap-2 mb-6">
                <MapPin size={20} className="text-black" />
                <h2 className="text-lg font-bold">Informasi Pengiriman</h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">
                      Nama Penerima
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        name="customer_name"
                        value={formData.customer_name}
                        onChange={handleInputChange}
                        placeholder="Masukkan nama lengkap"
                        className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-black transition"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">
                      Nomor Telepon
                    </label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Contoh: 08123456789"
                        className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-black transition"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">
                    Provinsi / Kota / Kecamatan
                  </label>
                  <input
                    type="text"
                    name="province_city"
                    value={formData.province_city}
                    onChange={handleInputChange}
                    placeholder="Contoh: Jawa Barat, Bandung, Coblong"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-black transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">
                    Alamat Lengkap
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Nama jalan, nomor rumah, RT/RW"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-black transition min-h-[100px]"
                    required
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100">
              <div className="flex items-center gap-2 mb-6">
                <CreditCard size={20} className="text-black" />
                <h2 className="text-lg font-bold">Metode Pembayaran</h2>
              </div>

              <select
                name="payment_method"
                value={formData.payment_method}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-black transition"
              >
                <option value="Transfer Bank">Transfer Bank (BCA/Mandiri)</option>
                <option value="E-Wallet">E-Wallet (GOPAY/OVO/DANA)</option>
                <option value="COD">Bayar di Tempat (COD)</option>
              </select>
            </div>
          </div>

          {/* RIGHT: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100 sticky top-24">
              <h2 className="text-lg font-bold mb-6">Ringkasan Pesanan</h2>

              {/* Items List */}
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 bg-zinc-100 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={(item as any).image || item.images?.[0] || "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-black truncate">{item.name}</p>
                      <p className="text-xs text-zinc-400">Qty: {item.quantity}</p>
                      <p className="text-sm font-medium text-zinc-900">{formatIDR(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 pt-6 border-t border-zinc-100 mb-6">
                <div className="flex justify-between text-sm text-zinc-500">
                  <span>Subtotal</span>
                  <span className="font-medium text-black">{formatIDR(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-red-500">
                    <span>Diskon</span>
                    <span className="font-medium">-{formatIDR(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-zinc-500">
                  <span>Pengiriman</span>
                  <span className="text-green-600 font-medium">Gratis</span>
                </div>
                <div className="pt-3 border-t border-zinc-100 flex justify-between items-center">
                  <span className="font-bold">Total</span>
                  <span className="text-xl font-bold text-black">{formatIDR(finalTotal)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !isFormComplete}
                className={`hidden lg:flex w-full rounded-xl py-4 text-sm font-bold transition shadow-lg items-center justify-center gap-2 ${
                  isSubmitting || !isFormComplete
                    ? "bg-zinc-200 text-zinc-400 cursor-not-allowed opacity-70"
                    : "bg-black text-white hover:bg-zinc-800 active:scale-[0.98]"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Memproses...
                  </>
                ) : (
                  "Buat Pesanan Sekarang"
                )}
              </button>

              <p className="text-[10px] text-center text-zinc-400 mt-4 leading-relaxed">
                Dengan menekan tombol di atas, Anda menyetujui syarat dan ketentuan yang berlaku di Pijak.
              </p>
            </div>
          </div>
        </form>
      </div>

      {/* MOBILE STICKY BOTTOM CHECKOUT CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white/85 backdrop-blur-xl border-t border-zinc-200/50 z-50 transition-transform duration-300 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 px-4 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Total Bayar</span>
            <span className="font-black text-black text-sm">{formatIDR(finalTotal)}</span>
          </div>
          <button
            type="submit"
            form="checkout-form"
            disabled={isSubmitting || !isFormComplete}
            className={`flex-1 rounded-xl py-3 px-6 font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 ${
              isSubmitting || !isFormComplete
                ? "bg-zinc-200 text-zinc-400 cursor-not-allowed opacity-70"
                : "bg-black text-white hover:bg-zinc-800 active:scale-95 shadow-black/20"
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Memproses...
              </>
            ) : (
              "Buat Pesanan"
            )}
          </button>
        </div>
      </div>

      {/* Spacer for mobile safe area */}
      <div className="h-24 lg:hidden" />
    </div>
  );
}
