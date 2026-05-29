"use client";

import { useState } from "react";
import { ShieldCheck, Eye, Database, Key, Trash2, HelpCircle } from "lucide-react";

export default function PrivacyPage() {
  const [activeTab, setActiveTab] = useState("collection");

  const sections = [
    {
      id: "collection",
      label: "Pengumpulan Data",
      title: "Data Apa yang Kami Kumpulkan?",
      icon: Database,
      content: (
        <div className="space-y-4">
          <p className="text-gray-300 leading-relaxed font-light">
            Kami mengumpulkan data yang Anda berikan langsung kepada kami saat melakukan registrasi akun, pemesanan produk, dan pengisian formulir profil. Data ini mencakup:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-gray-400 text-sm font-light">
            <li>Identitas Personal: Nama lengkap, alamat email, dan nomor telepon yang divalidasi via <strong className="text-white">Clerk Authentication</strong>.</li>
            <li>Informasi Transaksi: Detail pesanan belanja, alamat pengiriman, dan riwayat pembayaran.</li>
            <li>Data Teknis: Alamat IP, jenis perangkat, dan catatan interaksi web yang direkam untuk tujuan keamanan.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "usage",
      label: "Penggunaan Data",
      title: "Bagaimana Kami Menggunakan Data Anda?",
      icon: Eye,
      content: (
        <div className="space-y-4">
          <p className="text-gray-300 leading-relaxed font-light">
            Informasi yang dikumpulkan digunakan secara eksklusif untuk mendukung dan meningkatkan kualitas layanan di dalam ekosistem LUMINA:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-gray-400 text-sm font-light">
            <li>Memproses transaksi pembelian dan mengirimkan status pesanan secara real-time.</li>
            <li>Melakukan sinkronisasi data pelanggan dengan aman antara sistem otentikasi Clerk dan basis data internal <strong className="text-white">Supabase</strong>.</li>
            <li>Menyajikan rekomendasi produk yang disesuaikan serta memvalidasi diskon kupon belanja Anda.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "security",
      label: "Keamanan & Enkripsi",
      title: "Bagaimana Kami Melindungi Data Anda?",
      icon: ShieldCheck,
      content: (
        <div className="space-y-4">
          <p className="text-gray-300 leading-relaxed font-light">
            Keamanan informasi Anda adalah prioritas mutlak kami. Kami menerapkan protokol keamanan canggih:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-gray-400 text-sm font-light">
            <li>Enkripsi end-to-end (SSL/TLS) pada semua transmisi data transaksi.</li>
            <li>Penyimpanan kata sandi dan kredensial sensitif yang sepenuhnya dikelola oleh Clerk dengan standar kepatuhan SOC2.</li>
            <li>Row Level Security (RLS) diaktifkan secara ketat di Supabase guna memastikan hanya Anda yang dapat mengakses data pribadi Anda.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "rights",
      label: "Hak Pengguna",
      title: "Kendalikan Data Anda",
      icon: Trash2,
      content: (
        <div className="space-y-4">
          <p className="text-gray-300 leading-relaxed font-light">
            Kami menjamin kontrol penuh kepada Anda atas seluruh data pribadi yang tersimpan dalam sistem kami:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-gray-400 text-sm font-light">
            <li>Anda berhak melihat, mengedit, atau melengkapi profil akun Anda kapan saja melalui halaman profil.</li>
            <li>Anda berhak mengajukan penghapusan akun beserta riwayat transaksi terkait dengan menghubungi saluran dukungan kami.</li>
            <li>Anda dapat menolak cookie pelacakan non-esensial melalui pengaturan browser Anda tanpa mengganggu fungsionalitas dasar belanja.</li>
          </ul>
        </div>
      ),
    },
  ];

  const activeSection = sections.find((s) => s.id === activeTab) || sections[0];
  const ActiveIcon = activeSection.icon;

  return (
    <div className="min-h-screen bg-black text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Glow elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-orange-600/10 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* HERO */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-orange-500 bg-orange-950/40 px-4 py-2 rounded-full border border-orange-500/20">
            Kebijakan
          </span>
          <h1 className="mt-6 text-4xl sm:text-6xl font-black tracking-tight text-white uppercase">
            Kebijakan <span className="text-orange-500">Privasi</span>
          </h1>
          <p className="mt-6 text-lg text-gray-400 leading-relaxed font-light">
            Transparansi adalah kunci kepercayaan. Di LUMINA, kami merancang kebijakan privasi yang jelas untuk menjamin hak-hak privasi Anda terlindungi sepenuhnya selama bertransaksi.
          </p>
        </div>

        {/* INTERACTIVE CONTAINER */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* TAB BUTTONS */}
          <div className="lg:col-span-1 space-y-2">
            {sections.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left py-4 px-5 rounded-2xl border transition-all duration-300 flex items-center gap-3 ${
                    activeTab === tab.id
                      ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/15"
                      : "bg-zinc-900/30 border-zinc-800 text-gray-400 hover:text-white hover:border-zinc-700"
                  }`}
                >
                  <TabIcon size={18} />
                  <span className="text-sm font-semibold tracking-wide">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB CONTENT */}
          <div className="lg:col-span-3 bg-zinc-900/20 border border-zinc-800/80 rounded-[32px] p-8 sm:p-10 backdrop-blur min-h-[300px] flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-6 border-b border-zinc-800/60">
                <div className="w-10 h-10 rounded-xl bg-orange-950/40 border border-orange-500/20 text-orange-500 flex items-center justify-center">
                  <ActiveIcon size={20} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white">
                  {activeSection.title}
                </h2>
              </div>
              <div>{activeSection.content}</div>
            </div>

            <div className="mt-12 pt-6 border-t border-zinc-800/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs text-gray-500">
              <p>Terakhir Diperbarui: 29 Mei 2026</p>
              <div className="flex items-center gap-1.5 text-gray-400">
                <HelpCircle size={14} />
                <span>Ada pertanyaan? Hubungi support@lumina.id</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
