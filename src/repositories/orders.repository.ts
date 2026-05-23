import { supabase } from "../lib/supabase";

export const OrdersRepository = {
  async getRecentOrders(limit: number = 500) {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error("OrdersRepository - Error fetching recent orders:", error);
      throw error;
    }
    return data || [];
  },

  async getAllOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (error) {
      console.error("OrdersRepository - Error fetching all orders:", error);
      throw error;
    }
    return data || [];
  },

  subscribeToOrders(callback: (payload: any) => void) {
    return supabase
      .channel("public:orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, callback)
      .subscribe();
  },

  unsubscribe(channel: any) {
    supabase.removeChannel(channel);
  }
};
