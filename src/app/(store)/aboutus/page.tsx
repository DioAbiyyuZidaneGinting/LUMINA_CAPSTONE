"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AboutPage() {
  const [userCount, setUserCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [brandCount, setBrandCount] = useState(0);

  // 🔥 INIT LOAD

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      {/* Background video */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_063509_7d167302-4fd4-480b-8260-18ab572333d4.mp4"
      />

      {/* Navbar */}
      <nav className="absolute z-20 px-6 md:px-10 pt-6 top-0 left-0 right-0 flex items-center justify-between gap-4">
        {/* Left pill */}
        <div className="flex items-center gap-2  backdrop-blur rounded-full pl-4 pr-6 py-3 bg-white">
          <img
            src="/images/logo.png"
            className="w-6 h-6 object-contain transition-all duration-300 group-hover:translate-x-10 group-hover:opacity-0"
          />
          <span className="text-black text-sm font-normal tracking-tight lowercase">
            LUMINA
          </span>
        </div>

        {/* Center pill */}
        <div className="hidden md:flex items-center gap-1 bg-neutral-900/90 backdrop-blur rounded-full px-3 py-2">
          <Link
            href="#"
            className="text-neutral-300 hover:text-white transition-colors text-sm px-5 py-2 rounded-full lowercase"
          >
            platform
          </Link>
          <Link
            href="#"
            className="text-neutral-300 hover:text-white transition-colors text-sm px-5 py-2 rounded-full lowercase"
          >
            solutions
          </Link>
          <Link
            href="#"
            className="text-neutral-300 hover:text-white transition-colors text-sm px-5 py-2 rounded-full lowercase"
          >
            company
          </Link>
          <Link
            href="#"
            className="text-neutral-300 hover:text-white transition-colors text-sm px-5 py-2 rounded-full lowercase"
          >
            support
          </Link>
        </div>

        {/* Right button */}
        <a href="/login">
          <button className="bg-white text-black text-sm font-normal rounded-full px-6 py-3 hover:bg-neutral-200 transition-colors lowercase">
            get started
          </button>
        </a>
      </nav>

      {/* Foreground content wrapper */}
      <div className="relative h-full w-full">
        <h1 className="hero-title absolute text-white font-medium text-[14vw] md:text-[13vw] left-4 md:left-10 top-[18%] lowercase">
          Manage
        </h1>
        <h1 className="hero-title absolute text-white font-medium text-[14vw] md:text-[13vw] right-4 md:right-10 top-[38%] lowercase">
          Your
        </h1>
        <h1 className="hero-title absolute text-white font-medium text-[14vw] md:text-[13vw] left-[18%] md:left-[28%] top-[58%] lowercase">
          Store
        </h1>

        {/* Description paragraph */}
        <p className="absolute left-6 md:left-10 top-[46%] max-w-[240px] text-[15px] leading-snug text-white/90 lowercase">
          Manage products, users, and data seamlessly in one integrated platform
        </p>

        {/* Stat block — top-right */}
        <div className="absolute right-6 md:right-24 top-[14%]">
          <div className="flex items-center gap-3 justify-end">
            <div className="hidden md:block h-px w-24 bg-white/40 rotate-[20deg]" />
            <span className="text-4xl md:text-5xl font-medium tracking-tight text-white lowercase">
              +{userCount}
            </span>
          </div>
          <div className="text-xs md:text-sm text-white/70 mt-1 text-right lowercase">
            active users
          </div>
        </div>

        {/* Stat block — bottom-left */}
        <div className="absolute left-6 md:left-20 bottom-20 md:bottom-24">
          <div className="flex items-center gap-3">
            <span className="text-4xl md:text-5xl font-medium tracking-tight text-white lowercase">
              +{brandCount}
            </span>
            <div className="hidden md:block h-px w-24 bg-white/40 rotate-[-20deg]" />
          </div>
          <div className="text-xs md:text-sm text-white/70 mt-1 lowercase">
            brands available
          </div>
        </div>

        {/* Stat block — bottom-right */}
        <div className="absolute right-6 md:right-20 bottom-16 md:bottom-20">
          <div className="flex items-center gap-3 justify-end">
            <div className="hidden md:block h-px w-24 bg-white/40 rotate-[-20deg]" />
            <span className="text-4xl md:text-5xl font-medium tracking-tight text-white lowercase">
              +{productCount}
            </span>
          </div>
          <div className="text-xs md:text-sm text-white/70 mt-1 text-right lowercase">
            products available
          </div>
        </div>

        {/* Bottom gradient overlay */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-b from-transparent to-black" />
      </div>
    </section>
  );
}
