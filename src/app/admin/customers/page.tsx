"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  MapPin,
  TrendingUp,
  Package,
  Wallet,
  UserPlus,
  Inbox,
  Calendar,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  Download,
  X,
  Plus
} from "lucide-react";
import { useLanguageStore, translations } from "@/store/languageStore";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { useNotificationStore } from "@/store/notificationStore";
import { toast } from "sonner";
import { getAdminCustomers, addAdminCustomer } from "@/app/actions/customers";

interface Customer {
  id: string;
  clerk_user_id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  totalSpent: number;
  location: string;
  birthYear: number;
  lastOrderAt: string | null;
  createdAt: string;
}

function getGeneration(birthYear: number, t: any) {
  const year = Number(birthYear);
  if (year >= 1946 && year <= 1964) {
    return { 
      label: t.babyBoomer || "Baby Boomer", 
      color: "bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20" 
    };
  }
  if (year >= 1965 && year <= 1976) {
    return { 
      label: t.genX || "Gen X", 
      color: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20" 
    };
  }
  if (year >= 1977 && year <= 1994) {
    return { 
      label: t.genY || "Gen Y / Millennial", 
      color: "bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20" 
    };
  }
  if (year >= 1995 && year <= 2010) {
    return { 
      label: t.genZ || "Gen Z", 
      color: "bg-violet-50 text-violet-600 border-violet-100 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20" 
    };
  }
  if (year >= 2011 && year <= 2025) {
    return { 
      label: t.genAlpha || "Gen Alpha", 
      color: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" 
    };
  }
  return { 
    label: t.unknown || "Unknown", 
    color: "bg-slate-50 text-slate-500 border-slate-100 dark:bg-slate-800 dark:text-slate-400" 
  };
}

export default function CustomersPage() {
  const { language } = useLanguageStore();
  const t = translations[language] as any;
  const { format, formatAbbreviated } = useFormatCurrency();
  const { addNotification } = useNotificationStore();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Metrics states
  const [totalCustomersCount, setTotalCustomersCount] = useState(0);
  const [newCustomersCount, setNewCustomersCount] = useState(0);
  const [totalOrdersCount, setTotalOrdersCount] = useState(0);
  const [avgSpendingAmount, setAvgSpendingAmount] = useState(0);

  // Add Customer Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newBirthYear, setNewBirthYear] = useState("2000");
  const [newClerkId, setNewClerkId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch all customers & aggregate KPI summaries from Supabase
  const fetchCustomers = useCallback(async () => {
    try {
      setRefreshing(true);
      
      const response = await getAdminCustomers();

      if (!response.success) throw new Error(response.error);

      // Map to UI Structure
      const mapped: Customer[] = (response.customers || []).map((c: any) => ({
        id: c.id,
        clerk_user_id: c.clerk_user_id,
        name: c.name,
        email: c.email,
        phone: c.phone || "",
        orders: Number(c.total_orders || 0),
        totalSpent: Number(c.lifetime_value || 0.00),
        location: c.city || "Jakarta",
        birthYear: Number(c.birth_year || 2000),
        lastOrderAt: c.last_order_at,
        createdAt: c.created_at
      }));

      setCustomers(mapped);

      // 3. Compute Metrics Summaries
      setTotalCustomersCount(mapped.length);

      // New users inside last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const newUsers = mapped.filter(c => new Date(c.createdAt) >= thirtyDaysAgo).length;
      setNewCustomersCount(newUsers);

      // Total orders count
      const totalOrders = (response.orders as any[])?.length || 0;
      setTotalOrdersCount(totalOrders);

      // Average spending amount
      const totalRev = (response.orders as any[])?.reduce((sum, o) => sum + Number(o.total_amount || 0), 0) || 0;
      const avgSpending = totalOrders > 0 ? totalRev / totalOrders : 0;
      setAvgSpendingAmount(avgSpending);

    } catch (err: any) {
      console.error("Gagal memuat customer database:", err.message);
      toast.error(t.failedFetchCustomers || "Gagal mengambil data dari database");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Synchronize on refresh-customers window-level triggers
  useEffect(() => {
    const handleRefresh = () => fetchCustomers();
    window.addEventListener("refresh-customers", handleRefresh);
    return () => window.removeEventListener("refresh-customers", handleRefresh);
  }, [fetchCustomers]);

  // Filter registry items in-memory based on search keywords (Name, email, phone, city, generation)
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const gen = getGeneration(c.birthYear, t).label.toLowerCase();
      const search = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search) ||
        c.phone.toLowerCase().includes(search) ||
        c.location.toLowerCase().includes(search) ||
        gen.includes(search)
      );
    });
  }, [customers, searchQuery, t]);

  // Export Customer registry entries to local CSV format
  const handleExportRegistry = () => {
    try {
      if (filteredCustomers.length === 0) {
        toast.warning(t.emptyRegistryExport || "Daftar kosong, tidak ada data untuk diekspor");
        return;
      }

      // Compile rows with escaped variables
      const csvContent = [
        "Nomor Entitas,ID Clerk,Nama Pelanggan,Email,Telepon,Kota,Generasi,Tahun Lahir,Jumlah Pesanan,Lifetime Value (LTV),Tanggal Registrasi",
        ...filteredCustomers.map((c, i) => [
          `LUM-${c.id.substring(0, 8).toUpperCase()}`,
          c.clerk_user_id,
          `"${c.name}"`,
          c.email,
          `'${c.phone}`,
          `"${c.location}"`,
          `"${getGeneration(c.birthYear, t).label}"`,
          c.birthYear,
          c.orders,
          c.totalSpent,
          new Date(c.createdAt).toLocaleDateString()
        ].join(","))
      ].join("\n");

      // Trigger automatic file download stream
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const dateStr = new Date().toISOString().split("T")[0];
      
      link.href = url;
      link.setAttribute("download", `customers-export-${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(t.exportRegistrySuccess || "Registry berhasil diekspor ke CSV!");
    } catch (err: any) {
      console.error("Gagal melakukan export CSV:", err);
      toast.error(t.exportRegistryFailed || "Gagal mengekspor data");
    }
  };

  // Submit manual Customer Insertion into Supabase
  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) {
      toast.error(t.formIncomplete || "Mohon lengkapi Nama dan Email!");
      return;
    }

    setSubmitting(true);
    try {
      const finalClerkId = newClerkId.trim() || `user_manual_${Math.random().toString(36).substring(2, 11)}`;

      const response = await addAdminCustomer({
        clerk_user_id: finalClerkId,
        name: newName,
        email: newEmail,
        phone: newPhone || null,
        birth_year: Number(newBirthYear) || 2000,
        city: newCity || "Jakarta",
      });

      if (!response.success) throw new Error(response.error);

      toast.success(t.addCustomerSuccess || "Pelanggan baru berhasil didaftarkan!");
      
      // Dispatch refresh broadcast
      window.dispatchEvent(new CustomEvent("refresh-customers"));
      
      // Reset Modal States
      setIsAddModalOpen(false);
      setNewName("");
      setNewEmail("");
      setNewPhone("");
      setNewCity("");
      setNewBirthYear("2000");
      setNewClerkId("");

      addNotification({
        title: "Pelanggan Baru Didaftarkan",
        description: `${newName} berhasil didaftarkan ke dalam CRM secara manual.`,
        type: "SUCCESS",
        source: "CRM"
      });
      
    } catch (err: any) {
      console.error("Gagal menyimpan customer:", err);
      toast.error(err.message || t.addCustomerFailed || "Gagal menyimpan customer baru");
    } finally {
      setSubmitting(false);
    }
  };

  const stats = [
    { 
      label: t.totalCustomers || "Total Customers", 
      value: loading ? "..." : totalCustomersCount.toLocaleString(), 
      subtitle: t.totalCustomersDesc || "Active profiles across Lumina ecosystem.",
      icon: <Users className="w-5 h-5" />,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-500/10"
    },
    { 
      label: t.newCustomers || "New Customers", 
      value: loading ? "..." : `+${newCustomersCount}`, 
      subtitle: t.newCustomersDesc || "Registration velocity last 30 days.",
      icon: <UserPlus className="w-5 h-5" />,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-500/10"
    },
    { 
      label: t.totalOrders || "Total Orders", 
      value: loading ? "..." : totalOrdersCount.toLocaleString(), 
      subtitle: t.totalOrdersDesc || "Successful transaction conversions.",
      icon: <Package className="w-5 h-5" />,
      color: "text-violet-600",
      bg: "bg-violet-50 dark:bg-violet-500/10"
    },
    { 
      label: t.avgSpending || "Avg Spending", 
      value: loading ? "..." : formatAbbreviated(avgSpendingAmount), 
      subtitle: t.avgSpendingDesc || "Mean transaction value per unit.",
      icon: <Wallet className="w-5 h-5" />,
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-500/10"
    },
  ];

  return (
    <div className="p-8 md:p-12 max-w-[1600px] mx-auto space-y-12 animate-in fade-in duration-700 dark:bg-slate-950 min-h-screen transition-colors">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-10 bg-blue-600 rounded-full shadow-lg shadow-blue-600/20" />
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
              {t.customersTitleHeader || "Customer Database"}
            </h1>
          </div>
          <p className="text-slate-400 dark:text-slate-500 font-medium text-xl mt-2 max-w-lg leading-snug">
            {t.customersSubtitle || "Monitor and manage global customer demographic intelligence."}
          </p>
        </div>

        {/* Global Toolbar */}
        <button 
          onClick={fetchCustomers}
          disabled={refreshing}
          className="self-start px-5 py-3.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-sm hover:scale-105 active:scale-95 transition-all duration-300"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
          {refreshing ? (t.loadingText || "LOADING") : (t.refreshBtn || "PERBARUI")}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl hover:shadow-blue-200/20 transition-all duration-500 group">
            <div className="flex items-center gap-6 mb-6">
              <div className={`w-14 h-14 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                {s.icon}
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{s.value}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 font-medium leading-relaxed group-hover:text-slate-500 dark:group-hover:text-slate-300 transition-colors">
              {s.subtitle}
            </p>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3rem] shadow-sm overflow-hidden transition-colors">
        {/* Search Bar Section */}
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between gap-6 flex-wrap bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative max-w-lg w-full group">
            <Search className="w-5 h-5 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text" 
              placeholder={t.searchCustomersPlaceholder || "Cari nama, email, kota, atau generasi..."} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all placeholder:text-slate-400 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-3">
             <button 
               onClick={handleExportRegistry}
               className="px-6 py-4 bg-white dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-600 hover:text-blue-600 flex items-center gap-2 transition-all shadow-sm"
             >
               <Download className="w-3.5 h-3.5" />
               {t.exportRegistry || "Export Registry"}
             </button>
             <button 
               onClick={() => setIsAddModalOpen(true)}
               className="px-6 py-4 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 flex items-center gap-2 transition-all active:scale-95"
             >
               <Plus className="w-3.5 h-3.5" />
               {t.addNewCustomer || "Add New Entity"}
             </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Memuat Customer CRM...</p>
            </div>
          ) : filteredCustomers.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/30 dark:bg-slate-800/30 border-b border-slate-50 dark:border-slate-800">
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.entityName || "Customer Entity"}</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t.generation || "Generation"}</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.contactChannels || "Contact Channels"}</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.region || "Geographic Region"}</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t.ordersCount || "Orders"}</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">{t.lifetimeValue || "Lifetime Value"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {filteredCustomers.map((c) => {
                  const gen = getGeneration(c.birthYear, t);
                  return (
                    <tr key={c.id} className="group hover:bg-blue-50/30 dark:hover:bg-blue-500/5 cursor-pointer transition-all duration-300">
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-6">
                          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center text-blue-600 font-black text-base shadow-sm group-hover:scale-110 transition-transform">
                            {c.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-base font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors tracking-tight">{c.name}</p>
                            <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-tighter flex items-center gap-2">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> ID: LUM-{c.id.substring(0, 8).toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-center">
                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${gen.color}`}>
                          {gen.label}
                        </span>
                      </td>
                      <td className="px-10 py-8">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                            <Mail className="w-3.5 h-3.5 text-blue-500" /> {c.email}
                          </div>
                          {c.phone && (
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                              <Phone className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" /> {c.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                          <MapPin className="w-4 h-4 text-rose-500" /> {c.location}
                        </div>
                      </td>
                      <td className="px-10 py-8 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-black shadow-sm group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all">
                          {c.orders}
                        </div>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <p className="text-base font-black text-slate-900 dark:text-white tracking-tight">{format(c.totalSpent)}</p>
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase">
                             <TrendingUp className="w-3 h-3" /> LTV-ACTIVE
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-32 px-10 text-center space-y-8 animate-in fade-in duration-700">
              <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center shadow-inner">
                <Inbox className="w-10 h-10 text-slate-200 dark:text-slate-700" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t.emptyCustomersTitle || "No Entities Detected"}</h3>
                <p className="text-slate-400 dark:text-slate-500 max-w-sm mx-auto font-medium text-lg leading-relaxed">
                  {t.emptyCustomersDesc || "Customer intelligence will populate once entities engage with the Lumina ecosystem."}
                </p>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all"
              >
                <UserPlus className="w-4 h-4" /> Register First Entity
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-900/30">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
             Showing <span className="text-slate-900 dark:text-white">1 - {filteredCustomers.length}</span> of {totalCustomersCount} total entities
           </p>
           <div className="flex items-center gap-3">
              <button className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 hover:text-blue-600 transition-all disabled:opacity-30" disabled>
                 <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
              <button className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 hover:text-blue-600 transition-all" disabled>
                 <ChevronRight className="w-4 h-4" />
              </button>
           </div>
        </div>
      </div>

      {/* Add New Customer Entity Premium Modal Dialog */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 dark:bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-6 z-50 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col">
            {/* Header */}
            <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-900/30">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-7 bg-blue-600 rounded-full shadow-lg shadow-blue-600/20" />
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
                  {t.addNewCustomerTitle || "Register New Customer"}
                </h2>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-2xl text-slate-500 transition-all active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddCustomer} className="p-8 space-y-6 flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {t.customerNameLabel || "Full Name"} <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Budi Santoso"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition-all dark:text-white"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {t.emailAddressLabel || "Email Address"} <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="email" 
                    required
                    placeholder="e.g. budi.s@email.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition-all dark:text-white"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {t.phoneLabel || "Phone Number"}
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. +62 812-3456-7890"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition-all dark:text-white"
                  />
                </div>

                {/* City */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {t.cityLabel || "City / Location"}
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Jakarta Selatan"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition-all dark:text-white"
                  />
                </div>

                {/* Birth Year */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {t.birthYearLabel || "Birth Year (Cohort Classification)"}
                  </label>
                  <input 
                    type="number" 
                    min="1900"
                    max={new Date().getFullYear()}
                    placeholder="e.g. 2000"
                    value={newBirthYear}
                    onChange={(e) => setNewBirthYear(e.target.value)}
                    className="w-full bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition-all dark:text-white"
                  />
                </div>

                {/* Optional Clerk ID */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center justify-between">
                    <span>{t.clerkIdLabel || "Clerk User ID"}</span>
                    <span className="text-[9px] font-medium lowercase text-slate-500">Optional</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. user_3DJASQ20Ek..."
                    value={newClerkId}
                    onChange={(e) => setNewClerkId(e.target.value)}
                    className="w-full bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition-all dark:text-white"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-6 py-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 rounded-xl border border-slate-200 dark:border-slate-700 transition-all active:scale-95"
                >
                  {t.cancelBtn || "Cancel"}
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-4 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      {t.submittingText || "REGISTRASI..."}
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      {t.saveCustomerBtn || "Daftarkan Entitas"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
