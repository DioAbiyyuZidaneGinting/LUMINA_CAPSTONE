"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
export default function BrandPage() {
  const params = useParams();

  const brand = String(params.brand).toLowerCase();

  const products = [
    {
      id: 1,
      brand: "nike",
      name: "Air Jordan Mid SE",
      price: 400,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200",
    },

    {
      id: 2,
      brand: "adidas",
      name: "Humanrace Sichona",
      price: 220,
      image:
        "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=1200",
    },

    {
      id: 3,
      brand: "vans",
      name: "Old Skool Love Me",
      price: 85,
      image:
        "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=1200",
    },

    {
      id: 4,
      brand: "jordan",
      name: "Air Jordan Zoom CMFT",
      price: 440,
      image:
        "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=1200",
    },

    {
      id: 5,
      brand: "nike",
      name: "Nike Dunk Panda",
      price: 300,
      image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1200",
    },

    {
      id: 6,
      brand: "nike",
      name: "Nike Air Max",
      price: 280,
      image:
        "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=1200",
    },
  ];

  const filteredProducts = products.filter(
    (p) => p.brand.toLowerCase() === brand,
  );

  return (
    <div className="bg-[#ffff] min-h-screen text-black">
      {/* HERO */}
      <section className="bg-black text-white border-b border-black">
        <div className="max-w-6xl mx-auto px-6 py-12 flex items-center justify-between">
          <div>
            <p className="uppercase tracking-[0.5em] text-xs text-gray-400 mb-4">
              Streetwear Collection
            </p>

            <h1 className="text-7xl font-black uppercase italic">{brand}</h1>
          </div>

          <img
            src={filteredProducts[0]?.image}
            className="w-56 h-56 object-contain"
          />
        </div>
      </section>

      {/* NEW ARTICLE */}
      <section className="max-w-6xl mx-auto border-l border-r border-b border-black bg-white">
        {/* TITLE */}
        <div className="flex items-center justify-between px-8 py-8 border-b border-black">
          <h2 className="text-6xl font-black uppercase italic">New Article</h2>

          <button
            className="
              bg-black
              text-white
              px-6
              py-3
              uppercase
              text-xs
              tracking-[0.3em]
            "
          >
            View More
          </button>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="
                border-r
                border-b
                border-black
                bg-[#f3f3f3]
                group
              "
            >
              {/* TOP BAR */}
              <div
                className="
                  flex
                  justify-between
                  text-[10px]
                  uppercase
                  px-3
                  py-2
                  border-b
                  border-black
                "
              >
                <span>{product.brand}</span>

                <span>${product.price}.00</span>
              </div>

              {/* IMAGE */}
              <div className="h-64 flex items-center justify-center p-6">
                <img
                  src={product.image}
                  alt={product.name}
                  className="
                    max-h-full
                    object-contain
                    group-hover:scale-105
                    transition
                    duration-500
                  "
                />
              </div>

              {/* INFO */}
              <div className="p-4 border-t border-black">
                <h3 className="font-bold text-sm">{product.name}</h3>

                <p className="text-xs text-gray-500 mt-1 mb-4">
                  Limited Edition Streetwear
                </p>

                <Link
                  href={`/products/${product.id}`}
                  className="
      w-full
      block
      text-center
      bg-black
      text-white
      py-3
      text-[10px]
      uppercase
      tracking-[0.3em]
      hover:bg-zinc-800
      transition
    "
                >
                  Show Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DEAL OF THE DAY */}
      <section className="max-w-6xl mx-auto border-l border-r border-b border-t border-black bg-white mt-12">
        {/* HEADER */}
        <div className="flex items-center justify-between px-8 py-8 border-b border-black">
          <h2 className="text-6xl font-black uppercase italic">
            Deal Of The Day
          </h2>

          <button
            className="
              bg-black
              text-white
              px-6
              py-3
              uppercase
              text-xs
              tracking-[0.3em]
            "
          >
            View More
          </button>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.slice(0, 4).map((product) => (
            <div
              key={product.id}
              className="
                border-r
                border-b
                border-black
                bg-[#f3f3f3]
                group
              "
            >
              <div
                className="
                  flex
                  justify-between
                  text-[10px]
                  uppercase
                  px-3
                  py-2
                  border-b
                  border-black
                "
              >
                <span>{product.brand}</span>

                <span>${product.price}.00</span>
              </div>

              <div className="h-64 flex items-center justify-center p-6">
                <img
                  src={product.image}
                  className="
                    max-h-full
                    object-contain
                    group-hover:scale-105
                    transition
                    duration-500
                  "
                />
              </div>

              {/* INFO */}
              <div className="p-4 border-t border-black">
                <h3 className="font-bold text-sm">{product.name}</h3>

                <p className="text-xs text-gray-500 mt-1 mb-4">
                  Limited Edition Streetwear
                </p>

                <Link
                  href={`/products/${product.id}`}
                  className="
      w-full
      block
      text-center
      bg-black
      text-white
      py-3
      text-[10px]
      uppercase
      tracking-[0.3em]
      hover:bg-zinc-800
      transition
    "
                >
                  Show Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
