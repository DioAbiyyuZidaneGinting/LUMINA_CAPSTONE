"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  User,
  Menu,
  ChevronDown,
  Search,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

import { Badge } from "./ui/badge";
import { useCart } from "../../lib/CartContext";
import { useUser } from "@clerk/nextjs";
import { supabase } from "../../lib/supabase";
import { formatIDR } from "./ui/utils";
import { useRouter } from "next/navigation";
import { useCustomerSync } from "@/hooks/useCustomerSync";

export default function Header() {
  const { cart } = useCart();
  const { isLoaded, user } = useUser();

  // Dynamic temporary Clerk-to-Supabase customer CRM auto-sync
  useCustomerSync();

  const [openCategory, setOpenCategory] = useState(false);
  const [openOrders, setOpenOrders] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Baju");
  const [selectedGender, setSelectedGender] = useState<
    "all" | "pria" | "wanita"
  >("all");
  const [search, setSearch] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    async function fetchOrders() {
      if (!user) return;
      setIsLoadingOrders(true);
      try {
        const { data, error } = await supabase
          .from("orders")
          .select(`
            *,
            order_items (
              quantity,
              price,
              products (
                name,
                product_images (
                  image_url
                )
              )
            )
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);

        if (!error && data) {
          const mappedOrders = data.map((order: any) => ({
            ...order,
            items: order.order_items?.map((item: any) => ({
              name: item.products?.name,
              quantity: item.quantity,
              price: item.price,
              image: item.products?.product_images?.[0]?.image_url
            })) || []
          }));
          setOrders(mappedOrders);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setIsLoadingOrders(false);
      }
    }

    if (user && openOrders) {
      fetchOrders();
    }

    if (user) {
      const channel = supabase.channel('realtime-header-orders')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${user.id}` }, () => {
          if (openOrders) fetchOrders();
        })
        .subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, openOrders]);

  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([]);

  async function fetchCategories() {
    try {
      const { data: publishedProds } = await supabase
        .from("products")
        .select("category_id, product_variants(stock)")
        .eq("status", "published")
        .eq("is_active", true);

      const activeCategoryIds = new Set(
        publishedProds
          ?.filter((p: any) => {
            const totalStock = p.product_variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0;
            return totalStock > 0;
          })
          .map((p: any) => p.category_id)
          .filter(Boolean) || []
      );

      const { data: catsData, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (!error && catsData) {
        const filtered = catsData.filter((c: any) => activeCategoryIds.has(c.id));
        const mappedCats = filtered.map((c: any) => ({
          name: c.name,
          slug: c.slug || c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
        }));
        setCategories(mappedCats);
        if (mappedCats.length > 0 && !selectedCategory) {
          setSelectedCategory(mappedCats[0].name);
        }
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  }

  useEffect(() => {
    fetchCategories();

    const channel = supabase.channel('realtime-header')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchCategories();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        fetchCategories();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'product_variants' }, () => {
        fetchCategories();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const [dynamicProducts, setDynamicProducts] = useState<any[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(false);

  useEffect(() => {
    async function fetchCategoryProducts() {
      if (!selectedCategory) return;
      setIsProductsLoading(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select(`
            *,
            categories!inner(name),
            product_images(image_url, is_primary)
          `)
          .eq("categories.name", selectedCategory)
          .eq("status", "published")
          .eq("is_active", true)
          .limit(4);

        if (!error && data) {
          const mapped = data.map((p: any) => {
            const primaryImage = p.product_images?.find((img: any) => img.is_primary)?.image_url 
              || p.product_images?.[0]?.image_url 
              || p.image_url
              || "/images/category-fallbacks/default.svg";
            return {
              id: p.id,
              name: p.name,
              price: Number(p.base_price) || 0,
              image: primaryImage
            };
          });
          setDynamicProducts(mapped);
        } else {
          setDynamicProducts([]);
        }
      } catch (err) {
        console.error("Error fetching category products:", err);
        setDynamicProducts([]);
      } finally {
        setIsProductsLoading(false);
      }
    }
    fetchCategoryProducts();
  }, [selectedCategory, selectedGender]);

  const role =
    (user?.publicMetadata?.role as string) ||
    (user?.unsafeMetadata?.role as string);
  const isAdmin = role?.toLowerCase() === "admin";

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-white/85 backdrop-blur-md border-b border-zinc-200 shadow-sm" 
          : "bg-white border-b border-zinc-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* LEFT */}
          <div className="flex items-center gap-4 lg:gap-8">
            <button className="lg:hidden p-2 -ml-2 text-slate-900 hover:bg-slate-50 rounded-full" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6 text-slate-900" />
            </button>

            <Link href="/">
              <h1 className="text-2xl tracking-tight text-slate-900">LUMINA</h1>
            </Link>

            {/* MENU */}
            <div className="hidden lg:flex gap-6 items-center">
              <Link
                href="/"
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                Home
              </Link>

              <Link
                href="/store"
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                Store
              </Link>

              {/* CATEGORY DROPDOWN */}
              <div className="relative">
                <button
                  onClick={() => setOpenCategory(!openCategory)}
                  className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Category
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-400 ${
                      openCategory ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </button>

                {openCategory && (
                  <div className="fixed left-0 top-16 w-full bg-white border-t border-zinc-200 shadow-xl z-50">
                    <div className="max-w-7xl mx-auto px-8 py-10 flex gap-16">
                      {/* CATEGORY LIST */}
                      <div className="w-52 border-r border-zinc-200 pr-8">
                        <div className="flex flex-col gap-6">
                          {categories.map((cat) => (
                            <div key={cat.name} className="flex flex-col">
                              <button
                                onClick={() => {
                                  setSelectedCategory(cat.name);
                                  setSelectedGender("all");
                                }}
                                className={`text-left text-2xl font-medium transition-colors ${
                                  selectedCategory === cat.name
                                    ? "text-orange-500"
                                    : "text-slate-800 hover:text-orange-500"
                                }`}
                              >
                                {cat.name}
                              </button>
                              {selectedCategory === cat.name && (
                                <Link
                                  href={`/category/${cat.slug}`}
                                  onClick={() => setOpenCategory(false)}
                                  className="text-[10px] uppercase tracking-widest text-slate-400 mt-1 hover:text-black transition-colors"
                                >
                                  View Collection →
                                </Link>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* RIGHT CONTENT */}
                      <div className="flex-1">
                        {/* GENDER FILTER */}
                        <div className="flex gap-4 mb-8">
                          <button
                            onClick={() => setSelectedGender("all")}
                            className={`px-5 py-2 rounded-full border transition ${
                              selectedGender === "all"
                                ? "bg-black text-white"
                                : "border-zinc-300"
                            }`}
                          >
                            Semua
                          </button>

                          <button
                            onClick={() => setSelectedGender("pria")}
                            className={`px-5 py-2 rounded-full border transition ${
                              selectedGender === "pria"
                                ? "bg-black text-white"
                                : "border-zinc-300"
                            }`}
                          >
                            Pria
                          </button>

                          <button
                            onClick={() => setSelectedGender("wanita")}
                            className={`px-5 py-2 rounded-full border transition ${
                              selectedGender === "wanita"
                                ? "bg-black text-white"
                                : "border-zinc-300"
                            }`}
                          >
                            Wanita
                          </button>
                        </div>

                        {/* PRODUCT GRID */}
                        <div className="grid grid-cols-4 gap-6">
                          {isProductsLoading ? (
                            [1, 2, 3, 4].map((i) => (
                              <div
                                key={i}
                                className="aspect-square bg-zinc-100 rounded-2xl animate-pulse"
                              ></div>
                            ))
                          ) : dynamicProducts.length > 0 ? (
                            dynamicProducts.map((product) => (
                              <div
                                key={product.id}
                                className="group cursor-pointer"
                                onClick={() => {
                                  router.push(`/product/${product.id}`);
                                  setOpenCategory(false);
                                }}
                              >
                                <div className="overflow-hidden rounded-2xl bg-zinc-100 aspect-square">
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                  />
                                </div>
                                <p className="mt-3 text-sm font-medium text-slate-800 line-clamp-1">
                                  {product.name}
                                </p>
                                <p className="text-[10px] font-bold text-orange-500 uppercase">
                                  {formatIDR(product.price)}
                                </p>
                              </div>
                            ))
                          ) : (
                            <div className="col-span-4 py-20 text-center text-zinc-400">
                              No products found in this category.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/sale"
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                Sale
              </Link>

              {isLoaded && isAdmin && (
                <Link
                  href="/admin"
                  className="text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors bg-orange-50 px-3 py-1 rounded-full"
                >
                  Admin Dashboard
                </Link>
              )}
            </div>
          </div>
          {/* CENTER SEARCH */}
          <div className="hidden lg:flex flex-1 justify-center px-10">
            <div className="relative w-full max-w-xl">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 
      w-4 h-4 text-zinc-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    router.push(`/store?search=${encodeURIComponent(search)}`);
                  }
                }}
                placeholder="Cari produk impian Anda..."
                className="w-full h-11 rounded-full border border-zinc-200 
      bg-zinc-50 pl-11 pr-4 text-sm
      focus:outline-none focus:ring-2 focus:ring-black/10
      focus:border-zinc-300 transition"
              />
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4">
            {/* ORDERS DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => {
                  if (!user) {
                    router.push("/sign-in");
                  } else {
                    setOpenOrders(!openOrders);
                  }
                }}
                className={`p-2 rounded-full transition-colors relative ${
                  openOrders
                    ? "bg-zinc-100 text-black"
                    : "hover:bg-zinc-50 text-slate-600"
                }`}
              >
                <Package className="w-5 h-5" />
              </button>

              {openOrders && user && (
                <div
                  className="absolute right-0 mt-3 w-80 bg-white border border-zinc-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200"
                  onMouseLeave={() => setOpenOrders(false)}
                >
                  <div className="px-4 py-3 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Pesanan Terbaru
                    </span>
                    <Link
                      href="/orders"
                      onClick={() => setOpenOrders(false)}
                      className="text-[10px] font-bold text-orange-500 hover:underline"
                    >
                      Lihat Semua
                    </Link>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {isLoadingOrders ? (
                      <div className="p-10 flex flex-col items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-zinc-200 border-t-black rounded-full animate-spin"></div>
                        <span className="text-[10px] text-zinc-400">
                          Memuat pesanan...
                        </span>
                      </div>
                    ) : orders.length > 0 ? (
                      <div className="divide-y divide-zinc-50">
                        {orders.map((order) => (
                          <div
                            key={order.id}
                            className="p-4 hover:bg-zinc-50 transition-colors group"
                          >
                            <div className="flex gap-3">
                              <div className="w-12 h-12 bg-zinc-100 rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                  src={
                                    order.items?.[0]?.image ||
                                    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400"
                                  }
                                  alt={order.items?.[0]?.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-2">
                                  <p className="text-sm font-bold text-black truncate leading-tight">
                                    {order.items?.[0]?.name}
                                  </p>
                                  <span
                                    className={`flex-shrink-0 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                                      order.status === "paid"
                                        ? "bg-green-50 text-green-600 border-green-100"
                                        : order.status === "cancelled"
                                          ? "bg-red-50 text-red-600 border-red-100"
                                          : "bg-amber-50 text-amber-600 border-amber-100"
                                    }`}
                                  >
                                    {order.status}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mt-1">
                                  <Clock size={10} />
                                  <span>
                                    {new Date(
                                      order.created_at,
                                    ).toLocaleDateString()}
                                  </span>
                                  <span>•</span>
                                  <span>{order.items?.length} Produk</span>
                                </div>
                                <p className="text-xs font-black text-black mt-2">
                                  {formatIDR(order.total_amount)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-10 text-center">
                        <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-3 text-zinc-200">
                          <AlertCircle size={24} />
                        </div>
                        <p className="text-xs font-bold text-black">
                          Belum Ada Pesanan
                        </p>
                        <p className="text-[10px] text-zinc-400 mt-1">
                          Mulai belanja sekarang!
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-zinc-50/50 border-t border-zinc-100">
                    <Link
                      href="/orders"
                      onClick={() => setOpenOrders(false)}
                      className="flex items-center justify-center gap-2 w-full py-2 bg-black text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition"
                    >
                      Buka Pesanan Saya
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              href={isLoaded && user ? "/profile" : "/sign-in"}
              className="p-2 hover:bg-zinc-50 rounded-full transition-colors"
            >
              <User className="w-5 h-5 text-slate-600" />
            </Link>

            <Link
              href="/cart"
              className="p-2 hover:bg-zinc-50 rounded-full transition-colors relative"
            >
              <ShoppingCart className="w-5 h-5 text-slate-600" />

              {cart.reduce((total, item) => total + item.quantity, 0) > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-slate-900 text-white text-xs">
                  {cart.reduce((total, item) => total + item.quantity, 0)}
                </Badge>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* MOBILE MENU DRAWER */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white shadow-2xl flex flex-col z-[101] animate-in slide-in-from-left duration-300">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">LUMINA</h1>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 -mr-2 text-slate-400 hover:text-slate-900 bg-slate-50 rounded-full">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Mobile Search */}
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      router.push(`/store?search=${encodeURIComponent(search)}`);
                      setIsMobileMenuOpen(false);
                    }
                  }}
                  placeholder="Cari produk..."
                  className="w-full h-12 rounded-2xl border border-zinc-200 bg-zinc-50 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-zinc-300 transition"
                />
              </div>

              <div className="flex flex-col gap-6 text-base font-bold text-slate-800">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-orange-500 transition-colors">Home</Link>
                <Link href="/store" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-orange-500 transition-colors">Store</Link>
                <div className="flex flex-col gap-3">
                  <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Categories</span>
                  <div className="flex flex-col gap-3 pl-4 border-l-2 border-zinc-100">
                    {categories.map((cat) => (
                      <Link 
                        key={cat.name} 
                        href={`/category/${cat.slug}`} 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-slate-600 hover:text-orange-500 transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
                <Link href="/sale" onClick={() => setIsMobileMenuOpen(false)} className="text-orange-600 hover:text-orange-700 transition-colors">Sale Offers</Link>
                
                {isLoaded && isAdmin && (
                  <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-blue-600 hover:text-blue-700 transition-colors pt-4 border-t border-zinc-100">
                    Admin Dashboard
                  </Link>
                )}
              </div>
            </div>
            
            <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between">
               {isLoaded && user ? (
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold">
                     {user.firstName?.[0] || 'U'}
                   </div>
                   <div className="flex flex-col">
                     <span className="text-sm font-bold text-slate-900">{user.firstName}</span>
                     <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="text-[10px] font-bold text-orange-500 uppercase">View Profile</Link>
                   </div>
                 </div>
               ) : (
                 <Link href="/sign-in" onClick={() => setIsMobileMenuOpen(false)} className="w-full py-3 bg-black text-white text-center rounded-xl text-sm font-bold">Sign In / Register</Link>
               )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
