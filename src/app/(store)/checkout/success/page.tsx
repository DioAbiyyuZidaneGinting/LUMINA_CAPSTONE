"use client";

import { CheckCircle2, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import confetti from "canvas-confetti";

export default function CheckoutSuccessPage() {
  useEffect(() => {
    // Fire confetti on success
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-xl border border-zinc-100 text-center relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-green-50 rounded-full opacity-50"></div>
        
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-500 animate-bounce">
            <CheckCircle2 size={48} />
          </div>
        </div>

        <h1 className="text-3xl font-black text-black mb-4">Pesanan Berhasil!</h1>
        <p className="text-zinc-500 mb-10 leading-relaxed text-sm">
          Terima kasih telah berbelanja di Pijak. Pesanan Anda sedang kami proses dan akan segera dikirimkan. Cek email atau dashboard Anda untuk update status pengiriman.
        </p>

        <div className="space-y-4">
          <Link
            href="/"
            className="w-full bg-black text-white flex items-center justify-center gap-2 py-4 rounded-2xl font-bold hover:bg-zinc-800 transition shadow-lg active:scale-[0.98]"
          >
            <ShoppingBag size={20} />
            Lanjut Belanja
          </Link>
          
          <Link
            href="/admin" 
            className="w-full bg-zinc-50 text-zinc-600 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold hover:bg-zinc-100 transition border border-zinc-200"
          >
            Lihat Status Pesanan
            <ArrowRight size={18} />
          </Link>
        </div>

        <p className="mt-8 text-[10px] text-zinc-400">
          Order ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
        </p>
      </div>
    </div>
  );
}
