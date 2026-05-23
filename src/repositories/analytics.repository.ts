import { supabase } from "../lib/supabase";

export const AnalyticsRepository = {
  async getHistoricalSales(days: number = 30) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    const startDateString = date.toISOString();

    const { data, error } = await supabase
      .from("orders")
      .select("created_at, total_amount, id")
      .gte("created_at", startDateString)
      .order("created_at", { ascending: true });
      
    if (error) {
      console.error("AnalyticsRepository - Error fetching historical data:", error);
      throw error;
    }
    return data || [];
  }
};
