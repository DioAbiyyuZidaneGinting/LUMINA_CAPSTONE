"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CreditCard,
  CheckCircle2,
  MoreHorizontal,
  Eye,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { useTranslation } from "@/store/languageStore";
import { useSupabaseClient } from "@/hooks/useSupabaseClient";
import OrderActionManager, { DrawerType } from "./drawers/OrderActionManager";
import { updateOrderStatus, updatePaymentStatus } from "@/app/actions/orders";

interface Order {
  id: string;      // User-friendly order_number (e.g. LUMINA-8821)
  dbId: string;    // Database UUID primary key
  customer: string;
  city: string;    // Restored city/kabupaten display
  avatar: string;
  date: string;
  total: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "COMPLETED" | "CANCELLED";
  payment: "PAID" | "PENDING";
  items: number;
}

const STATUS_CONFIG = {
  COMPLETED: { bg: "bg-emerald-100 dark:bg-emerald-500/20", text: "text-emerald-800 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-500/30", dot: "bg-emerald-500" },
  PROCESSING: { bg: "bg-blue-100 dark:bg-blue-500/20", text: "text-blue-800 dark:text-blue-300", border: "border-blue-200 dark:border-blue-500/30", dot: "bg-blue-500" },
  SHIPPED: { bg: "bg-violet-100 dark:bg-violet-500/20", text: "text-violet-800 dark:text-violet-300", border: "border-violet-200 dark:border-violet-500/30", dot: "bg-violet-500" },
  PENDING: { bg: "bg-amber-100 dark:bg-amber-500/20", text: "text-amber-800 dark:text-amber-300", border: "border-amber-200 dark:border-amber-500/30", dot: "bg-amber-500" },
  CANCELLED: { bg: "bg-red-100 dark:bg-red-500/20", text: "text-red-800 dark:text-red-300", border: "border-red-200 dark:border-red-500/30", dot: "bg-red-500" },
};

const PAYMENT_CONFIG = {
  PAID: { bg: "bg-cyan-100 dark:bg-cyan-500/20", text: "text-cyan-800 dark:text-cyan-300" },
  PENDING: { bg: "bg-amber-100 dark:bg-amber-500/20", text: "text-amber-800 dark:text-amber-300" },
};

export default function OrdersTable() {
  const { t, formatDate } = useTranslation();
  const supabase = useSupabaseClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [sortKey, setSortKey] = useState("date");
  const [currentPage, setCurrentPage] = useState(1);
  const { format } = useFormatCurrency();
  const ITEMS_PER_PAGE = 7;

  const [activeDrawer, setActiveDrawer] = useState<DrawerType>(null);
  const [drawerOrderId, setDrawerOrderId] = useState<string | null>(null);

  // Advanced Filters states
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [cityFilter, setCityFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const openDrawer = (type: DrawerType, newOrderId?: string) => {
    setActiveDrawer(type);
    if (newOrderId) setDrawerOrderId(newOrderId);
  };

  const closeDrawer = () => {
    setActiveDrawer(null);
    setDrawerOrderId(null);
  };

  const filters = ["ALL", "PENDING", "PROCESSING", "SHIPPED", "COMPLETED", "CANCELLED"];

  // 1. Fetch live orders from Supabase
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await (supabase as any)
        .from("orders")
        .select(`
          *,
          order_items (
            quantity
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mappedOrders: Order[] = (data || []).map((o: any) => {
        const initials = o.customer_name
          ? o.customer_name
              .split(" ")
              .map((p: string) => p[0])
              .join("")
              .substring(0, 2)
              .toUpperCase()
          : "??";

        const totalItems = o.order_items
          ? o.order_items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0)
          : 0;

        return {
          id: o.order_number || `#${o.id.substring(0, 8)}`,
          dbId: o.id,
          customer: o.customer_name,
          city: o.city || "", // Restored city field!
          avatar: initials,
          date: o.created_at,
          total: Number(o.total_amount || 0),
          status: (o.status || "pending").toUpperCase() as any,
          payment: (o.payment_status || "pending").toUpperCase() === "PAID" ? "PAID" : "PENDING",
          items: totalItems,
        };
      });

      setOrders(mappedOrders);
    } catch (err) {
      console.error("Gagal mengambil data pesanan:", err);
      toast.error("Gagal mengambil data pesanan dari database.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const handleRefresh = () => {
      fetchOrders();
    };

    const handleToggleFilters = () => {
      setShowAdvancedFilters((prev) => !prev);
    };

    window.addEventListener("refresh-orders", handleRefresh);
    window.addEventListener("toggle-advanced-filters", handleToggleFilters);
    
    const channel = (supabase as any).channel('admin-orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      window.removeEventListener("refresh-orders", handleRefresh);
      window.removeEventListener("toggle-advanced-filters", handleToggleFilters);
      (supabase as any).removeChannel(channel);
    };
  }, []);

  const filtered = orders.filter((o) => {
    // 1. Status Filter
    const matchFilter = filter === "ALL" || o.status === filter;
    
    // 2. Search Keyword Filter
    const matchSearch =
      search === "" ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.city.toLowerCase().includes(search.toLowerCase());

    // 3. Payment Status Filter
    const matchPayment = paymentFilter === "ALL" || o.payment === paymentFilter;

    // 4. City specific Filter
    const matchCity = cityFilter === "" || o.city.toLowerCase().includes(cityFilter.toLowerCase());

    // 5. Date Range Filter
    let matchDate = true;
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const orderDate = new Date(o.date);
      matchDate = matchDate && orderDate >= start;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      const orderDate = new Date(o.date);
      matchDate = matchDate && orderDate <= end;
    }

    return matchFilter && matchSearch && matchPayment && matchCity && matchDate;
  });

  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const toggleExpand = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, search, paymentFilter, cityFilter, startDate, endDate]);

  // 2. Write status change updates directly back to Supabase via Server Actions
  const handleStatusChange = async (orderId: string, newStatus: Order["status"]) => {
    const orderObj = orders.find(o => o.id === orderId);
    if (!orderObj) return;

    // Optimistic UI Update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    try {
      const result = await updateOrderStatus(orderObj.dbId, newStatus);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      const statusLabel = t(`common.status.${newStatus.toLowerCase()}` as any);
      toast.success(t("orders.toast.statusUpdated", { id: orderId, status: statusLabel }) || `Status pesanan ${orderId} diubah menjadi ${statusLabel}`);
    } catch (err: any) {
      console.error("Gagal memperbarui status pesanan:", err);
      toast.error(`Gagal memperbarui status di database: ${err.message}`);
      
      // Revert Optimistic Update
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: orderObj.status } : o))
      );
    }
  };

  const handlePaymentChange = async (orderId: string, newPayment: Order["payment"]) => {
    const orderObj = orders.find(o => o.id === orderId);
    if (!orderObj) return;

    // Optimistic UI Update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, payment: newPayment } : o))
    );

    try {
      const result = await updatePaymentStatus(orderObj.dbId, newPayment);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      const paymentLabel = newPayment === "PAID" ? "Lunas" : "Pending";
      toast.success(`Status pembayaran pesanan ${orderId} diubah menjadi ${paymentLabel}`);
    } catch (err: any) {
      console.error("Gagal memperbarui status pembayaran:", err);
      toast.error(`Gagal memperbarui status pembayaran di database: ${err.message}`);
      
      // Revert Optimistic Update
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, payment: orderObj.payment } : o))
      );
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm p-12 flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800 dark:border-white mb-4"></div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Memuat data pesanan...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full group">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("orders.table.searchPlaceholder")}
            className="w-full bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider rounded-md transition-all whitespace-nowrap ${
                filter === f
                  ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20"
                  : "bg-transparent text-slate-500 border border-transparent hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              {f === "ALL" ? t("orders.table.filter.all") : t(`common.status.${f.toLowerCase()}` as any)}
            </button>
          ))}
        </div>
      </div>

      {showAdvancedFilters && (
        <div className="p-4 bg-slate-50/30 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-4 animate-in slide-in-from-top duration-300">
          {/* Payment Status */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status Pembayaran</span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all"
            >
              <option value="ALL">Semua</option>
              <option value="PAID">Lunas</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
          
          {/* City Filter */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Kota Pengiriman</span>
            <input
              type="text"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              placeholder="Cari Kota..."
              className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all"
            />
          </div>
          
          {/* Start Date */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tanggal Mulai</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all"
            />
          </div>
          
          {/* End Date */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tanggal Selesai</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all"
            />
          </div>
        </div>
      )}

      <div className="hidden lg:grid grid-cols-[40px_2.5fr_1.5fr_1.5fr_1.2fr_48px] gap-4 px-6 py-3 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100/50 dark:border-slate-800">
        {[
          { label: t("orders.table.column.info"), key: "id" },
          { label: t("orders.table.column.status"), key: "status" },
          { label: t("orders.table.column.payment"), key: "payment" },
          { label: t("orders.table.column.amount"), key: "total" },
          { label: "", key: "" },
        ].map((col, i) => (
          <button
            key={i}
            onClick={() => col.key && toggleSort(col.key)}
            className={`flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors text-left ${i === 0 ? "col-span-2" : ""}`}
          >
            {col.label}
            {col.key === sortKey && (sortDir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)}
          </button>
        ))}
      </div>

      <div className="divide-y divide-slate-50 dark:divide-slate-800">
        {paginated.map((order) => {
          const status = STATUS_CONFIG[order.status];
          const payment = PAYMENT_CONFIG[order.payment];
          const isExpanded = expandedRow === order.id;
          const localizedPaymentLabel = order.payment === "PAID" ? t("orders.table.payment.paid") : "Pending";

          return (
            <div key={order.id}>
              <div className={`px-6 py-4 transition-all duration-300 ${isExpanded ? "bg-indigo-50/10 dark:bg-indigo-500/5" : "hover:bg-slate-50/50 dark:hover:bg-slate-800/50"}`}>
                <div className="flex lg:hidden flex-col gap-4">
                  <div className="flex items-start justify-between cursor-pointer" onClick={() => toggleExpand(order.id)}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">{order.avatar}</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">{order.id}</p>
                        {/* RESTORED: City display under customer name */}
                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          {order.customer} {order.city ? `| ${order.city}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">{format(order.total)}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as Order["status"])}
                      className={`text-[10px] font-medium uppercase tracking-wider px-2 py-1 rounded-md border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${status.bg} ${status.text} ${status.border}`}
                    >
                      <option value="PENDING">{t("common.status.pending")}</option>
                      <option value="PROCESSING">{t("common.status.processing")}</option>
                      <option value="SHIPPED">{t("common.status.shipped")}</option>
                      <option value="COMPLETED">{t("common.status.completed")}</option>
                      <option value="CANCELLED">{t("common.status.cancelled")}</option>
                    </select>

                    <select
                      value={order.payment}
                      onChange={(e) => handlePaymentChange(order.id, e.target.value as Order["payment"])}
                      className={`text-[10px] font-medium uppercase tracking-wider px-2 py-1 rounded-md border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${payment.bg} ${payment.text} ${payment.bg === 'bg-emerald-50/50' ? 'border-emerald-200' : 'border-amber-200'}`}
                    >
                      <option value="PENDING">Payment: Pending</option>
                      <option value="PAID">Payment: Paid</option>
                    </select>
                  </div>
                </div>

                <div className="hidden lg:grid grid-cols-[40px_2.5fr_1.5fr_1.5fr_1.2fr_48px] gap-4 items-center">
                  <div className="flex items-center justify-center cursor-pointer" onClick={() => toggleExpand(order.id)}>
                    <div className={`w-5 h-5 flex items-center justify-center transition-colors ${isExpanded ? "" : "opacity-0 group-hover:opacity-100"}`}>
                      <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isExpanded ? "rotate-90 text-indigo-500" : ""}`} />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 min-w-0 cursor-pointer" onClick={() => toggleExpand(order.id)}>
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200/50 dark:border-slate-700">
                      <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">{order.avatar}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-semibold text-slate-900 dark:text-white">{order.id}</p>
                      </div>
                      {/* RESTORED: City display under customer name */}
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                        {order.customer} {order.city ? `| ${order.city}` : ""}
                      </p>
                    </div>
                  </div>

                  <div>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as Order["status"])}
                      className={`text-[10px] font-medium uppercase tracking-wider px-2 py-1 rounded-md border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer ${status.bg} ${status.text} ${status.border}`}
                    >
                      <option value="PENDING">{t("common.status.pending")}</option>
                      <option value="PROCESSING">{t("common.status.processing")}</option>
                      <option value="SHIPPED">{t("common.status.shipped")}</option>
                      <option value="COMPLETED">{t("common.status.completed")}</option>
                      <option value="CANCELLED">{t("common.status.cancelled")}</option>
                    </select>
                  </div>

                  <div>
                    <select
                      value={order.payment}
                      onChange={(e) => handlePaymentChange(order.id, e.target.value as Order["payment"])}
                      className={`text-[10px] font-medium uppercase tracking-wider px-2 py-1 rounded-md border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer ${payment.bg} ${payment.text} ${payment.bg === 'bg-emerald-50/50' ? 'border-emerald-200' : 'border-amber-200'}`}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="PAID">Paid</option>
                    </select>
                  </div>

                  <div className="cursor-pointer" onClick={() => toggleExpand(order.id)}>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{format(order.total)}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                      {t("orders.table.items", { count: order.items }, order.items) || `${order.items} items`}
                    </p>
                  </div>

                  <div className="flex items-center justify-end">
                    <button className="w-7 h-7 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                <div className="overflow-hidden">
                  <div className="bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100/60 dark:border-slate-800 px-6 py-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-5 flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" /> {t("orders.table.details.order")}
                        </p>
                        <div className="space-y-4">
                           <div className="flex justify-between">
                             <span className="text-[11px] text-slate-500">{t("orders.table.details.date")}</span>
                             <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">{formatDate(order.date)}</span>
                           </div>
                           <div className="flex justify-between">
                             <span className="text-[11px] text-slate-500">{t("orders.table.details.items")}</span>
                             <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                               {t("orders.table.items", { count: order.items }, order.items) || `${order.items} items`}
                             </span>
                           </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-5 flex items-center gap-2">
                          <MoreHorizontal className="w-3.5 h-3.5 text-slate-400" /> {t("orders.table.details.quickActions")}
                        </p>
                        <div className="space-y-2.5">
                          {[
                            { label: t("orders.table.details.viewFull"), icon: Eye, type: "ORDER" as DrawerType, primary: true },
                            { label: t("orders.table.details.messageCustomer"), icon: MessageCircle, type: "CHAT" as DrawerType, primary: false },
                          ].map((action, i) => {
                            const ActionIcon = action.icon;
                            return (
                              <button
                                key={i}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Pass the database UUID dbId so details can query it relasional!
                                  openDrawer(action.type, order.dbId);
                                }}
                                className={`w-full flex items-center gap-2.5 px-4 py-2 rounded-lg text-[11px] font-medium transition-all ${
                                  action.primary
                                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100"
                                    : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white"
                                }`}
                              >
                                <ActionIcon className="w-3.5 h-3.5" />
                                {action.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length > ITEMS_PER_PAGE && (
        <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100/50 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-4">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-medium text-slate-400">
              {t("orders.table.showing")} {(currentPage - 1) * ITEMS_PER_PAGE + 1} {t("orders.table.to")}{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} {t("orders.table.of")}{" "}
              {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.ceil(filtered.length / ITEMS_PER_PAGE) }).map(
                (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentPage(pageNum);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className={`w-7 h-7 rounded-md text-[11px] font-medium transition-all ${
                        pageNum === currentPage
                          ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                          : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
              )}
            </div>
          </div>
        </div>
      )}

      <OrderActionManager 
        isOpen={activeDrawer !== null}
        activeView={activeDrawer}
        orderId={drawerOrderId}
        onClose={closeDrawer}
        onNavigate={openDrawer}
      />
    </div>
  );
}
