"use client";

import { useCart } from "../../../lib/CartContext";
import { supabase } from "../../../lib/supabase";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, Ticket, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function CouponPage() {
  const { user, isLoaded } = useUser();
  const { applyVoucher, appliedVoucher, clearVoucher } = useCart();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isNewCustomer, setIsNewCustomer] = useState(false);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in");
    }
  }, [user, isLoaded, router]);

  useEffect(() => {
    async function checkOrderHistory() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("orders")
          .select("id")
          .eq("user_id", user.id)
          .limit(1);

        if (error) {
          // If table doesn't exist, we assume they are a new customer for now
          // or at least don't crash the page
          if (error.code === "42P01") {
            setIsNewCustomer(true);
          } else {
            throw error;
          }
        } else {
          setIsNewCustomer(!data || data.length === 0);
        }
      } catch (err: any) {
        console.error("Error checking orders:", err);
        // Default to true if table is missing or error occurs
        setIsNewCustomer(true);
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      checkOrderHistory();
    }
  }, [user]);

  const handleApply = (code: string, discount: number) => {
    applyVoucher(code, discount);
    toast.success(`Voucher ${code} berhasil dipasang!`, {
      description: `Anda mendapatkan potongan harga sebesar ${discount * 100}%.`,
    });
    router.push("/cart");
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center gap-4">
        <Link href="/cart" className="text-zinc-400 hover:text-black transition">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-lg font-bold text-black">Pilih Kupon</h1>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {isNewCustomer ? (
          <div className="space-y-4">
            <h2 className="text-zinc-500 text-sm font-medium uppercase tracking-wider mb-2">
              Kupon Tersedia Untuk Anda
            </h2>

            {/* Voucher Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100 flex items-start gap-4 relative overflow-hidden group">
              {/* Decorative Circle */}
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#f5f5f5] rounded-full border border-zinc-100 shadow-inner"></div>
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#f5f5f5] rounded-full border border-zinc-100 shadow-inner"></div>

              <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center flex-shrink-0 text-orange-500">
                <Ticket size={32} />
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-black mb-1">
                      Voucher Pengguna Baru
                    </h3>
                    <p className="text-3xl font-black text-orange-500 mb-2">
                      Potongan 15%
                    </p>
                  </div>
                  {appliedVoucher?.code === "NEWUSER15" && (
                    <div className="text-green-500">
                      <CheckCircle2 size={24} />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-zinc-400 text-xs mb-4">
                  <span>Berlaku hingga:</span>
                  <span className="font-medium text-zinc-600">31 Des 2026</span>
                </div>

                {appliedVoucher?.code === "NEWUSER15" ? (
                  <button
                    onClick={clearVoucher}
                    className="w-full py-3 rounded-xl border border-zinc-200 text-zinc-500 text-sm font-bold hover:bg-zinc-50 transition"
                  >
                    Batal Gunakan
                  </button>
                ) : (
                  <button
                    onClick={() => handleApply("NEWUSER15", 0.15)}
                    className="w-full py-3 rounded-xl bg-black text-white text-sm font-bold hover:bg-zinc-800 transition shadow-lg active:scale-[0.98]"
                  >
                    Gunakan Voucher
                  </button>
                )}
              </div>
            </div>

            <p className="text-center text-zinc-400 text-xs mt-8">
              Kupon lainnya akan segera hadir. Pastikan Anda selalu cek halaman ini!
            </p>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-zinc-100">
            <Ticket size={48} className="mx-auto text-zinc-200 mb-4" />
            <h2 className="text-xl font-bold text-black mb-2">
              Belum Ada Kupon Baru
            </h2>
            <p className="text-zinc-500 text-sm max-w-xs mx-auto mb-8">
              Maaf, saat ini tidak ada kupon yang tersedia untuk akun Anda.
              Kupon pengguna baru hanya berlaku untuk pesanan pertama.
            </p>
            <Link
              href="/cart"
              className="inline-flex bg-black text-white px-8 py-3 rounded-xl text-sm font-bold"
            >
              Kembali ke Keranjang
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
