"use client";

import { ChevronLeft, ShoppingCart, Star, Eye } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatIDR } from "../../../components/ui/utils";
import { useCart } from "../../../../lib/CartContext";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

const newArrivals = [
  {
    id: "new-1",
    name: "ZARA Oversized Wool Blazer",
    description: "Blazer wol oversized terbaru dengan potongan modern.",
    price: 2499000,
    category: "Baju",
    rating: 4.8,
    image: "https://static.pullandbear.net/2/photos//2024/V/0/1/p/4711/534/800/4711534800_2_1_8.jpg?t=1706271253456"
  },
  {
    id: "new-2",
    name: "H&M Premium Cotton Tee",
    description: "Kaos katun premium dengan kenyamanan maksimal.",
    price: 349000,
    category: "Baju",
    rating: 4.6,
    image: "https://lp2.hm.com/hmgoepprod?set=quality%5B79%5D%2Csource%5B%2Fbc%2F8a%2Fbc8a4d4a8e3d0d5d6d6d4d1d2d3d4d5d6d7d8d9d.jpg%5D%2Corigin%5Bdam%5D%2Ccategory%5Bmen_tshirtstanks_shortsleeved%5D%2Ctype%5BDESCRIPTIVESTILLLIFE%5D%2Cres%5Bm%5D%2Chmver%5B2%5D&call=url%5Bfile%3A%2Fproduct%2Fmain%5D"
  },
  {
    id: "new-3",
    name: "Streetwear Cargo Pants",
    description: "Celana cargo dengan gaya streetwear modern.",
    price: 899000,
    category: "Celana",
    rating: 4.7,
    image: "https://static.pullandbear.net/2/photos//2024/V/0/2/p/5688/511/400/5688511400_2_1_8.jpg?t=1705658145678"
  },
  {
    id: "new-4",
    name: "Minimalist Hoodie",
    description: "Hoodie minimalis dengan bahan fleece lembut.",
    price: 599000,
    category: "Baju",
    rating: 4.5,
    image: "https://lp2.hm.com/hmgoepprod?set=source%5B%2F09%2F78%2F0978931a238618f3a38d6f698371391e65893d6e.jpg%5D%2Corigin%5Bdam%5D%2Ccategory%5B%5D%2Ctype%5BDESCRIPTIVESTILLLIFE%5D%2Cres%5Bm%5D%2Chmver%5B2%5D&call=url%5Bfile%3A%2Fproduct%2Fmain%5D"
  }
];

export default function NewArrivalsPage() {
  const { addToCart } = useCart();
  const { user } = useUser();
  const router = useRouter();

  const handleAddToCart = (product: any) => {
    if (!user) {
      toast.error("Silakan Login", { description: "Anda harus login untuk belanja" });
      router.push("/sign-in");
      return;
    }
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category || "",
      images: [product.image || ""],
    });
    toast.success("Berhasil", { description: `${product.name} masuk keranjang` });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* HEADER */}
      <header className="pt-32 pb-16 border-b border-zinc-100 bg-zinc-50/50">
        <div className="max-w-7xl mx-auto px-8">
          <Link href="/store" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors mb-8">
            <ChevronLeft size={16} /> Back to Store
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="bg-black text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">Summer 2026</span>
                <span className="text-zinc-300">/</span>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">New Arrivals</span>
              </div>
              <h1 className="text-7xl font-black text-black tracking-tighter uppercase leading-none">New Fashion <br /> <span className="text-zinc-300">Arrivals</span></h1>
              <p className="text-xl text-zinc-500 max-w-xl font-medium leading-relaxed">
                Jelajahi koleksi terbaru kami yang dirancang untuk kenyamanan dan gaya modern Anda. Setiap item dipilih dengan teliti untuk kualitas terbaik.
              </p>
            </div>
            <div className="flex items-center gap-4 bg-white p-6 rounded-[32px] border border-zinc-100 shadow-xl shadow-zinc-200/50">
               <div className="flex flex-col">
                 <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Total Items</span>
                 <span className="text-3xl font-black text-black">{newArrivals.length}</span>
               </div>
            </div>
          </div>
        </div>
      </header>

      {/* PRODUCT GRID */}
      <main className="max-w-7xl mx-auto px-8 py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {newArrivals.map((product) => (
            <div key={product.id} className="group relative flex flex-col h-full bg-white rounded-[40px] border border-zinc-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
              {/* Image Container */}
              <div className="relative aspect-[4/5] bg-zinc-50 overflow-hidden">
                <div className="absolute top-6 left-6 z-20">
                  <span className="bg-black text-white text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-lg">NEW</span>
                </div>
                <Link href={`/product/${product.id}`} className="block w-full h-full p-10 group-hover:scale-110 transition-transform duration-700">
                  <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                </Link>
                
              </div>

              {/* Info Container */}
              <div className="p-8 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">{product.category}</span>
                    <div className="flex items-center gap-1 text-orange-400">
                      <Star size={12} fill="currentColor" />
                      <span className="text-[10px] font-black">{product.rating}</span>
                    </div>
                  </div>
                  <Link href={`/product/${product.id}`}>
                    <h3 className="text-xl font-black text-black leading-tight hover:text-orange-500 transition-colors line-clamp-2">{product.name}</h3>
                  </Link>
                  <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">{product.description}</p>
                </div>
                <div className="pt-8 mt-8 border-t border-zinc-50 flex items-center justify-between">
                  <span className="text-2xl font-black text-black">{formatIDR(product.price)}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Ready Stock</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-6 flex gap-2 mt-auto">
                  <button 
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 bg-black text-white h-12 rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all active:scale-95 shadow-lg shadow-black/5"
                  >
                    <ShoppingCart size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Add to Cart</span>
                  </button>
                  <Link href={`/product/${product.id}`} className="w-12 h-12 bg-zinc-100 text-black rounded-2xl flex items-center justify-center hover:bg-zinc-200 transition-all active:scale-95">
                    <Eye size={18} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* FOOTER CALL TO ACTION */}
      <section className="bg-zinc-50 py-32 mt-20">
        <div className="max-w-4xl mx-auto px-8 text-center space-y-10">
          <h2 className="text-5xl font-black text-black tracking-tighter uppercase leading-none">Don't Miss Out on <br /> The <span className="text-zinc-300">Full Collection</span></h2>
          <p className="text-zinc-500 font-medium">Jelajahi ratusan produk fashion lainnya di store kami dengan berbagai pilihan kategori dan penawaran menarik.</p>
          <Link href="/store">
            <button className="bg-black text-white px-12 py-6 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-2xl shadow-black/20">
              Browse All Products
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
