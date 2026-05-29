"use client";

import { useState } from "react";
import { Scale, HeartHandshake, EyeOff, CheckSquare, MessageSquare, AlertTriangle } from "lucide-react";

export default function CompliancePage() {
  const [reportText, setReportText] = useState("");
  const [reportType, setReportType] = useState("violation");
  const [submitted, setSubmitted] = useState(false);

  const pillars = [
    {
      title: "Anti-Korupsi & Suap",
      desc: "LUMINA menolak segala bentuk suap, gratifikasi, atau tindakan koruptif dalam setiap transaksi kerja sama.",
      icon: Scale,
    },
    {
      title: "Kemitraan yang Adil",
      desc: "Menjamin kontrak kerja sama yang setara dan transparan bagi semua brand mitra dan produsen lokal.",
      icon: HeartHandshake,
    },
    {
      title: "Privasi Tanpa Kompromi",
      desc: "Semua pengaduan dan penyelidikan kepatuhan dilakukan dengan menjaga identitas pelapor tetap anonim.",
      icon: EyeOff,
    },
    {
      title: "Audit Kepatuhan Rutin",
      desc: "Melakukan verifikasi produk secara berkala untuk memvalidasi kelayakan lisensi, orisinalitas, dan hak cipta.",
      icon: CheckSquare,
    },
  ];

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportText.trim()) return;
    
    // Simulate API request
    setSubmitted(true);
    setTimeout(() => {
      setReportText("");
      setSubmitted(false);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-black text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background radial overlays */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-orange-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* HERO */}
        <div className="text-center max-w-3xl mx-auto mb-24">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-orange-500 bg-orange-950/40 px-4 py-2 rounded-full border border-orange-500/20">
            Kepatuhan Hukum
          </span>
          <h1 className="mt-6 text-4xl sm:text-6xl font-black tracking-tight text-white uppercase">
            Integrity & <span className="text-orange-500">Compliance</span>
          </h1>
          <p className="mt-6 text-lg text-gray-400 leading-relaxed font-light">
            Kami menjunjung tinggi etika bisnis, transparansi operasional, dan kepatuhan hukum di setiap aspek platform kami guna memastikan ekosistem perdagangan yang adil dan tepercaya.
          </p>
        </div>

        {/* COMPLIANCE PILLARS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-28">
          {pillars.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={index}
                className="bg-zinc-900/30 border border-zinc-800/80 backdrop-blur rounded-[28px] p-8 flex gap-6 items-start transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900/40"
              >
                <div className="w-12 h-12 rounded-2xl bg-orange-950/40 border border-orange-500/20 text-orange-500 flex items-center justify-center flex-shrink-0">
                  <IconComponent size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed font-light">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* REPORTING INTEGRITY FORM */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start max-w-5xl mx-auto">
          {/* Instructions */}
          <div className="lg:col-span-2 space-y-6">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">
              Whistleblowing System
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white">
              Laporkan <span className="text-orange-500">Pelanggaran</span>
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed font-light">
              Jika Anda mendapati adanya kecurangan, suap, pemalsuan produk, atau pelanggaran etika lainnya yang melibatkan karyawan maupun partner LUMINA, silakan laporkan secara aman di sini.
            </p>
            <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl flex gap-3 text-xs text-gray-400">
              <AlertTriangle className="text-orange-500 flex-shrink-0 mt-0.5" size={16} />
              <p>Layanan ini sepenuhnya rahasia dan dienkripsi untuk melindungi privasi serta identitas diri Anda sebagai pelapor.</p>
            </div>
          </div>

          {/* Form Card */}
          <div className="lg:col-span-3 bg-zinc-900/20 border border-zinc-800/80 rounded-[32px] p-8 backdrop-blur">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-950/40 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                  <MessageSquare size={28} />
                </div>
                <h3 className="text-xl font-bold text-white">Laporan Terkirim</h3>
                <p className="text-sm text-gray-400 max-w-sm mx-auto font-light">
                  Terima kasih atas kontribusi Anda dalam menjaga integritas ekosistem LUMINA. Laporan Anda sedang diproses oleh Tim Compliance internal.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2 font-bold">Jenis Pelanggaran</label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-gray-300"
                  >
                    <option value="violation">Pelanggaran Kode Etik / Korupsi</option>
                    <option value="fake_product">Pemalsuan Produk / Hak Cipta</option>
                    <option value="data_security">Kebocoran Data / Masalah Keamanan</option>
                    <option value="other">Masalah Kepatuhan Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2 font-bold">Deskripsi Kejadian</label>
                  <textarea
                    rows={4}
                    required
                    value={reportText}
                    onChange={(e) => setReportText(e.target.value)}
                    placeholder="Sebutkan detail kejadian secara rinci (siapa, kapan, di mana, dan deskripsi pelanggaran)..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-gray-300 placeholder-zinc-600"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-lg shadow-orange-500/10 hover:shadow-orange-500/25"
                >
                  Kirim Laporan Anonim
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
