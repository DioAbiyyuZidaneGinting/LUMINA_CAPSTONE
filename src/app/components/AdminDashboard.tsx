"use client";
import { useState, useEffect, FormEvent, useMemo } from "react";
import { supabase } from "../../lib/supabase";
import {
  BarChart3,
  Package,
  TrendingUp,
  AlertCircle,
  Calendar,
  Search,
  Settings,
  LogOut,
  Home,
  ShoppingBag,
  Users,
  ChevronRight,
  Trash2,
  Star,
  Zap,
  Edit2,
  X,
} from "lucide-react";
import { useClerk, useUser } from "@clerk/nextjs";
import { useFormatCurrency } from "../../hooks/useFormatCurrency";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import { toast } from "sonner";

const METRIC_ICON_MAP: Record<string, React.ReactNode> = {
  star: <Star className="w-4 h-4 text-yellow-500" />,
  users: <Users className="w-4 h-4 text-blue-500" />,
  calendar: <Calendar className="w-4 h-4 text-purple-500" />,
  zap: <Zap className="w-4 h-4 text-amber-500" />,
};

export default function AdminDashboard() {
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();
  const { format } = useFormatCurrency();
  const [activeNav, setActiveNav] = useState("dashboard");
  const [aiAnalysisComplete, setAiAnalysisComplete] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [isSimulatingCustomers, setIsSimulatingCustomers] = useState(false);

  // Chat AI
  const [chatMessages, setChatMessages] = useState<any[]>([
    {
      role: "model",
      content:
        "Halo! Saya asisten konsultan ritel Lumina Anda. Apa yang ingin Anda ketahui tentang performa toko atau rekomendasi produk hari ini?",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Settings
  const [adminFirstName, setAdminFirstName] = useState("");
  const [adminLastName, setAdminLastName] = useState("");

  useEffect(() => {
    if (isLoaded && user) {
      setAdminFirstName(user.firstName || "");
      setAdminLastName(user.lastName || "");
    }
  }, [isLoaded, user]);

  const chartData = useMemo(() => {
    const salesByDate: Record<string, number> = {};
    orders.forEach((order) => {
      if (order.created_at) {
        const dateStr = order.created_at.split("T")[0];
        salesByDate[dateStr] = (salesByDate[dateStr] || 0) + order.total_amount;
      }
    });

    const data = [];
    const today = new Date();

    // 5 days of actual data
    for (let i = 4; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];

      const sales = salesByDate[dateStr] || 0;
      data.push({
        date: dateStr,
        sales: sales,
        predicted: sales > 0 ? sales * 1.05 : 10000 + Math.random() * 2000,
        factor: "Reguler",
        icon: "users",
      });
    }

    const totalSales = data.reduce(
      (acc, curr) => acc + (curr.sales as number),
      0,
    );
    const avgSales = totalSales > 0 ? totalSales / 5 : 12000;

    // 3 days of future predictions
    for (let i = 1; i <= 3; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];

      let factor = "Reguler";
      let icon = "users";

      if (i === 1) {
        factor = "Trafik Generasion";
        icon = "users";
      } else if (i === 2) {
        factor = "Flash Sale";
        icon = "zap";
      } else if (i === 3) {
        factor = "Rating Tinggi";
        icon = "star";
      }

      data.push({
        date: dateStr,
        sales: null,
        predicted: avgSales * (1 + i * 0.15),
        factor,
        icon,
      });
    }

    return data;
  }, [orders]);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setOrders(data);
  };

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setProducts(data);
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();

    const ordersSub = supabase
      .channel("public:orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          fetchOrders();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersSub);
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSimulatingCustomers) {
      interval = setInterval(() => {
        const generasi = ["Gen Z", "Millennial", "Gen X", "Baby Boomer"];
        const randomGen = generasi[Math.floor(Math.random() * generasi.length)];
        const year =
          randomGen === "Gen Z"
            ? 2000 + Math.floor(Math.random() * 10)
            : randomGen === "Millennial"
              ? 1985 + Math.floor(Math.random() * 12)
              : randomGen === "Gen X"
                ? 1970 + Math.floor(Math.random() * 10)
                : 1955 + Math.floor(Math.random() * 10);

        const newCustomer = {
          id: Math.random().toString(36).substr(2, 9),
          name: `User-${Math.floor(Math.random() * 1000)}`,
          generasi: randomGen,
          dob: `${year}-0${Math.floor(Math.random() * 9) + 1}-15`,
          joined_at: new Date().toISOString(),
        };
        setCustomers((prev) => [newCustomer, ...prev]);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isSimulatingCustomers]);

  const runAiPrediction = async () => {
    setIsAiLoading(true);
    toast.info("Analisis AI Dimulai", {
      description: "Gemini sedang menganalisis data toko Anda...",
    });

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          revenue: format(1383328500),
          orders: 1429,
          alerts: products.filter((p) => !p.in_stock).length,
        }),
      });
      const data = await response.json();
      if (data.recommendation) {
        setAiRecommendation(data.recommendation);
        setAiAnalysisComplete(true);
        toast.success("Analisis AI Selesai");
      } else {
        throw new Error("No recommendation received");
      }
    } catch (error) {
      toast.error("Gagal menjalankan analisis AI");
    } finally {
      setIsAiLoading(false);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleAddProduct = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const imageFiles = formData.getAll("images") as File[];

    if (imageFiles.length > 5) {
      toast.error("Maksimal 5 gambar diperbolehkan");
      setIsSubmitting(false);
      return;
    }

    const uploadedImageUrls: string[] = [];
    for (const file of imageFiles) {
      if (file.size === 0) continue;
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `public/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file);

      if (uploadError) {
        toast.error("Gagal mengunggah gambar", {
          description: uploadError.message,
        });
        setIsSubmitting(false);
        return;
      }

      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);
      uploadedImageUrls.push(data.publicUrl);
    }

    const newProduct = {
      name: formData.get("name") as string,
      price:
        parseFloat((formData.get("price") as string).replace(/\D/g, "")) || 0,
      cost:
        parseFloat((formData.get("cost") as string).replace(/\D/g, "")) || 0,
      category: formData.get("category") as string,
      images: uploadedImageUrls,
      stock: parseInt(formData.get("stock") as string) || 0,
      in_stock: (parseInt(formData.get("stock") as string) || 0) > 0,
    };

    const { error } = await supabase.from("products").insert([newProduct]);

    if (error) {
      toast.error("Gagal menambahkan produk", { description: error.message });
    } else {
      toast.success("Produk berhasil ditambahkan!");
      (e.target as HTMLFormElement).reset();
      fetchProducts();
    }
    setIsSubmitting(false);
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) return;

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast.error("Gagal menghapus produk", { description: error.message });
    } else {
      toast.success("Produk berhasil dihapus");
      fetchProducts();
    }
  };

  const handleEditSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const updatedProduct = {
      name: formData.get("name") as string,
      price:
        parseFloat((formData.get("price") as string).replace(/\D/g, "")) || 0,
      cost:
        parseFloat((formData.get("cost") as string).replace(/\D/g, "")) || 0,
      category: formData.get("category") as string,
      stock: parseInt(formData.get("stock") as string) || 0,
      in_stock: (parseInt(formData.get("stock") as string) || 0) > 0,
    };

    const { error } = await supabase
      .from("products")
      .update(updatedProduct)
      .eq("id", editingProduct.id);
    if (error) {
      toast.error("Gagal memperbarui produk", { description: error.message });
    } else {
      toast.success("Produk berhasil diperbarui");
      setEditingProduct(null);
      fetchProducts();
    }
    setIsSubmitting(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const newMessage = { role: "user", content: chatInput };
    const updatedMessages = [...chatMessages, newMessage];

    setChatMessages(updatedMessages);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });
      const data = await response.json();

      if (data.reply) {
        setChatMessages([
          ...updatedMessages,
          { role: "model", content: data.reply },
        ]);
      } else {
        throw new Error("No reply from AI");
      }
    } catch (error) {
      toast.error("Gagal mengirim pesan");
      setChatMessages([
        ...updatedMessages,
        { role: "model", content: "Maaf, terjadi kesalahan pada sistem AI." },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    try {
      await user.update({
        firstName: adminFirstName,
        lastName: adminLastName,
      });
      toast.success("Profil berhasil diperbarui");
    } catch (err: any) {
      toast.error("Gagal memperbarui profil", { description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    toast.info("Mengunggah foto profil...");
    try {
      await user.setProfileImage({ file });
      toast.success("Foto profil berhasil diperbarui");
    } catch (err: any) {
      toast.error("Gagal mengunggah foto", { description: err.message });
    }
  };

  const renderDashboard = () => (
    <>
      {/* Metric Cards - Vertical Stack */}
      <div className="flex flex-col gap-4">
        <Card className="border-zinc-200">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardDescription>Total Pendapatan</CardDescription>
              <CardTitle className="text-2xl mt-1">
                {format(1383328500)}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
              <TrendingUp className="w-4 h-4" />
              <span>+12.5%</span>
            </div>
          </CardHeader>
        </Card>

        <Card className="border-zinc-200 bg-slate-50">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardDescription>Pendapatan Bersih (Net Income)</CardDescription>
              <CardTitle className="text-2xl mt-1 text-slate-900">
                {format(1383328500 - 850000000)}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
              <TrendingUp className="w-4 h-4" />
              <span>+15.2%</span>
            </div>
          </CardHeader>
        </Card>

        <Card className="border-zinc-200">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardDescription>Total Pesanan</CardDescription>
              <CardTitle className="text-2xl mt-1">1,429</CardTitle>
            </div>
            <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
              <TrendingUp className="w-4 h-4" />
              <span>+8.2%</span>
            </div>
          </CardHeader>
        </Card>

        <Card className="border-zinc-200">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardDescription>Rata-rata Nilai Pesanan</CardDescription>
              <CardTitle className="text-2xl mt-1">
                {format(968440)}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
              <TrendingUp className="w-4 h-4" />
              <span>+3.1%</span>
            </div>
          </CardHeader>
        </Card>

        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardDescription className="text-red-900">
                Peringatan Stok Menipis
              </CardDescription>
              <CardTitle className="text-2xl text-red-900 mt-1">
                {products.filter((p) => p.stock <= 5).length}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-100 px-3 py-1.5 rounded-full">
              <AlertCircle className="w-4 h-4" />
              <span>Perhatian</span>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Prediksi Pengisian Stok Cerdas Chart */}
      <Card className="border-zinc-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Prediksi Pengisian Stok Cerdas</CardTitle>
              <CardDescription className="mt-1">
                Prakiraan penjualan didukung AI dengan data demografi, rating,
                dan event promo
              </CardDescription>
            </div>
            <Button
              onClick={runAiPrediction}
              disabled={isAiLoading}
              className="bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all duration-300 border-none"
            >
              {isAiLoading
                ? "Menganalisis..."
                : aiAnalysisComplete
                  ? "Segarkan Analisis"
                  : "Jalankan Analisis AI"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {aiAnalysisComplete && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-md">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm text-emerald-900 mb-1">
                    Rekomendasi Gemini AI
                  </h4>
                  <div className="text-sm text-emerald-800 whitespace-pre-wrap">
                    {aiRecommendation}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f172a" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="colorPredicted"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={12}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white border border-zinc-200 rounded-md shadow-lg p-3">
                          <p className="text-sm text-slate-900 mb-2">
                            {new Date(data.date).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                          {data.sales && (
                            <div className="flex items-center justify-between gap-4 mb-1">
                              <span className="text-xs text-slate-600">
                                Penjualan Aktual:
                              </span>
                              <span className="text-sm text-slate-900">
                                {format(data.sales)}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center justify-between gap-4 mb-2">
                            <span className="text-xs text-slate-600 dark:text-zinc-400">
                              Prediksi:
                            </span>
                            <span className="text-sm text-blue-600 dark:text-blue-400">
                              {format(Math.round(data.predicted))}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                            {
                              METRIC_ICON_MAP[
                                data.icon as keyof typeof METRIC_ICON_MAP
                              ]
                            }
                            <span className="text-xs text-slate-600 capitalize">
                              {data.factor}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: "20px" }}
                  iconType="circle"
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#0f172a"
                  strokeWidth={2}
                  fill="url(#colorSales)"
                  name="Actual Sales"
                />
                <Area
                  type="monotone"
                  dataKey="predicted"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="url(#colorPredicted)"
                  name="AI Prediction"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Demographics and Event Markers */}
          <div className="mt-6 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-slate-600">Rating Tinggi</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-slate-600">Trafik Generasi</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-slate-600">Flash Sale</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-500" />
              <span className="text-slate-600">Event Liburan</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventaris Alerts moved to Dashboard */}
      <Card className="border-zinc-200">
        <CardHeader>
          <CardTitle>Inventaris Alerts</CardTitle>
          <CardDescription>
            Produk yang membutuhkan pengisian stok segera
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {products
              .filter((p) => p.stock <= 5)
              .map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 border border-zinc-200 rounded-md hover:bg-zinc-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <div>
                      <h4 className="text-sm text-slate-900">{product.name}</h4>
                      <p className="text-xs text-slate-600 mt-1">
                        Kategori: {product.category}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="destructive" className="capitalize">
                      {product.stock === 0 ? "Habis" : `Sisa ${product.stock}`}
                    </Badge>
                    <Button
                      size="sm"
                      className="bg-slate-900 hover:bg-slate-800"
                    >
                      Pesan Ulang
                    </Button>
                  </div>
                </div>
              ))}
            {products.filter((p) => p.stock <= 5).length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">
                Semua produk saat ini memiliki stok aman.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );

  const renderInventory = () => (
    <>
      <Card className="border-zinc-200 mb-8">
        <CardHeader>
          <CardTitle>Tambah Produk Baru</CardTitle>
          <CardDescription>
            Tambahkan produk baru ke dalam inventaris database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddProduct} className="space-y-4 max-w-2xl">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-slate-700"
              >
                Nama Produk
              </label>
              <input
                required
                type="text"
                id="name"
                name="name"
                className="w-full px-3 py-2 border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="Kemeja Oxford"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="price"
                className="text-sm font-medium text-slate-700"
              >
                Harga Jual (Rp)
              </label>
              <input
                required
                type="text"
                id="price"
                name="price"
                className="w-full px-3 py-2 border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="129.000"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="cost"
                className="text-sm font-medium text-slate-700"
              >
                Modal Pembelian (Rp)
              </label>
              <input
                required
                type="text"
                id="cost"
                name="cost"
                className="w-full px-3 py-2 border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="85.000"
              />
              <p className="text-xs text-slate-500">
                Harga modal digunakan untuk perhitungan Pendapatan Bersih dan
                tidak ditampilkan kepada pembeli.
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="category"
                className="text-sm font-medium text-slate-700"
              >
                Kategori
              </label>
              <select
                required
                id="category"
                name="category"
                className="w-full px-3 py-2 border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="Pakaian Pria">Pakaian Pria</option>
                <option value="Pakaian Wanita">Pakaian Wanita</option>
                <option value="Unisex">Unisex</option>
                <option value="Aksesoris">Aksesoris</option>
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="images"
                className="text-sm font-medium text-slate-700"
              >
                Unggah Gambar (Maks 5)
              </label>
              <input
                required
                type="file"
                id="images"
                name="images"
                multiple
                accept="image/*"
                className="w-full px-3 py-2 border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="stock"
                className="text-sm font-medium text-slate-700"
              >
                Stok (Jumlah)
              </label>
              <input
                required
                type="number"
                id="stock"
                name="stock"
                min="0"
                className="w-full px-3 py-2 border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="10"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white mt-4"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Produk"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Product List */}
      <Card className="border-zinc-200">
        <CardHeader>
          <CardTitle>Daftar Produk</CardTitle>
          <CardDescription>
            Kelola produk yang tersedia di toko Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 border border-zinc-200 rounded-md hover:bg-zinc-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-zinc-100 rounded-sm overflow-hidden flex-shrink-0">
                    <img
                      src={product.images?.[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-900">
                      {product.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {product.category}
                    </p>
                    <p className="text-sm font-medium text-slate-900 mt-1">
                      {format(product.price)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={product.stock > 0 ? "secondary" : "destructive"}
                    className="capitalize"
                  >
                    {product.stock > 0 ? `Sisa: ${product.stock}` : "Habis"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingProduct(product)}
                    className="text-slate-400 hover:text-slate-900"
                  >
                    <Edit2 className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteProduct(product.id)}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <p className="text-center text-sm text-slate-500 py-8">
                Belum ada produk yang ditambahkan.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white border-none shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-zinc-100">
              <CardTitle>Edit Produk</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditingProduct(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="edit_name"
                    className="text-sm font-medium text-slate-700"
                  >
                    Nama Produk
                  </label>
                  <input
                    required
                    type="text"
                    id="edit_name"
                    name="name"
                    defaultValue={editingProduct.name}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="edit_price"
                    className="text-sm font-medium text-slate-700"
                  >
                    Harga Jual (Rp)
                  </label>
                  <input
                    required
                    type="text"
                    id="edit_price"
                    name="price"
                    defaultValue={editingProduct.price}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="edit_cost"
                    className="text-sm font-medium text-slate-700"
                  >
                    Modal Pembelian (Rp)
                  </label>
                  <input
                    required
                    type="text"
                    id="edit_cost"
                    name="cost"
                    defaultValue={editingProduct.cost || 0}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="edit_category"
                    className="text-sm font-medium text-slate-700"
                  >
                    Kategori
                  </label>
                  <select
                    required
                    id="edit_category"
                    name="category"
                    defaultValue={editingProduct.category}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-md"
                  >
                    <option value="Pakaian Pria">Pakaian Pria</option>
                    <option value="Pakaian Wanita">Pakaian Wanita</option>
                    <option value="Unisex">Unisex</option>
                    <option value="Aksesoris">Aksesoris</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="edit_stock"
                    className="text-sm font-medium text-slate-700"
                  >
                    Stok (Jumlah)
                  </label>
                  <input
                    required
                    type="number"
                    id="edit_stock"
                    name="stock"
                    min="0"
                    defaultValue={editingProduct.stock || 0}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-md"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-slate-900 text-white mt-4"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );

  const renderOrders = () => (
    <Card className="border-zinc-200">
      <CardHeader>
        <CardTitle>Pesanan Real-time</CardTitle>
        <CardDescription>
          Pesanan dari simulasi checkout pengguna
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-4 border border-zinc-200 rounded-md"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Order #{order.id}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Total: {format(order.total_amount)}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Item: {order.items.map((item: any) => item.name).join(", ")}
                </p>
              </div>
              <Badge variant="secondary" className="capitalize">
                {order.status}
              </Badge>
            </div>
          ))}
          {orders.length === 0 && (
            <p className="text-center text-sm text-slate-500 py-8">
              Belum ada pesanan.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderCustomers = () => (
    <Card className="border-zinc-200">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Data Pelanggan (Simulasi ML)</CardTitle>
          <CardDescription>
            Hasilkan data pengguna palsu real-time untuk prediksi ML
          </CardDescription>
        </div>
        <Button
          onClick={() => setIsSimulatingCustomers(!isSimulatingCustomers)}
          variant={isSimulatingCustomers ? "destructive" : "default"}
          className={
            !isSimulatingCustomers
              ? "bg-slate-900 hover:bg-slate-800 text-white"
              : ""
          }
        >
          {isSimulatingCustomers
            ? "Hentikan Simulasi"
            : "Mulai Simulasi Pelanggan"}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {customers.map((customer) => (
            <div
              key={customer.id}
              className="flex items-center justify-between p-4 border border-zinc-200 rounded-md"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {customer.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    DOB: {customer.dob}
                  </p>
                </div>
              </div>
              <Badge variant="secondary">{customer.generasi}</Badge>
            </div>
          ))}
          {customers.length === 0 && (
            <p className="text-center text-sm text-slate-500 py-8">
              Klik mulai simulasi untuk menghasilkan data pelanggan.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderChatAI = () => (
    <Card className="border-zinc-200 h-[calc(100vh-12rem)] flex flex-col">
      <CardHeader className="border-b border-zinc-100">
        <CardTitle>Konsultan Bisnis AI</CardTitle>
        <CardDescription>
          Ngobrol dengan Gemini AI untuk mendapatkan rekomendasi toko dan produk
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto p-4 space-y-4">
        {chatMessages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === "user"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-900"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isChatLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 text-slate-500 rounded-lg p-3 text-sm">
              Mengetik...
            </div>
          </div>
        )}
      </CardContent>
      <div className="p-4 border-t border-zinc-100">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Tanya tentang stok, performa toko, dll..."
            className="flex-1 px-4 py-2 border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
            disabled={isChatLoading}
          />
          <Button
            type="submit"
            disabled={isChatLoading || !chatInput.trim()}
            className="bg-slate-900 hover:bg-slate-800 text-white"
          >
            Kirim
          </Button>
        </form>
      </div>
    </Card>
  );

  const renderSettings = () => (
    <Card className="border-zinc-200 max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Pengaturan Profil Admin</CardTitle>
        <CardDescription>
          Kelola informasi akun administrator Anda
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-slate-200 overflow-hidden border border-zinc-200">
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <Users className="w-8 h-8" />
                </div>
              )}
            </div>
            <div>
              <label
                htmlFor="avatar-upload"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Ubah Foto Profil
              </label>
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100 cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="firstName"
                className="text-sm font-medium text-slate-700"
              >
                Nama Depan
              </label>
              <input
                type="text"
                id="firstName"
                value={adminFirstName}
                onChange={(e) => setAdminFirstName(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="lastName"
                className="text-sm font-medium text-slate-700"
              >
                Nama Belakang
              </label>
              <input
                type="text"
                id="lastName"
                value={adminLastName}
                onChange={(e) => setAdminLastName(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-slate-700"
            >
              Email Utama (Tidak dapat diubah)
            </label>
            <input
              type="email"
              id="email"
              value={user?.primaryEmailAddress?.emailAddress || ""}
              disabled
              className="w-full px-3 py-2 border border-zinc-200 bg-zinc-50 text-slate-500 rounded-md cursor-not-allowed"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-slate-900 hover:bg-slate-800 text-white w-full"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Profil"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-slate-950 transition-colors">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-zinc-200 dark:border-slate-800 flex flex-col transition-colors">
        <div className="h-16 flex items-center px-6 border-b border-zinc-200 dark:border-slate-800">
          <h1 className="text-xl tracking-tight text-slate-900 dark:text-white">LUMINA</h1>
          <Badge variant="secondary" className="ml-2 text-xs">
            Admin
          </Badge>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          <button
            onClick={() => setActiveNav("dashboard")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              activeNav === "dashboard"
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                : "text-slate-600 dark:text-slate-400 hover:bg-zinc-100 dark:hover:bg-slate-800"
            }`}
          >
            <Home className="w-4 h-4" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveNav("inventory")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              activeNav === "inventory"
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                : "text-slate-600 dark:text-slate-400 hover:bg-zinc-100 dark:hover:bg-slate-800"
            }`}
          >
            <Package className="w-4 h-4" />
            Produk
          </button>
          <button
            onClick={() => setActiveNav("orders")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              activeNav === "orders"
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                : "text-slate-600 dark:text-slate-400 hover:bg-zinc-100 dark:hover:bg-slate-800"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Pesanan
          </button>
          <button
            onClick={() => setActiveNav("predictions")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              activeNav === "predictions"
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                : "text-slate-600 dark:text-slate-400 hover:bg-zinc-100 dark:hover:bg-slate-800"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Chat AI
          </button>
          <button
            onClick={() => setActiveNav("customers")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              activeNav === "customers"
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                : "text-slate-600 dark:text-slate-400 hover:bg-zinc-100 dark:hover:bg-slate-800"
            }`}
          >
            <Users className="w-4 h-4" />
            Pelanggan
          </button>

          <Separator className="my-4 dark:bg-slate-800" />

          <button
            onClick={() => setActiveNav("settings")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              activeNav === "settings"
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                : "text-slate-600 dark:text-slate-400 hover:bg-zinc-100 dark:hover:bg-slate-800"
            }`}
          >
            <Settings className="w-4 h-4" />
            Pengaturan
          </button>
        </nav>

        <div className="p-3 border-t border-zinc-200 dark:border-slate-800">
          <button
            onClick={() => signOut({ redirectUrl: "/" })}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-slate-600 dark:text-slate-400 hover:bg-zinc-100 dark:hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-zinc-200 dark:border-slate-800 flex items-center justify-between px-8 transition-colors">
          <div>
            <h2 className="text-xl text-slate-900 dark:text-white">Dashboard</h2>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mt-1">
              <span>Beranda</span>
              <ChevronRight className="w-3 h-3" />
              <span>dashboard</span>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {activeNav === "dashboard" && renderDashboard()}
          {activeNav === "inventory" && renderInventory()}
          {activeNav === "orders" && renderOrders()}
          {activeNav === "customers" && renderCustomers()}
          {activeNav === "predictions" && renderChatAI()}
          {activeNav === "settings" && renderSettings()}
          {activeNav !== "dashboard" &&
            activeNav !== "inventory" &&
            activeNav !== "orders" &&
            activeNav !== "customers" &&
            activeNav !== "predictions" &&
            activeNav !== "settings" && (
              <div className="text-center py-20 text-slate-500 dark:text-slate-400">
                Fitur {activeNav} sedang dalam pengembangan.
              </div>
            )}
        </div>
      </main>
    </div>
  );
}
