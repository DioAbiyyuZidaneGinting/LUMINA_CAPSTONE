"use client";
import { FaLinkedin, FaInstagram, FaGithub } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Footer() {
  const router = useRouter();

  return (
    <footer className="bg-[#0f0f0f] text-gray-300 px-4 md:px-6 lg:px-12 pt-16 pb-[calc(2rem+env(safe-area-inset-bottom))] md:pb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-10">
        {/* TEAM */}
        <div>
          <h3 className="text-white font-semibold mb-4 text-base tracking-wider uppercase">Team</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="hover:text-white transition-colors duration-200">Haerul Algifar</li>
            <li className="hover:text-white transition-colors duration-200">
              Dio Abiyyu Zidane Ginting
            </li>
            <li className="hover:text-white transition-colors duration-200">
              Eric Yedija Sinaga
            </li>
            <li className="hover:text-white transition-colors duration-200">
              Erlangga Pradana Kurniawan
            </li>
            <li className="hover:text-white transition-colors duration-200">Naufal Helmy</li>
          </ul>
        </div>

        {/* TENTANG */}
        <div>
          <h3 className="text-white font-semibold mb-4 text-base tracking-wider uppercase">Tentang</h3>
          <ul className="space-y-3 text-sm text-gray-400">
            <li>
              <Link href="/aboutus" className="hover:text-white transition-colors duration-200">
                Tentang Kita
              </Link>
            </li>
            <li>
              <Link href="/leadership" className="hover:text-white transition-colors duration-200">
                Leadership Team
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-white transition-colors duration-200">
                Kebijakan Privasi
              </Link>
            </li>
            <li>
              <Link href="/compliance" className="hover:text-white transition-colors duration-200">
                Integrity & Compliance
              </Link>
            </li>
            <li>
              <Link href="/trust-center" className="hover:text-white transition-colors duration-200">
                Trust Center
              </Link>
            </li>
          </ul>
        </div>

        {/* SOCIAL */}
        <div>
          <h3 className="text-white font-semibold mb-4 text-base tracking-wider uppercase">Ikuti sosial media</h3>

          <div className="flex gap-4 mb-6">
            <a
              href="#"
              className="bg-[#1a1a1a] p-3 rounded-full hover:bg-gray-700 text-gray-300 hover:text-white transition-colors duration-200"
              aria-label="LinkedIn"
            >
              <FaLinkedin size={18} />
            </a>
            <a
              href="#"
              className="bg-[#1a1a1a] p-3 rounded-full hover:bg-gray-700 text-gray-300 hover:text-white transition-colors duration-200"
              aria-label="Instagram"
            >
              <FaInstagram size={18} />
            </a>
            <a
              href="https://github.com/DioAbiyyuZidaneGinting/LUMINA_CAPSTONE"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#1a1a1a] p-3 rounded-full hover:bg-gray-700 text-gray-300 hover:text-white transition-colors duration-200"
              aria-label="GitHub"
            >
              <FaGithub size={18} />
            </a>
          </div>

          <hr className="border-gray-800 mb-4" />
        </div>
      </div>

      {/* BOTTOM */}
      <div className="border-t border-gray-800 mt-12 pt-6 flex justify-between text-sm text-gray-500">
        <p>Copyright © 2026 LUMINA. All Rights Reserved</p>
      </div>
    </footer>
  );
}

