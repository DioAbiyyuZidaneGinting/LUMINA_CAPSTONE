"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowLeft, Star, ShieldCheck, Zap } from "lucide-react";
import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-[#0a0a0a] overflow-hidden font-sans">
      {/* Left Column - Dynamic Premium Branding */}
      <div className="hidden lg:flex w-[55%] relative flex-col justify-between overflow-hidden">
        {/* Animated Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2000&auto=format&fit=crop"
            alt="Auth Background"
            className="w-full h-full object-cover opacity-40 scale-105 transition-transform duration-[20s] hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a]/90 via-[#0a0a0a]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
        </div>

        <div className="relative z-10 p-16 flex flex-col h-full justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-3 text-slate-400 hover:text-white transition-all group"
            >
              <div className="p-2 bg-white/5 rounded-full backdrop-blur-md border border-white/10 group-hover:bg-white/10 transition-colors">
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              </div>
              <span className="text-xs font-semibold tracking-[0.2em] uppercase">
                Kembali
              </span>
            </Link>
          </motion.div>

          <div className="max-w-xl space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                <span className="text-xs font-medium tracking-wide text-slate-300">
                  Platform Belanja Premium
                </span>
              </div>

              <h1 className="text-5xl lg:text-[4rem] font-bold text-white tracking-tight mb-6 leading-[1.1]">
                Definisikan <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-500">
                  Gaya Anda.
                </span>
              </h1>
              <p className="text-lg text-slate-400 leading-relaxed font-light max-w-md">
                Bergabunglah dengan ribuan pelanggan eksklusif Lumina dan
                nikmati pengalaman berbelanja kelas dunia.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="grid grid-cols-2 gap-6 pt-8 border-t border-white/10"
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    Transaksi Aman
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enkripsi 256-bit
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <Zap className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    Akses Cepat
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">Login instan</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Right Column - Auth Form Area */}
      <div className="flex w-full lg:w-[45%] flex-col items-center justify-center p-6 sm:p-12 relative bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-40" />
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-slate-50 to-transparent" />

        <Link
          href="/"
          className="absolute top-6 left-6 lg:hidden inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors z-20"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Kembali</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-[440px] flex flex-col items-center relative z-10"
        >
          <div className="lg:hidden mb-10 text-center">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              LUMINA
            </h1>
          </div>

          <div className="w-full flex justify-center drop-shadow-2xl hover:drop-shadow-[0_25px_35px_rgba(0,0,0,0.1)] transition-all duration-500">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
