import { supabase } from "../lib/supabase";

export const ProductsRepository = {
  async getAllProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (error) {
      console.error("ProductsRepository - Error fetching products:", error);
      throw error;
    }
    return data || [];
  },

  subscribeToProducts(callback: (payload: any) => void) {
    return supabase
      .channel("public:products")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, callback)
      .subscribe();
  },

  unsubscribe(channel: any) {
    supabase.removeChannel(channel);
  }
};
