"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Cpu, Monitor, Battery, Wifi, ChevronDown } from "lucide-react";

export default function ProductDetailsPage() {
  const params = useParams();

  const id = Number(params.id);

  const products = [
    {
      id: 1,
      brand: "nike",
      name: "Air Jordan Mid SE",
      description: "Premium sneakers for streetwear lovers",
      overview:
        "Dirancang untuk kenyamanan maksimal dan tampilan street fashion modern.",
      price: 400,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200",

      variants: [
        {
          color: "Black",
          storage: "40",
          selling: 400,
        },

        {
          color: "Black",
          storage: "42",
          selling: 420,
        },

        {
          color: "White",
          storage: "40",
          selling: 430,
        },

        {
          color: "White",
          storage: "42",
          selling: 450,
        },
      ],

      features: [
        {
          title: "Premium Material",
          desc: "High quality leather",
          icon: "cpu",
        },

        {
          title: "Comfort Fit",
          desc: "Ultra soft sole",
          icon: "display",
        },

        {
          title: "Long Durability",
          desc: "Strong everyday use",
          icon: "battery",
        },

        {
          title: "Street Style",
          desc: "Modern aesthetic",
          icon: "wifi",
        },
      ],

      specifications: [
        {
          group: "Material",
          label: "Upper",
          value: "Leather",
        },

        {
          group: "Material",
          label: "Sole",
          value: "Rubber",
        },

        {
          group: "Size",
          label: "Available",
          value: "40-45",
        },

        {
          group: "Origin",
          label: "Made In",
          value: "Vietnam",
        },
      ],
    },
  ];

  const product = products.find((p) => p.id === id);

  const [selectedColor, setSelectedColor] = useState(
    product?.variants?.[0]?.color,
  );

  const [selectedSize, setSelectedSize] = useState(
    product?.variants?.[0]?.storage,
  );

  const selectedVariant = product.variants.find(
    (v) => v.color === selectedColor && v.storage === selectedSize,
  );
  const [activeTab, setActiveTab] = useState("overview");

  const [openSpec, setOpenSpec] = useState("Material");

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-4xl font-black">
        Product Not Found
      </div>
    );
  }

  const iconMap: Record<string, any> = {
    cpu: Cpu,
    display: Monitor,
    battery: Battery,
    wifi: Wifi,
  };

  const groupedSpecs: Record<string, any[]> = {};

  product.specifications.forEach((item: any) => {
    if (!groupedSpecs[item.group]) {
      groupedSpecs[item.group] = [];
    }

    groupedSpecs[item.group].push(item);
  });

  const specs = Object.keys(groupedSpecs).map((key: string) => ({
    key,
    title: key,
    content: groupedSpecs[key],
  }));

  const colors = [...new Set(product.variants.map((v) => v.color))];

  const sizes = [...new Set(product.variants.map((v) => v.storage))];

  return (
    <div className="bg-white min-h-screen text-black">
      {/* 🔥 TOP BAR */}
      <div className="sticky top-0 bg-white z-40 border-b border-gray-200">
        <div className="flex justify-between items-center px-10 py-4">
          {/* LEFT */}
          <h1 className="text-xl font-semibold text-black">{product.name}</h1>

          {/* RIGHT */}
          <div className="flex items-center gap-4">
            <span className="text-orange-500 text-xl font-bold">
              Rp
              {selectedVariant?.selling?.toLocaleString("id-ID")}
            </span>

            <button
              className="
          bg-black
          hover:bg-zinc-800
          text-white
          px-5
          py-2
          rounded-xl
          transition
        "
            >
              Tambah ke keranjang
            </button>
          </div>
        </div>
      </div>

      {/* 🔥 MAIN */}
      <section className="px-10 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* 🔥 LEFT IMAGE */}
          <div>
            <div className="flex justify-center">
              <img
                src={product.image}
                alt={product.name}
                className="
            w-full
            max-w-[450px]
            max-h-[450px]
            object-contain
          "
              />
            </div>

            {/* 🔥 THUMBNAILS */}
            <div className="flex gap-3 mt-5">
              {[1, 2, 3, 4].map((_, i) => (
                <div
                  key={i}
                  className="
              w-14
              h-14
              border
              rounded-lg
              flex
              items-center
              justify-center
              cursor-pointer
              hover:border-orange-500
              transition
            "
                >
                  <img src={product.image} className="h-10 object-contain" />
                </div>
              ))}
            </div>
          </div>

          {/* 🔥 RIGHT DETAIL */}
          <div className="text-black pt-6">
            {/* TITLE */}
            <h1 className="text-4xl font-bold mb-3">{product.name}</h1>

            {/* PRICE */}
            <h2 className="text-orange-500 text-4xl font-bold mb-2">
              Rp
              {selectedVariant?.selling?.toLocaleString("id-ID")}
            </h2>

            <p className="text-gray-400 text-sm mb-6">
              atau mulai dari Rp 1.353.300 /bln
            </p>

            {/* 🔥 PROMO */}
            <div className="space-y-2 mb-8 text-sm">
              <p>🎁 Hadiah menarik tersedia</p>
              <p>💰 Kupon diskon hingga Rp100.000</p>
              <p>⭐ Poin Mi hingga 19999</p>
            </div>

            {/* 🔥 COLOR */}
            <div className="mb-6">
              <p className="font-semibold mb-3">Colour</p>

              <div className="flex gap-3 flex-wrap">
                {colors.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedColor(c)}
                    className={`
          px-4
          py-3
          border
          rounded-xl
          min-w-[110px]
          text-sm
          transition

          ${
            selectedColor === c
              ? "border-orange-500 border-2"
              : "border-gray-300"
          }
        `}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* 🔥 STORAGE */}
            <div className="mb-8">
              <p className="font-semibold mb-3">Storage</p>

              <div className="flex gap-3 flex-wrap">
                {sizes.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedSize(s)}
                    className={`
          px-4
          py-3
          border
          rounded-xl
          min-w-[140px]
          text-sm
          transition

          ${
            selectedSize === s
              ? "border-orange-500 border-2"
              : "border-gray-300"
          }
        `}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* 🔥 BUTTON */}
            <button
              className="
          bg-orange-500
          hover:bg-orange-600
          text-white
          py-4
          rounded-xl
          w-full
          transition
        "
            >
              Tambah ke keranjang
            </button>
          </div>
        </div>
      </section>

      {/* OVERVIEW */}
      <section className="py-24 border-t border-black">
        <div className="max-w-5xl mx-auto px-8 text-center">
          <h2 className="text-6xl font-black uppercase italic mb-8">
            Overview
          </h2>

          <p className="text-gray-500 text-lg leading-relaxed">
            {product.overview}
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 border-t border-black">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 border-l border-t border-black">
          {product.features.map((feature: any, i: number) => {
            const Icon = iconMap[feature.icon] || Cpu;

            return (
              <div
                key={i}
                className="
                  border-r
                  border-b
                  border-black
                  p-10
                  text-center
                "
              >
                <div className="flex justify-center mb-6">
                  <Icon size={40} />
                </div>

                <h3 className="font-black uppercase mb-3">{feature.title}</h3>

                <p className="text-sm text-gray-500">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* SPECIFICATIONS */}
      <section className="py-24 border-t border-black">
        <div className="max-w-5xl mx-auto px-8">
          <h2 className="text-6xl font-black uppercase italic mb-12">
            Specifications
          </h2>

          {specs.map((spec) => (
            <div key={spec.key} className="border-b border-black py-6">
              <button
                onClick={() =>
                  setOpenSpec(openSpec === spec.key ? "" : spec.key)
                }
                className="
                  w-full
                  flex
                  items-center
                  justify-between
                "
              >
                <h3 className="text-2xl font-black uppercase">{spec.title}</h3>

                <ChevronDown
                  className={`
                    transition-transform
                    ${openSpec === spec.key ? "rotate-180" : ""}
                  `}
                />
              </button>

              {openSpec === spec.key && (
                <div className="mt-8 grid grid-cols-2 gap-8">
                  {spec.content.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between border-b pb-3">
                      <span className="text-gray-400">{item.label}</span>

                      <span className="font-bold">{item.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
