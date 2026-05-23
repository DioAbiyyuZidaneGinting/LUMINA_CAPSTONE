"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";
import { getCategoryFallbackImage } from "@/app/components/ui/utils";

export const dynamic = "force-dynamic";

export default function CategoryPage() {
  const { slug } = useParams();
  const supabase = useSupabaseClient();

  const [category, setCategory] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedBrand, setSelectedBrand] = useState("All");

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Fetch Category
        const { data: categoryData, error: catError } = await (supabase as any)
          .from("categories")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();

        if (catError || !categoryData) {
          setCategory(null);
          return;
        }

        setCategory(categoryData);

        // Fetch Products in category
        const { data: productsData, error: prodError } = await (supabase as any)
          .from("products")
          .select(`
            *,
            product_images (
              image_url,
              is_primary
            )
          `)
          .eq("category_id", (categoryData as any).id)
          .eq("status", "published");

        if (productsData) {
          const mapped = productsData.map((p: any) => {
            const primaryImage = p.product_images?.find((img: any) => img.is_primary)?.image_url 
              || p.product_images?.[0]?.image_url 
              || p.image_url
              || "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800";

            return {
              id: p.id,
              brand: p.brand || "Lumina",
              name: p.name,
              description: p.editorial_narrative || p.description || "",
              price: Number(p.base_price) || 0,
              image: primaryImage,
            };
          });
          setProducts(mapped);
        }
      } catch (err) {
        console.error("Error fetching category data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (slug) {
      fetchData();
    }
  }, [slug, supabase]);

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mb-4"></div>
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest animate-pulse">
          Memuat Kategori...
        </p>
      </div>
    );
  }

  if (!category) {
    notFound();
  }

  const categoryProducts = products.length > 0 ? products : [
    {
      id: "placeholder",
      brand: "Lumina",
      name: "Coming Soon",
      description: "Koleksi baru akan segera hadir.",
      price: 0,
      image: category.image_url || getCategoryFallbackImage(category.name, category.slug),
    }
  ];

  const brands = ["All", ...new Set(categoryProducts.map(p => p.brand))];

  const filteredProducts =
    selectedBrand === "All"
      ? categoryProducts
      : categoryProducts.filter((product) => product.brand === selectedBrand);

  const nextSlide = () => {
    if (categoryProducts.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % categoryProducts.length);
  };

  const prevSlide = () => {
    if (categoryProducts.length === 0) return;
    setCurrentIndex((prev) =>
      prev === 0 ? categoryProducts.length - 1 : prev - 1,
    );
  };

  return (
    <div className="bg-white min-h-screen text-[#111] overflow-hidden">
      {/* HERO */}
      <section className="relative min-h-screen border-b border-black">
        {/* HUGE BACKGROUND TEXT */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <h1
            className="
              text-[15vw]
              md:text-[24vw]
              font-black
              uppercase
              tracking-[-0.08em]
              text-[#f1f1f1]
              leading-none
              select-none
            "
          >
            {category.name}
          </h1>
        </div>

        {/* LEFT ARROW */}
        <button
          onClick={prevSlide}
          className="
            absolute
            left-8
            top-1/2
            -translate-y-1/2
            z-20
            w-16
            h-16
            border
            border-black/20
            bg-white/80
            backdrop-blur-md
            flex
            items-center
            justify-center
            hover:bg-black
            hover:text-white
            transition-all
            duration-300
          "
        >
          <ChevronLeft size={34} />
        </button>

        {/* RIGHT ARROW */}
        <button
          onClick={nextSlide}
          className="
            absolute
            right-8
            top-1/2
            -translate-y-1/2
            z-20
            w-16
            h-16
            border
            border-black/20
            bg-white/80
            backdrop-blur-md
            flex
            items-center
            justify-center
            hover:bg-black
            hover:text-white
            transition-all
            duration-300
          "
        >
          <ChevronRight size={34} />
        </button>

        {/* MAIN CONTENT */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 -mt-20">
          {/* PRODUCT IMAGE */}
          <div className="w-full flex justify-center">
            {categoryProducts[currentIndex] && (
              <Link href={categoryProducts[currentIndex].id === "placeholder" ? "#" : `/product/${categoryProducts[currentIndex].id}`}>
                <img
                  src={categoryProducts[currentIndex].image}
                  alt={categoryProducts[currentIndex].name}
                  className="
                    w-full
                    max-w-3xl
                    max-h-[50vh]
                    object-contain
                    drop-shadow-2xl
                    transition-all
                    duration-700
                    hover:scale-105
                    cursor-pointer
                  "
                />
              </Link>
            )}
          </div>
          {/* PRODUCT INFO */}
          <div className="mt-4 text-center">
            <p
              className="
                uppercase
                tracking-[0.5em]
                text-[10px]
                font-bold
                text-gray-500
                mb-4
              "
            >
              Featured Product
            </p>

            <h2
              className="
                text-3xl
                md:text-4xl
                lg:text-6xl
                font-black
                uppercase
                italic
                tracking-tight
              "
            >
              {categoryProducts[currentIndex]?.name || "Product Name"}
            </h2>

            <p className="mt-5 text-gray-500 text-lg max-w-xl mx-auto">
              {categoryProducts[currentIndex]?.description || "Product Description"}
            </p>

            {categoryProducts[currentIndex]?.price > 0 && (
              <p
                className="
                  mt-6
                  text-2xl
                  font-black
                  italic
                "
              >
                Rp {categoryProducts[currentIndex]?.price.toLocaleString("id-ID") || 0}
              </p>
            )}
          </div>
          {/* SLIDER INDICATOR */}
          <div
            className="
              absolute
              bottom-10
              left-10
              flex
              items-center
              gap-5
            "
          >
            <span
              className="
                text-2xl
                font-black
                italic
              "
            >
              {String(currentIndex + 1).padStart(2, "0")}
            </span>

            <div className="w-40 h-[2px] bg-gray-200 relative">
              <div
                className="
                  absolute
                  left-0
                  top-0
                  h-full
                  bg-black
                  transition-all
                  duration-500
                "
                style={{
                  width: `${
                    ((currentIndex + 1) / categoryProducts.length) * 100
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* PROMO SECTION */}
      {categoryProducts.length >= 2 && (
        <section className="grid grid-cols-1 md:grid-cols-2 border-b border-black">
          {/* LEFT */}
          <Link href={`/product/${categoryProducts[0].id}`} className="block border-r border-black hover:opacity-90 transition">
            <div
              className="
                p-10
                md:p-20
                flex
                flex-col
                md:flex-row
                items-center
                gap-10
                group
                hover:bg-[#fafafa]
                transition
              "
            >
              <div className="flex-1 flex justify-center">
                <img
                  src={categoryProducts[0].image}
                  className="
                    w-72
                    h-72
                    object-contain
                    group-hover:scale-110
                    transition
                    duration-500
                  "
                  alt=""
                />
              </div>

              <div className="flex-1">
                <p className="uppercase tracking-[0.4em] text-xs text-gray-400 mb-3">
                  New Collection
                </p>

                <h3
                  className="
                    text-2xl
                    md:text-3xl
                    lg:text-4xl
                    font-black
                    uppercase
                    italic
                    leading-none
                    mb-6
                  "
                >
                  {categoryProducts[0].name}
                </h3>

                <button
                  className="
                    bg-black
                    text-white
                    px-8
                    py-4
                    text-xs
                    uppercase
                    tracking-[0.3em]
                    hover:bg-zinc-800
                    transition
                  "
                >
                  View Details
                </button>
              </div>
            </div>
          </Link>

          {/* RIGHT */}
          <Link href={`/product/${categoryProducts[1].id}`} className="block hover:opacity-90 transition">
            <div
              className="
                p-10
                md:p-20
                flex
                flex-col
                md:flex-row-reverse
                items-center
                gap-10
                group
                hover:bg-[#fafafa]
                transition
              "
            >
              <div className="flex-1 flex justify-center">
                <img
                  src={categoryProducts[1].image}
                  className="
                    w-72
                    h-72
                    object-contain
                    group-hover:scale-110
                    transition
                    duration-500
                  "
                  alt=""
                />
              </div>

              <div className="flex-1">
                <p className="uppercase tracking-[0.4em] text-xs text-gray-400 mb-3">
                  Trending Now
                </p>

                <h3
                  className="
                    text-2xl
                    md:text-3xl
                    lg:text-4xl
                    font-black
                    uppercase
                    italic
                    leading-none
                    mb-6
                  "
                >
                  {categoryProducts[1].name}
                </h3>

                <button
                  className="
                    bg-black
                    text-white
                    px-8
                    py-4
                    text-xs
                    uppercase
                    tracking-[0.3em]
                    hover:bg-zinc-800
                    transition
                  "
                >
                  Explore
                </button>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* PRODUCTS GRID */}
      <section className="py-24">
        <div className="text-center mb-20">
          <p
            className="
              uppercase
              tracking-[0.5em]
              text-xs
              text-gray-400
              mb-4
            "
          >
            Collection
          </p>

          <h2
            className="
              text-6xl
              font-black
              uppercase
              italic
            "
          >
            Best Sellers
          </h2>
        </div>

        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-4
            border-t
            border-l
            border-black
            mx-6
          "
        >
          {categoryProducts.map((product) => (
            <Link
              href={product.id === "placeholder" ? "#" : `/product/${product.id}`}
              key={product.id}
              className="
                border-r
                border-b
                border-black
                p-10
                group
                hover:bg-[#fafafa]
                transition-all
                duration-500
                block
              "
            >
              <div className="h-72 flex items-center justify-center mb-10">
                <img
                  src={product.image}
                  alt={product.name}
                  className="
                    max-h-full
                    object-contain
                    group-hover:scale-110
                    transition
                    duration-700
                  "
                />
              </div>

              <div className="text-center">
                <h3
                  className="
                    uppercase
                    tracking-[0.2em]
                    text-xs
                    text-gray-500
                    mb-3
                    line-clamp-1
                    font-bold
                  "
                >
                  {product.name}
                </h3>

                {product.price > 0 && (
                  <p
                    className="
                      text-lg
                      font-black
                      italic
                    "
                  >
                    Rp {product.price.toLocaleString("id-ID")}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>

        <div className="flex justify-center mt-16">
          <Link href="/store">
            <button
              className="
                bg-black
                text-white
                px-12
                py-4
                uppercase
                tracking-[0.3em]
                text-xs
                hover:bg-zinc-800
                transition
              "
            >
              View All Products
            </button>
          </Link>
        </div>
      </section>

      {/* SEARCH BY BRAND */}
      {brands.length > 1 && (
        <section className="py-24 border-t border-black">
          <div className="text-center mb-14">
            <p
              className="
                uppercase
                tracking-[0.5em]
                text-xs
                text-gray-400
                mb-4
              "
            >
              Featured
            </p>

            <h2
              className="
                text-4xl
                md:text-5xl
                lg:text-6xl
                font-black
                uppercase
                italic
              "
            >
              Search By Brand
            </h2>
          </div>

          {/* BRAND TABS */}
          <div
            className="
              flex
              justify-center
              flex-wrap
              border-t
              border-l
              border-black
              mx-6
            "
          >
            {brands.map((brand) => (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`
                  flex-1
                  min-w-[140px]
                  border-r
                  border-b
                  border-black
                  px-8
                  py-5
                  uppercase
                  text-xs
                  tracking-[0.3em]
                  font-bold
                  transition-all
                  duration-300

                  ${
                    selectedBrand === brand
                      ? "bg-black text-white"
                      : "bg-white hover:bg-[#f7f7f7]"
                  }
                `}
              >
                {brand}
              </button>
            ))}
          </div>

          {/* PRODUCTS */}
          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-4
              border-l
              border-black
              mx-6
            "
          >
            {filteredProducts.map((product) => (
              <Link
                href={product.id === "placeholder" ? "#" : `/product/${product.id}`}
                key={product.id}
                className="
                  border-r
                  border-b
                  border-black
                  p-10
                  group
                  hover:bg-[#fafafa]
                  transition-all
                  duration-500
                  block
                "
              >
                {/* IMAGE */}
                <div className="h-72 flex items-center justify-center mb-10">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="
                      max-h-full
                      object-contain
                      group-hover:scale-110
                      transition
                      duration-700
                    "
                  />
                </div>

                {/* INFO */}
                <div className="text-center">
                  <p
                    className="
                      text-[10px]
                      uppercase
                      tracking-[0.4em]
                      text-gray-400
                      mb-3
                    "
                  >
                    {product.brand}
                  </p>

                  <h3
                    className="
                      uppercase
                      tracking-[0.15em]
                      text-sm
                      font-bold
                      mb-3
                      line-clamp-1
                    "
                  >
                    {product.name}
                  </h3>

                  {product.price > 0 && (
                    <p
                      className="
                        text-lg
                        font-black
                        italic
                      "
                    >
                      Rp {product.price.toLocaleString("id-ID")}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          <div className="flex justify-center mt-14">
            <Link href="/store">
              <button
                className="
                  bg-black
                  text-white
                  px-12
                  py-4
                  uppercase
                  tracking-[0.3em]
                  text-xs
                  hover:bg-zinc-800
                  transition
                "
              >
                Explore All Products
              </button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
