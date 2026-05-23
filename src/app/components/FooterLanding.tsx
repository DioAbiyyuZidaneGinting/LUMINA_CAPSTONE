"use client";
import { FaLinkedin, FaInstagram, FaGithub } from "react-icons/fa";

import { useRouter } from "next/navigation";

export default function Footer() {
  const router = useRouter();

  return (
    <footer className="bg-[#0f0f0f] text-gray-300 px-4 md:px-6 lg:px-12 pt-16 pb-[calc(2rem+env(safe-area-inset-bottom))] md:pb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-10">
        {/* 🔥 KATEGORI */}
        <div>
          <h3 className="text-white font-semibold mb-4">Category</h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-white cursor-pointer">Baju</li>
            <li className="hover:text-white cursor-pointer">Sepatu</li>
            <li className="hover:text-white cursor-pointer">Aksesoris</li>
          </ul>
        </div>

        {/* TEAM */}
        <div>
          <h3 className="text-white font-semibold mb-4">Team</h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-white cursor-pointer">Haerul Algifar</li>
            <li className="hover:text-white cursor-pointer">
              Dio Abiyyu Zidane Ginting
            </li>
            <li className="hover:text-white cursor-pointer">
              Eric Yedija Sinaga
            </li>
            <li className="hover:text-white cursor-pointer">
              Erlangga Pradana Kurniawan
            </li>
            <li className="hover:text-white cursor-pointer">Naufal Helmy</li>
          </ul>
        </div>

        {/* 🔥 BRAND DINAMIS */}
        <div>
          <h3 className="text-white font-semibold mb-4">BRANDS</h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-white cursor-pointer">Nike</li>
            <li className="hover:text-white cursor-pointer">ZARA</li>
            <li className="hover:text-white cursor-pointer">GUCCI</li>
            <li className="hover:text-white cursor-pointer">Channel</li>
          </ul>
        </div>

        {/* TENTANG */}
        <div>
          <h3 className="text-white font-semibold mb-4">Tentang</h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-white cursor-pointer">Tentang kita</li>
            <li className="hover:text-white cursor-pointer">Leadership Team</li>
            <li className="hover:text-white cursor-pointer">
              Kebijakan privasi
            </li>
            <li className="hover:text-white cursor-pointer">
              Integrity & Compliance
            </li>
            <li className="hover:text-white cursor-pointer">Trust Center</li>
          </ul>
        </div>

        {/* SOCIAL */}
        <div>
          <h3 className="text-white font-semibold mb-4">Ikuti sosial media</h3>

          <div className="flex gap-4 mb-6">
            <div className="bg-[#1a1a1a] p-2 rounded-full hover:bg-gray-700 cursor-pointer">
              <FaLinkedin size={18} />
            </div>
            <div className="bg-[#1a1a1a] p-2 rounded-full hover:bg-gray-700 cursor-pointer">
              <FaInstagram size={18} />
            </div>
            <div className="bg-[#1a1a1a] p-2 rounded-full hover:bg-gray-700 cursor-pointer">
              <FaGithub size={18} />
            </div>
          </div>

          <hr className="border-gray-700 mb-4" />
        </div>
      </div>

      {/* BOTTOM */}
      <div className="border-t border-gray-700 mt-12 pt-6 flex justify-between text-sm text-gray-400">
        <p>Copyright © 2026 Lytro. All Rights Reserved</p>
      </div>
    </footer>
  );
}
