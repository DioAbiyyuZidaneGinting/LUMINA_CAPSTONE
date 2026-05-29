"use client";

import { Shield, Sparkles, Target, Compass, Award, Users } from "lucide-react";

export default function LeadershipPage() {
  const principles = [
    {
      title: "Inovasi Tanpa Batas",
      desc: "Kami terus beradaptasi dan mendorong inovasi teknologi demi mempermudah pengalaman belanja online.",
      icon: Sparkles,
      color: "text-orange-500 bg-orange-950/40 border-orange-500/20",
    },
    {
      title: "Fokus Pelanggan",
      desc: "Menyediakan layanan responsif, perlindungan data terjamin, dan proses belanja transparan.",
      icon: Target,
      color: "text-blue-500 bg-blue-950/40 border-blue-500/20",
    },
    {
      title: "Integritas & Etika",
      desc: "Menjalankan tata kelola platform dengan standar kepatuhan tinggi serta kejujuran mutlak.",
      icon: Shield,
      color: "text-emerald-500 bg-emerald-950/40 border-emerald-500/20",
    },
    {
      title: "Pemberdayaan Ekosistem",
      desc: "Mendukung brand lokal dan global dalam menjangkau audiens secara efisien dan andal.",
      icon: Users,
      color: "text-purple-500 bg-purple-950/40 border-purple-500/20",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-orange-600/10 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* HERO */}
        <div className="text-center max-w-3xl mx-auto mb-24">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-orange-500 bg-orange-950/40 px-4 py-2 rounded-full border border-orange-500/20">
            Tata Kelola
          </span>
          <h1 className="mt-6 text-4xl sm:text-6xl font-black tracking-tight text-white uppercase">
            Leadership <span className="text-orange-500">Team</span>
          </h1>
          <p className="mt-6 text-lg text-gray-400 leading-relaxed font-light">
            Visi kami diarahkan oleh komitmen terhadap keunggulan operasional, inovasi digital, dan kepatuhan global guna menghadirkan ekosistem ritel modern yang aman bagi semua pihak.
          </p>
        </div>

        {/* GUIDING PRINCIPLES */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold uppercase tracking-tight">
              Prinsip <span className="text-orange-500">Kepemimpinan</span>
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Pilar utama yang memandu pengambilan keputusan strategis kami.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {principles.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={index}
                  className="bg-zinc-900/30 border border-zinc-800/80 backdrop-blur rounded-[28px] p-8 transition-all duration-300 hover:-translate-y-1.5 hover:bg-zinc-900/60 hover:border-zinc-700/60 flex flex-col"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border mb-6 ${item.color}`}>
                    <IconComponent size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed font-light">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* OPERATIONAL EXCELLENCE */}
        <div className="bg-zinc-900/20 border border-zinc-800/60 rounded-[32px] p-8 sm:p-12 backdrop-blur max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">
                Pilar Fokus 2026
              </span>
              <h2 className="mt-3 text-3xl font-bold uppercase tracking-tight text-white">
                Fokus <span className="text-orange-500">Strategis</span> Lumina
              </h2>
              <p className="mt-4 text-sm text-gray-400 leading-relaxed font-light">
                Manajemen LUMINA menaruh perhatian penuh pada peningkatan keandalan data transaksi, pemanfaatan algoritma cerdas untuk prediksi stok barang, serta sinkronisasi data pelanggan secara real-time guna meminimalkan hambatan operasional dan memaksimalkan kepuasan pelanggan.
              </p>
              
              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 mt-0.5 flex-shrink-0">
                    <Award size={12} />
                  </div>
                  <span className="text-sm text-gray-300">Skalabilitas infrastruktur cloud berbasis real-time.</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 mt-0.5 flex-shrink-0">
                    <Compass size={12} />
                  </div>
                  <span className="text-sm text-gray-300">Pengurangan emisi karbon operasional lewat optimasi rantai pasok.</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-tr from-orange-500/10 to-blue-500/10 border border-zinc-800 rounded-[24px] p-8 aspect-video sm:aspect-auto sm:h-64 flex flex-col justify-center">
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Pernyataan Visi</p>
                <p className="text-lg sm:text-xl font-medium italic text-gray-200">
                  "Menciptakan destinasi e-commerce premium yang tidak hanya menjual produk berkualitas, melainkan juga menumbuhkan rasa percaya melalui kejujuran, kepatuhan hukum, dan teknologi terdepan."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
