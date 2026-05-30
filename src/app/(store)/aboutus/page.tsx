"use client";

import { useState, useEffect } from "react";
import { FaLinkedin, FaInstagram, FaGithub } from "react-icons/fa";
import { supabase } from "../../../lib/supabase";

export default function AboutPage() {
  const [stats, setStats] = useState({
    users: 14,
    products: 17,
    brands: 4,
  });

  useEffect(() => {
    async function fetchCounts() {
      try {
        // Fetch active products count
        const { count: prodCount } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true });

        // Fetch brands (categories or collections) count as a fallback or placeholder
        const { count: catCount } = await supabase
          .from("categories")
          .select("*", { count: "exact", head: true });

        setStats({
          users: 14, // Real CRM count from dashboard
          products: prodCount || 17,
          brands: catCount || 4,
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    }
    fetchCounts();
  }, []);

  interface TeamMember {
    name: string;
    instagram: string;
    linkedin: string;
    avatarGradient: string;
    github?: string;
  }

  const teamMembers: TeamMember[] = [
    {
      name: "Haerul Algifar",
      instagram: "https://www.instagram.com/haerul_920",
      linkedin: "https://www.linkedin.com/in/haerul920",
      avatarGradient: "from-purple-600 to-indigo-600",
    },
    {
      name: "Dio Abiyyu Zidane Ginting",
      instagram: "https://www.instagram.com/my_nameis_dio?igsh=MWl2aHlwM216OXp2Mg==",
      linkedin: "https://www.linkedin.com/in/dioabiyyuzidaneginting13/",
      avatarGradient: "from-blue-600 to-cyan-500",
    },
    {
      name: "Eric Yedija Sinaga",
      instagram: "https://www.instagram.com/ericyedijas?igsh=MW81Y2xmZzN3YTEzbw==",
      linkedin: "https://www.linkedin.com/in/eric-yedija-sinaga-9627a537b/",
      avatarGradient: "from-emerald-500 to-teal-600",
    },
    {
      name: "Erlangga Pradana Kurniawan",
      instagram: "https://www.instagram.com/forpraada/",
      linkedin: "https://www.linkedin.com/in/erlangga-pradana-kurniawan-b081aa30b/",
      avatarGradient: "from-orange-500 to-rose-500",
    },
    {
      name: "Naufal Helmy",
      instagram: "https://www.instagram.com/naufalhelmyy/",
      linkedin: "https://www.linkedin.com/in/naufal-helmy-mustofa?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app",
      avatarGradient: "from-pink-500 to-rose-600",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-orange-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* HERO SECTION */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-orange-500 bg-orange-950/40 px-4 py-2 rounded-full border border-orange-500/20">
            Kisah Kami
          </span>
          <h1 className="mt-6 text-4xl sm:text-6xl font-black tracking-tight text-white uppercase">
            Mendefinisikan <span className="text-orange-500">Masa Depan</span> Belanja
          </h1>
          <p className="mt-6 text-lg text-gray-400 leading-relaxed font-light">
            LUMINA adalah platform e-commerce premium yang dirancang untuk memberikan kemudahan, kecepatan, dan kenyamanan maksimal bagi para pelanggan. Kami menyatukan produk-produk terbaik dengan teknologi mutakhir untuk menciptakan ekosistem belanja masa kini.
          </p>
        </div>

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto mb-28">
          <div className="bg-zinc-900/40 border border-zinc-800/80 backdrop-blur rounded-[24px] p-8 text-center transition-all duration-300 hover:border-zinc-700/60 hover:bg-zinc-900/60">
            <p className="text-4xl sm:text-5xl font-black text-white">+{stats.users}</p>
            <p className="mt-2 text-xs uppercase tracking-widest text-gray-500">Profil Aktif</p>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/80 backdrop-blur rounded-[24px] p-8 text-center transition-all duration-300 hover:border-zinc-700/60 hover:bg-zinc-900/60">
            <p className="text-4xl sm:text-5xl font-black text-orange-500">+{stats.products}</p>
            <p className="mt-2 text-xs uppercase tracking-widest text-gray-500">Produk Tersedia</p>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/80 backdrop-blur rounded-[24px] p-8 text-center transition-all duration-300 hover:border-zinc-700/60 hover:bg-zinc-900/60">
            <p className="text-4xl sm:text-5xl font-black text-white">+{stats.brands}</p>
            <p className="mt-2 text-xs uppercase tracking-widest text-gray-500">Kategori Utama</p>
          </div>
        </div>

        {/* TEAM GRID */}
        <div className="mb-10 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight">
            Tim <span className="text-orange-500">LUMINA</span>
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Para inovator di balik kemudahan belanja Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
          {teamMembers.map((member) => (
            <div
              key={member.name}
              className="group relative bg-zinc-900/30 border border-zinc-800 backdrop-blur rounded-[28px] p-6 text-center transition-all duration-500 hover:-translate-y-2 hover:bg-zinc-900/60 hover:border-zinc-700 shadow-lg hover:shadow-2xl flex flex-col items-center justify-between"
            >
              {/* Profile Avatar Placeholder with Initials and dynamic gradient */}
              <div className="relative w-24 h-24 mb-6">
                <div className={`absolute inset-0 rounded-full bg-gradient-to-tr ${member.avatarGradient} opacity-90 group-hover:scale-105 transition-transform duration-500 shadow-lg flex items-center justify-center`}>
                  <span className="text-2xl font-black tracking-wider text-white">
                    {member.name.split(" ").map(n => n[0]).join("")}
                  </span>
                </div>
                {/* Glow ring on hover */}
                <div className={`absolute -inset-1.5 rounded-full bg-gradient-to-tr ${member.avatarGradient} opacity-0 group-hover:opacity-40 blur transition-opacity duration-500 -z-10`} />
              </div>

              {/* Name */}
              <div className="mb-6 flex-1 flex items-center justify-center">
                <h3 className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors duration-300">
                  {member.name}
                </h3>
              </div>

              {/* Social Buttons */}
              <div className="flex items-center justify-center gap-4 mt-auto">
                {member.instagram && (
                  <a
                    href={member.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-zinc-800/80 hover:bg-[#E1306C] text-gray-300 hover:text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-md"
                    aria-label="Instagram"
                  >
                    <FaInstagram size={18} />
                  </a>
                )}
                {member.linkedin && (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-zinc-800/80 hover:bg-[#0077B5] text-gray-300 hover:text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-md"
                    aria-label="LinkedIn"
                  >
                    <FaLinkedin size={18} />
                  </a>
                )}
                {member.github && (
                  <a
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-zinc-800/80 hover:bg-[#333] text-gray-300 hover:text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-md"
                    aria-label="GitHub"
                  >
                    <FaGithub size={18} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
