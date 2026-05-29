"use client";

import { ShieldCheck, HardDrive, CreditCard, Lock, Radio, Sparkles } from "lucide-react";

export default function TrustCenterPage() {
  const services = [
    {
      name: "Clerk Auth Service",
      status: "Operational",
      uptime: "99.98%",
      desc: "Autentikasi multi-faktor dan pelacakan sesi login pengguna.",
    },
    {
      name: "Supabase Core DB",
      status: "Operational",
      uptime: "99.99%",
      desc: "Basis data real-time terlindungi Row Level Security (RLS).",
    },
    {
      name: "Payment Gateways",
      status: "Operational",
      uptime: "100.00%",
      desc: "Integrasi pembayaran digital PCI-DSS Level 1.",
    },
    {
      name: "LUMINA API Endpoint",
      status: "Operational",
      uptime: "99.97%",
      desc: "Layanan back-end terenkripsi SSL/TLS 1.3.",
    },
  ];

  const securityMeasures = [
    {
      title: "Enkripsi AES-256",
      desc: "Seluruh data sensitif pelanggan dan transaksi dienkripsi saat disimpan maupun saat dikirimkan.",
      icon: Lock,
    },
    {
      title: "Row Level Security (RLS)",
      desc: "Menjamin isolasi data ketat di Supabase sehingga tidak ada pengguna lain yang dapat mengintip transaksi Anda.",
      icon: HardDrive,
    },
    {
      title: "Kepatuhan Transaksi",
      desc: "Mendukung standar industri pembayaran global guna melindungi data kartu kredit dan e-wallet Anda.",
      icon: CreditCard,
    },
    {
      title: "Otentikasi Multi-Faktor",
      desc: "Sistem Clerk menjaga keamanan kredensial login dengan otentikasi biometrik dan kode sandi sekali pakai (OTP).",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-orange-600/10 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* HERO */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-orange-500 bg-orange-950/40 px-4 py-2 rounded-full border border-orange-500/20">
            Pusat Kepercayaan
          </span>
          <h1 className="mt-6 text-4xl sm:text-6xl font-black tracking-tight text-white uppercase">
            Trust <span className="text-orange-500">Center</span>
          </h1>
          <p className="mt-6 text-lg text-gray-400 leading-relaxed font-light">
            Transparansi penuh atas keandalan infrastruktur sistem, kepatuhan privasi, serta langkah perlindungan keamanan data Anda di platform LUMINA.
          </p>
        </div>

        {/* SERVICE STATUS */}
        <div className="mb-24">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-zinc-800/80 mb-10">
            <div>
              <h2 className="text-2xl font-bold uppercase tracking-tight">Status Layanan Real-Time</h2>
              <p className="text-xs text-gray-500 mt-1">Status dan uptime rata-rata infrastruktur dalam 30 hari terakhir.</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-950/40 border border-emerald-500/20 rounded-full text-emerald-500 text-xs font-bold shadow-lg shadow-emerald-500/5 animate-pulse">
              <Radio size={14} />
              <span>All Systems Operational</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((svc, index) => (
              <div
                key={index}
                className="bg-zinc-900/30 border border-zinc-800/80 rounded-[24px] p-6 backdrop-blur transition-all duration-300 hover:border-zinc-700/60"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-black tracking-wide text-gray-400 uppercase">{svc.name}</span>
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-950/30 border border-emerald-500/10 px-2 py-0.5 rounded-full">
                    {svc.status}
                  </span>
                </div>
                <p className="text-3xl font-black text-white">{svc.uptime}</p>
                <p className="text-xs text-gray-500 mt-3 font-light leading-relaxed">{svc.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SECURITY & DATA PROTECTION */}
        <div>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold uppercase tracking-tight">
              Standar <span className="text-orange-500">Keamanan</span> Data
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Langkah-langkah terpadu kami untuk meminimalkan kerentanan sistem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {securityMeasures.map((measure, index) => {
              const IconComponent = measure.icon;
              return (
                <div
                  key={index}
                  className="bg-zinc-900/30 border border-zinc-800/80 rounded-[28px] p-8 flex gap-6 items-start transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900/40"
                >
                  <div className="w-12 h-12 rounded-2xl bg-orange-950/40 border border-orange-500/20 text-orange-500 flex items-center justify-center flex-shrink-0">
                    <IconComponent size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      {measure.title}
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed font-light font-sans">
                      {measure.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COMPLIANCE STANDARDS BADGE BANNER */}
        <div className="mt-24 bg-zinc-900/20 border border-zinc-800/60 rounded-[32px] p-8 backdrop-blur text-center max-w-3xl mx-auto flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 rounded-full bg-orange-950/40 border border-orange-500/20 text-orange-500 flex items-center justify-center">
            <Sparkles size={18} />
          </div>
          <h3 className="text-lg font-bold">Komitmen Keamanan Transaksi</h3>
          <p className="text-xs text-gray-400 leading-relaxed font-light max-w-md">
            LUMINA mematuhi praktik tata kelola terbaik di industri dengan audit reguler untuk menjaga integritas data pembayaran dan transaksi keuangan Anda.
          </p>
        </div>
      </div>
    </div>
  );
}
