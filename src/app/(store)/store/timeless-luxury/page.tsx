"use client";

import { ChevronLeft, ShoppingCart, Star, Eye, ShieldCheck, Gem } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatIDR } from "../../../components/ui/utils";
import { useCart } from "../../../../lib/CartContext";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

const luxuryProducts = [
  {
    id: "lux-1",
    name: "Rolex Submariner Date",
    description: "Ikon jam tangan mewah yang tak lekang oleh waktu dengan presisi luar biasa.",
    price: 285000000,
    category: "Aksesoris",
    rating: 5.0,
    image: "https://images.rolex.com/2024/media/watches/submariner/m126610ln-0001/m126610ln-0001_drp-upright.png?impolicy=upright-majesty"
  },
  {
    id: "lux-2",
    name: "Gucci Jackie 1961 Bag",
    description: "Tas tangan mewah dengan desain klasik yang elegan dan detail horsebit ikonik.",
    price: 48000000,
    category: "Tas",
    rating: 4.9,
    image: "https://media.gucci.com/style/DarkGray_Center_0_0_800x800/1602690903/636703_HUHHG_8565_001_100_0000_Light-Jackie-1961-small-shoulder-bag.jpg"
  },
  {
    id: "lux-3",
    name: "Prada Leather Jacket",
    description: "Jaket kulit premium dengan finishing mewah dan potongan yang sangat elegan.",
    price: 65000000,
    category: "Baju",
    rating: 4.9,
    image: "https://www.prada.com/content/dam/pradabkg_products/S/SGV/SGV126/1ZCYF0002/SGV126_1ZCY_F0002_S_222_SLF.jpg/_jcr_content/renditions/cq5dam.web.hf-low.800.800.at.jpg"
  },
  {
    id: "lux-4",
    name: "Louis Vuitton Keepall 55",
    description: "Tas travel mewah untuk gaya hidup jetset dengan kanvas monogram legendaris.",
    price: 35000000,
    category: "Tas",
    rating: 4.8,
    image: "https://images.louisvuitton.com/is/image/louisvuitton/M41414_PM2_Front%20view?wid=800&hei=800"
  }
];

export default function TimelessLuxuryPage() {
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
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* LUXURY HEADER */}
      <header className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-900/20 via-transparent to-transparent opacity-50"></div>
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <Link href="/store" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-amber-500/60 hover:text-amber-500 transition-colors mb-12">
            <ChevronLeft size={16} /> Back to Store
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-px bg-amber-500/50"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-500">Private Collection</span>
              </div>
              <h1 className="text-8xl font-black tracking-tighter uppercase leading-none italic">
                Timeless <br /> <span className="text-zinc-800 outline-text">Luxury</span>
              </h1>
              <p className="text-xl text-zinc-400 max-w-xl font-medium leading-relaxed italic">
                Investasi dalam gaya yang tak lekang oleh waktu. Temukan kurasi item paling eksklusif dari rumah mode ternama dunia.
              </p>
            </div>
            <div className="flex flex-col items-end gap-4">
               <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 p-8 rounded-[40px] flex items-center gap-6">
                  <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <Gem size={28} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Selected Items</span>
                    <span className="text-4xl font-black text-white">{luxuryProducts.length}</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </header>

      {/* LUXURY PRODUCT GRID */}
      <main className="max-w-7xl mx-auto px-8 py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-12">
          {luxuryProducts.map((product) => (
            <div key={product.id} className="group relative bg-zinc-900/30 rounded-[48px] border border-white/5 overflow-hidden hover:border-amber-500/30 transition-all duration-700 flex flex-col md:flex-row">
              {/* Image Section */}
              <div className="relative w-full md:w-1/2 aspect-square bg-zinc-900 flex items-center justify-center p-12 overflow-hidden">
                <div className="absolute top-8 left-8 z-20">
                  <span className="bg-gradient-to-r from-amber-600 to-yellow-500 text-white text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-xl shadow-amber-900/40">Luxury</span>
                </div>
                <Link href={`/product/${product.id}`} className="block w-full h-full group-hover:scale-110 transition-transform duration-1000">
                  <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                </Link>
              </div>

              {/* Info Section */}
              <div className="p-10 flex-1 flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">{product.category}</span>
                    <div className="flex items-center gap-2 text-amber-400">
                      <Star size={14} fill="currentColor" />
                      <span className="text-sm font-black">{product.rating}</span>
                    </div>
                  </div>
                  <Link href={`/product/${product.id}`}>
                    <h3 className="text-3xl font-black text-white leading-tight hover:text-amber-500 transition-colors uppercase italic tracking-tighter">{product.name}</h3>
                  </Link>
                  <p className="text-zinc-500 leading-relaxed font-medium">{product.description}</p>
                </div>

                <div className="pt-8 border-t border-white/5 flex items-center justify-between mt-auto">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Exclusive Price</span>
                    <span className="text-4xl font-black text-amber-500 tracking-tighter">{formatIDR(product.price)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Ready Stock</span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="pt-6 flex gap-3">
                  <button 
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 bg-white text-black h-14 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs hover:bg-amber-500 hover:text-white transition-all active:scale-95 shadow-2xl"
                  >
                    <ShoppingCart size={18} /> Add to Collection
                  </button>
                  <Link href={`/product/${product.id}`} className="w-14 h-14 bg-zinc-800 text-white rounded-2xl flex items-center justify-center hover:bg-zinc-700 transition-all active:scale-95">
                    <Eye size={20} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* LUXURY TRUST SECTION */}
      <section className="py-40 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: <ShieldCheck className="text-amber-500" size={32} />, title: "Authenticity Guaranteed", desc: "Kami menjamin keaslian 100% untuk setiap produk luxury yang kami kurasi." },
              { icon: <Gem className="text-amber-500" size={32} />, title: "Premium Selection", desc: "Hanya item paling ikonik dan langka yang masuk dalam koleksi Timeless Luxury kami." },
              { icon: <Star className="text-amber-500" size={32} />, title: "Concierge Service", desc: "Nikmati layanan bantuan belanja eksklusif untuk pengalaman belanja yang tak terlupakan." }
            ].map((item, i) => (
              <div key={i} className="space-y-6 p-10 bg-zinc-900/20 rounded-[40px] border border-white/5 hover:border-amber-500/20 transition-all">
                {item.icon}
                <h3 className="text-xl font-black uppercase italic tracking-tight">{item.title}</h3>
                <p className="text-zinc-500 font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style jsx>{`
        .outline-text {
          -webkit-text-stroke: 1px rgba(255, 255, 255, 0.1);
          color: transparent;
        }
      `}</style>
    </div>
  );
}
